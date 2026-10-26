# Implementation status — 2026-10-24

## Implemented in supplied source
- Admin generic CRUD/read/edit screens for all required new entities, plus authorization-gated API routes.
- Actual image file upload to Supabase Storage; user reported local upload and display in both apps worked.
- Additive migration `002_ai_configuration.sql` and optional seed `003_generation_configuration.sql`.
- Main app generation request and LLM response logging for its two existing OpenAI endpoints. Logging is best-effort to avoid breaking generation if migrations are not applied.

## Setup required
1. Run and review `002_ai_configuration.sql` in Supabase SQL editor (no direct production database access was available).
2. Optionally run `003_generation_configuration.sql` to populate real provider/model and descriptive prompt-chain records. These are not yet the source of the live prompt templates.
3. Ensure the main application's server-only environment has `SUPABASE_SERVICE_ROLE_KEY` if generation logging is desired. NEVER prefix it with NEXT_PUBLIC_ or expose it to browser code.
4. Copy updated files into separate repositories; install dependencies and build both apps.
5. Test all CRUD operations, authorization, upload deletion, signup behavior, and Incognito access.
6. Push each correct branch, confirm Vercel deployment, and obtain commit-specific URLs.

## Known gaps / no false completion claims
- No production migrations executed; no live DB read/write test performed.
- Allowlists are management/configuration records only; NOT enforced at signup. Enforcing them requires an explicit policy decision and Supabase Auth configuration changes.
- Prompt chain mix is editable configuration but does NOT yet control runtime generation.
- Generation logging does not store input prompts, and older historical requests are not backfilled.
- Storage object deletion on image record deletion still needs a reviewed cleanup policy.
- The new admin UI has not yet been verified against real records or production builds.
- Vercel deployments and immutable URLs have not been verified.
