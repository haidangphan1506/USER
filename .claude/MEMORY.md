# Backend Memory — user (identity/admin domain)

## Project Structure

```
user/
├── src/
│   ├── main.ts                    # Bootstrap: ensureKafkaTopics() pre-create, Kafka microservice
│   │                              # (deferred init, its own RpcExceptionFilter/TraceContextInterceptor),
│   │                              # CORS, HTTP interceptors/filters, listen (port 8888)
│   ├── app.module.ts              # Root module (imports all feature modules)
│   ├── app.controller.ts          # Health-check controller
│   ├── app.service.ts             # Health-check service
│   ├── database/
│   │   ├── database.module.ts     # Global Drizzle ORM provider
│   │   └── schema.ts              # Live tables: users, grades (everything else trimmed 2026-09-12)
│   ├── features/
│   │   ├── auth/       # HTTP controller + auth.rpc.controller.ts (@MessagePattern responder) + service
│   │                # (also emits fire-and-forget login-session tracking via Kafka — see below)
│   │   ├── user/        # HTTP controller + user.rpc.controller.ts + service + repository
│   │   ├── admin/       # Generic managed-user CRUD (/admin/students, /admin/tutors) + admin.rpc.controller.ts
│   │   ├── student/     # Student-specific surface (parent linking + profile) + student.rpc.controller.ts
│   │   └── kafka/        # KafkaProducer (send/emit + trace headers) + kafka.constants.ts topic
│   │                      # lists + kafka.admin.ts ensureKafkaTopics() — see "Kafka RPC Plumbing" below
│   └── packages/         # Shared utilities
│       ├── configs/      # JWT sign config
│       ├── decorators/   # @ApiResponse, @Public, @Roles, @CurrentUser decorators
│       ├── entities/     # DTOs + Zod schemas per domain (auth, user, admin, student)
│       ├── filters/      # HttpExceptionFilter, RpcExceptionFilter
│       ├── guards/       # JwtAuthGuard (global), RolesGuard
│       ├── helpers/       # hashing, JWT sign/verify, buildListWhereClause, generateCode
│       ├── interceptor/  # ResponseInterceptor, ErrorInterceptor, LoggerInterceptor
│       ├── interfaces/   # ApiResponseInterface, UserInterface
│       ├── pipes/        # ZodValidationPipe
│       └── strategy/     # Google/Facebook Passport strategies
├── drizzle/               # Auto-generated SQL migrations
├── scripts/                # Seed scripts (Bun runtime) — seed-categories/seed-wallet/seed-edu-flow/
│                            # seed-dashboard/seed-curriculum-demo target tables dropped in the
│                            # 2026-09-12 trim; only seed-user/seed-users-bulk/seed-grades are live
└── test/                   # Jest + Supertest tests
```

## Feature Module Pattern

```
features/{name}/
├── {name}.module.ts          # Module definition
├── {name}.controller.ts      # HTTP route handlers (@Body with ZodValidationPipe)
├── {name}.rpc.controller.ts  # @MessagePattern mirror, reached by gateway's ClientProxy
├── {name}.service.ts         # Business logic (shared by both controllers above)
└── {name}.repository.ts      # Drizzle DB access
```

There is no single canonical reference feature (the old `class` feature was removed in the
2026-09-12 trim) — see `.claude/rules/nestjs-feature-pattern.md` for which of `student`/
`admin`/`user` is the closer shape for a given change, and the `.claude/skills/generate-*/
SKILL.md` self-contained templates.

## RPC contract

This is the only service with live `@MessagePattern` responders today — `auth`, `user`,
`admin`, `student`, all reached by `gateway`'s Kafka `KafkaProducer` (topic-based, not an RMQ
queue — see "Kafka RPC Plumbing" below). See `../.claude/rules/architecture.md` for the full
naming contract, and the `add-rpc-endpoint` skill (`../.claude/skills/`) when adding or
changing a pattern (update both repos together).

## Kafka RPC Plumbing

Referenced elsewhere as `[[kafka-rpc-plumbing]]`. RabbitMQ was **fully replaced by Kafka**
(commits `8a3402b`/`3744b0b`/`95010f2`/`938c79c`) — there is no `rabbitmq` feature or RMQ
transport left anywhere in `src/`, despite some rule/skill/agent docs still mentioning it
before this pass.

