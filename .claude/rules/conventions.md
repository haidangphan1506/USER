# Rule: Code conventions

- **Imports**: use the `@packages/*` alias for anything under `src/packages/`
  (e.g. `import { Public } from '@packages/decorators'`) — never long relative `../../..` paths.
- **Validation**: every request body/query is validated with a **Zod v4** schema via
  `new ZodValidationPipe<Dto>(schema)`. DTOs are `z.infer<>` types, never hand-written interfaces.
  Pagination query schemas use plain `z.coerce.number()` fields (`page`/`limit`), not `z.preprocess`.
- **Secrets**: never read, print, or edit `.env*` files (a PreToolUse hook blocks edits).
  Reference config via `process.env` / `ConfigModule`.
- **Style**: single quotes, trailing commas, 100-char width, semicolons. Formatting/lint is
  auto-applied by a PostToolUse hook, so match surrounding code and let the hook normalize it.
- **Auth**: routes are guarded globally by `JwtAuthGuard`; add `@Public()` only for
  intentionally open endpoints, and `@Roles('ADMIN')` (from `@packages/decorators`, paired with
  `RolesGuard` from `@packages/guards`) for admin-only ones. `AdminRoleGuard` is also available
  in `@packages/guards`. Read the acting user with `@CurrentUser()` from `@packages/decorators`
  (returns the JWT payload; use `user.id`).
- **Helpers** (`@packages/helpers`): `checkUuidValid` / `generateCode` (from `generate.helper`),
  `hashData` / `compareData` (bcrypt from `hashingData.helper`), `buildListWhereClause` (for
  paginated list queries), `signAccessToken` / `signRefreshToken` (from `jwt.helper`).
- **Messages**: error strings in `ERROR_MESSAGES` (`src/data/constants`); success strings in
  `SUCCESS_MESSAGES` (same barrel). Never hardcode message text in services.
- **Swagger**: body/query schemas in `src/data/swaggers/data/{name}.swagger.ts`, response
  messages in `src/data/swaggers/messages/{name}.msg.ts`. Use `@ApiResponse()` decorator from
  `@packages/decorators` for success messages.
- **Request logging**: the global `LoggerInterceptor` (`@packages/interceptor`, wired in
  `main.ts`) logs `[Request]`/`[Response]`/`[Error]`/`[Timing]` lines including the request body
  and response data, redacting any key in its `SENSITIVE_KEYS` list (`password`, `token`,
  `accessToken`, `refreshToken`, etc.) and truncating logged JSON at 1000 chars. If a new field
  name carrying a secret is introduced (e.g. a new `*Secret`/`*Key` DTO field), add it to
  `SENSITIVE_KEYS` rather than relying on truncation to hide it.
- **Kafka pass/fail logging**: `KafkaProducer.send`/`.emit` (`src/features/kafka/kafka.producer.ts`)
  already log `[SEND]`/`[EMIT]` on dispatch and `[SEND FAILED]` on a `.send()` rejection, each
  with the topic + `correlationId`/`traceId` — this is built into the shared producer, so any
  feature that calls it gets pass/fail visibility for free; don't add ad-hoc logging around
  individual `send`/`emit` call sites. RabbitMQ (and its `[Publish OK/FAILED]`/`[Consume OK/
  FAILED]` logging) was fully replaced by Kafka — there is no `rabbitmq` feature left.
- **Non-blocking side effects**: when a Kafka call is for a side effect that must never fail the
  caller's main flow (best-effort cleanup, session/audit tracking), don't `await` it — fire the
  promise and attach `.catch((error) => this.logger.warn(...))` so a Kafka/downstream hiccup is
  logged but never bubbles into the caller's response. See
  `AuthService.emitLoginSessionCreated`/the `redis.del` cleanup in `resetPasswordService`.
