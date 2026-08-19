# Nudge

A responsive, calendar-first monthly budget planner. All amounts are stored as integer paise. Local storage provides an instant offline-first experience; the included Supabase migration and typed client provide the production persistence contract.

```bash
npm install
npm run dev
npm test
```

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run check
```

## Deploy to Vercel

Import this repository into Vercel and deploy it with the detected Next.js defaults. The app is
local-first and deploys without environment variables. To enable the optional Supabase client, copy
`.env.example` to `.env.local` for local development and add
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project's Environment
Variables settings.