- `src/features/kafka/kafka.producer.ts` — `KafkaProducer.send<TResponse, TRequest>(topic, msg)`
  (request-reply, awaited, rethrows the responder's error as a real `HttpException`) and
  `.emit(topic, msg)` (fire-and-forget). Both wrap the payload as
  `{ value, headers: { correlationId, traceId, parentTraceId, serviceName } }` via
  `wrapWithTraceHeaders` — callers never build this envelope themselves.
- `src/features/kafka/kafka.constants.ts` — `KAFKA_REQUEST_TOPICS` (topics called via `.send()`;
  must be listed or `ClientKafka` never subscribed to `<topic>.reply` and `.send()` throws) vs.
  `KAFKA_SERVER_TOPICS` (every `@MessagePattern`/`@EventPattern` this service's own
  `*.rpc.controller.ts` files host). `ALL_KAFKA_TOPICS` feeds `kafka.admin.ts`'s
  `ensureKafkaTopics()`, called in `main.ts` **before** `NestFactory.create()` (Kafka's
  broker-side auto-create is racy for request-reply).
- `src/main.ts` opens the Kafka microservice with `deferInitialization: true` specifically so
  `RpcExceptionFilter`/`TraceContextInterceptor` can be attached as global filters/interceptors
  *before* `startAllMicroservices()` binds the `@MessagePattern` listeners — attaching after
  `connectMicroservice()` without deferring is silently too late.
- `redis.get`/`redis.set`/`redis.del` are **generic KV topics hosted by third-service**
  (`RedisRpcController` → `RedisService`, backed by `ioredis`) — this repo has no direct Redis
  connection. `AuthService` already reuses these for two things: `forgotPasswordService`/
  `resetPasswordService` (reset-token storage, key `reset-password:<jti>`) and, as of this
  session, every successful login flow (`loginService`/`loginByUserCodeService`/
  `facebookLoginService`/`googleLoginService`) fire-and-forget `emitLoginSessionCreated
  (refreshToken)` — stores `session:<loginAt ms-epoch>` → the raw refreshToken (TTL =
  `jwtTokensConfig.refreshExpiresIn`), not awaited, errors just logged. Prefer reusing these
  generic topics for new KV-shaped needs before inventing a new Kafka topic.

## Environment Variables

| Variable                      | Description                    |
| ----------------------------- | ------------------------------- |
| `NODE_ENV`                    | Environment mode                |
| `PORT`                        | Server port (default `8888`)    |
| `DATABASE_URL`                | Postgres connection URL         |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Must match `gateway` (token issuance happens here) |
| `JWT_ACCESS_EXPIRES_SECONDS` / `JWT_REFRESH_EXPIRES_SECONDS` | Token TTLs |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` / `GOOGLE_OAUTH_REDIRECT_URL` | Google OAuth — final token issuance lands here via RPC from `gateway` |
| `KAFKA_CLIENT_ID` / `KAFKA_BROKERS` / `KAFKA_GROUP_ID` | Kafka client id, broker list, consumer group — defaults `user-service` / `localhost:9092` / `user-service` |

No `REDIS_*`/`MAIL_*`/`AWS_*`/`CLOUDINARY_*`/`RESEND_*` vars are read anywhere in `src/` —
password-reset/email and logout-blacklist code paths that would need them were removed (see
`auth.service.ts` comments). Don't configure them speculatively.

## Docker Services

`docker-compose.yml` provides Postgres (`POSTGRES_PORT`, default `5432`) and Redis
(`REDIS_PORT`, default `6380`→`6379`) containers — this repo never opens a Redis client itself;
Redis is reached only indirectly, via Kafka RPC to third-service's generic `redis.*` topics
(see "Kafka RPC Plumbing" above).

## Testing

- **One runner: Jest** (+ Supertest for e2e). `bun run test`/`test:e2e` both invoke Jest — no
  separate Bun-native test runner, despite older docs having claimed one.
- Unit tests `*.spec.ts`, e2e `*.e2e-spec.ts`, both in `test/`.

## Available Skills

`generate-controller`, `generate-db-table`, `generate-entity`, `generate-feature`,
`generate-module`, `generate-repository`, `generate-service`.

## Available Agents

`dev.md`, `review.md`, `security.md`, `test.md` — see `.claude/agents/`.

## Rules

`conventions.md`, `database.md`, `nestjs-feature-pattern.md` (this repo) plus
`../.claude/rules/architecture.md` and `shared-conventions.md` (cross-service).

## Trimmed Feature Set (2026-09-12)

Referenced elsewhere as `[[trimmed-feature-set]]`. Two unrelated things were removed from this
repo on 2026-09-12, leaving only `auth`/`user`/`admin`/`student` (+ `kafka` infra, née
`rabbitmq` — see "Kafka RPC Plumbing" above):

- **Personal-finance features** (`category`, `wallet`, `transaction`) — an earlier, unrelated
  app concept for this repo. Fully deleted: no other service owns these; if they come back,
  they'd be rebuilt from scratch here.
- **Education-scheduling features** (`class`, `schedule`, `session`, `curriculum`, `chapter`,
  `lesson`, `tuition`, `notification`, `attendance`, `exercise`, `chat`, `dashboard`, `report`,
  `agents`) — these were duplicated ownership; per the cross-repo
  `../.claude/rules/architecture.md` table, this domain belongs to `tutor-service` (education)
  and `third-service` (notification), not `user` (identity/admin). Removed here because
  `tutor-service`/`third-service` now have their own live copies with RPC responders wired up
  — this repo keeping them was leftover duplication, not a second source of truth.

Also lost in the same trim: `student`'s class enrollment/scores/session-history fields (that
data now lives with `tutor-service`'s copy of the domain) — `student` here is now just
parent-linking + basic profile.

If any of this needs to come back in `user` specifically (as opposed to just calling
`tutor-service`/`third-service` over RPC), treat it as a new feature via the `generate-*`
skills, not a restore — the old code predates the current RPC-controller/entity conventions.

## Selective File Reading Guideline (IMPORTANT)

**Do NOT read entire source code.** Only read files necessary for the task — see
`CLAUDE.md`'s "IMPORTANT: Selective File Reading" section for the full breakdown.
