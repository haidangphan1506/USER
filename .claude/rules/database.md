# Rule: Database & migrations

- **Never hand-edit anything under `drizzle/`** — those SQL files and `meta/` are generated.
  (A PreToolUse hook blocks this.) Change the schema in `src/database/schema.ts` instead.
- After editing `src/database/schema.ts`, run `bun run db:generate` to emit a migration,
  then tell the user to run `bun run db:migrate` (or `bun run db:push` for dev). Do not run
  destructive DB commands automatically.
- All tables use UUID primary keys (`.defaultRandom()`), snake_case column names mapped from
  camelCase TS properties, and `created_at` / `updated_at` timestamps.
- Declare enums as `pgEnum('name', [...])` at the top of `schema.ts` before the tables use them.
- When a where-condition is built conditionally across `if`/`else` branches (e.g. role-based list
  scoping) rather than in one expression, annotate the accumulator explicitly as
  `let scopeWhere: SQL | undefined;` (import `type SQL` from `drizzle-orm`). An untyped `let`
  defaults to implicit `any`, which then makes any `conditions` array holding it `any[]` and
  trips `@typescript-eslint/no-unsafe-argument` the moment it's spread into `and(...conditions)`.
  See `UserRepository.buildUserListConditions` or `AdminRepository`'s list method for the
  reference shape.
- **2026-09-12 schema trim**: `schema.ts` was cut down to just `users` + `grades` — the
  education-scheduling tables (`classes`, `class_students`, `schedules`, `class_sessions`,
  `curriculums`, `chapters`, `lessons`, `tuitions`, `notifications`, `student_scores`,
  `ai_messages`, `attendances`, `exercises`, `conversations`, `conversation_participants`,
  `messages`) and their enums were dropped via a generated migration. See
  `[[trimmed-feature-set]]` memory for why and what to do if these come back.
