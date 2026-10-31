# CLAUDE.md

Supermarket Simulator — a Next.js + Supabase browser game. The full spec is in
`docs/plan.md`. Read it before starting any work.

The project follows three stages (see `stage-1-frontend-solo-en.md`,
`stage-2-review-sql-solo-en.md`, `stage-3-server-solo-en.md`).

## Tech Stack (serverless only)

Use **only** these:

- **Next.js** (App Router, TypeScript) — frontend and server logic
  (Server Actions / Route Handlers, which run as serverless functions)
- **Supabase** — auth, Postgres database, storage
- **Vercel** — hosting and deployment

Do **not** add a separate backend server (no Express, NestJS, standalone
Node/Python servers, Docker, or self-hosted databases). Do not add other
hosting or database services. All server-side code must run as Next.js
serverless functions on Vercel and talk to Supabase.

## Rules

1. **Ask first.** Before starting, ask: "Which feature am I building?"
   Then read `docs/plan.md` and confirm the scope of that feature.
   Only generate code after the user confirms.
2. **Naming:** a feature's page/directory name must exactly match the feature
   name in `docs/plan.md` (e.g., the `sales-floor` feature lives in
   `features/sales-floor/` and its page is `/sales-floor`).
3. **Location:** all frontend files for a feature live under
   `features/<feature-name>/`.
4. **One feature at a time.** Do not touch anything outside the feature
   currently being built.
5. **No confusing names:** never use a name that could be mistaken for another
   feature's name.
6. **Branches:** never work directly on `main`. Use `feature/<feature-name>`
   for each feature.
7. **Stage 1 (current): frontend only.** Do not write or modify server code,
   Supabase code, or SQL. Use local/mock data in the frontend.
8. **Stage 2:** SQL only, saved as `sql/<feature-name>.sql`. No server code,
   no extra features.
9. **Stage 3:** server code for one feature at a time, with minimal changes.
   Never touch other features' code.
10. When a feature is done, commit it, then move on to the next one.
