# ⛳ Hole-In-Won
Phone-first golf group app: weekly flight signups, grouping generator, live gross scorecard + leaderboard (Tanah Merah: Tampines, Garden).
Stack: Next.js 14 (App Router), TypeScript, Tailwind, Neon Postgres, Vercel.

## Run
1. Create an Neon Postgres database; copy `.env.example` to `.env.local` and fill the REST URL/token.
2. `npm install && npm run dev`
3. First visit creates the captain account. Add players in the Captain tab (name, gender, PIN).

## Deploy
`git init && git add . && git commit -m "init"`, push to GitHub, import in Vercel, add DATABASE_URL as an env var.

## Notes
- Garden course pars in `lib/courses.ts` need checking against the club scorecard.
- Auth is name + PIN (pilot-grade). Add icons PNGs for a nicer home-screen install.
