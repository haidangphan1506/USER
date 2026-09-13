---
name: generate-db-table
description: Add a Drizzle table (and any pgEnum) to src/database/schema.ts for a new domain, then generate the migration. Use when asked to create/add a database table, schema, column, or enum in this NestJS tutoring backend.
---

# Generate Drizzle Table

Add a `pgTable` (and needed `pgEnum`s) to `src/database/schema.ts`, following the style of
the existing `users` / `grades` tables (the schema was trimmed down to just these two on
2026-09-12 — see `[[trimmed-feature-set]]` memory).

## Inputs
- Table name (plural, snake_case), e.g. `invoices`.
- Columns with types, nullability, defaults, foreign keys, and any enum values.

## Conventions
- UUID primary key: `id: uuid('id').primaryKey().defaultRandom()`.
- Enums declared at top of file: `export const fooStatusEnum = pgEnum('foo_status', ['A', 'B']);`
  then used as `.status: fooStatusEnum('status').notNull()`.
- Foreign keys: `userId: uuid('user_id').references(() => users.id)`.
- Timestamps:
  ```ts
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ```
- Map camelCase TS property → snake_case column name.

## After editing schema.ts
1. Run `bun run db:generate` to emit the migration SQL into `drizzle/`.
2. Tell the user to run `bun run db:migrate` (or `bun run db:push` for dev) to apply it.
3. Do NOT hand-edit files in `drizzle/` — they are generated.
