# Leave below any info you want examiners to see

Including the info on the starter code (whose repository and how used), notes on seeding and launching the app, optional info on the work distribution within the team, and notes on unfinished parts of the project and unpatched bugs.

### Setup
- [x] Johan's backend + frontend as starter codebase
- [x] Single root `package.json`, `npm run dev` boots both servers
- [x] `.env.dev` / `.env.prod` environment split
- [x] `@` path alias in `vite.config.js` + `jsconfig.json`
- [x] All frontend imports migrated to `@` alias
- [x] 404 page outside Layout (no header/footer)

### From Tobias
- [x] `results[]` on game model (rolls, holds, outcome, timestamps per round)
- [x] `requireAdmin` and `requireUser` middleware, wired into all routers
- [x] `elo.js` utility (standard ELO formula, K=32)

### From Seb
- [x] `escapeRegex.js` utility
- [x] Tournament schema: `tournamentType`, `rounds[]`, `arenaScores[]`, `byePlayer`
- [x] `GameCategory` model + full CRUD (admin-only write)
- [x] `Trophy` model + full CRUD with image upload (admin-only write)
- [x] Tournament: leave, standings, delete, improved join + getAllTournaments
- [x] `GET /users/:username/trophies`
- [x] Comment `createComment` checks author is not banned
- [x] Frontend: 6 service files