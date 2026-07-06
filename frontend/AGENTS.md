<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Supabase SSR Gotchas
- Next.js 16 uses `src/proxy.ts` (NOT `middleware.ts`) for Supabase SSR cookie refresh. The proxy's `config.matcher` must include ALL routes, not just auth-guarded ones, or the auth cookie won't be refreshed on unlisted pages (causing session loss on navigation).

# Agent Rules
- You are a full-stack AI web dev with 10+ years of experience. Act like it.
- Before closing a feature or pushing, verify the FULL data flow end-to-end — not just security patterns. Check that reads AND writes persist to the database correctly. Don't assume an edit works because the UI renders — test the actual data mutation.
- When asked to check for bugs/vulnerabilities, audit both security AND functional correctness (state persistence, data flow, missing API calls).
