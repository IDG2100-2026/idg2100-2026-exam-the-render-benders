# Exam Project - Task List
### The Render Benders · IDG2100 · Defense: June 3-5, 2026

---

## Strategy

> "Your understanding of the code and principles behind it will be prioritized during the exam over feature completeness." - README

Each person owns a feature end-to-end (backend + frontend). That way everyone can fully explain what they built. After finishing, walk each other through your code so everyone understands everything.

### Feature priority

| Feature                                         | Priority | Notes                                       |
| ----------------------------------------------- | -------- | ------------------------------------------- |
| Schemas + models                                | Must     | Needs to be done first, blocks everything   |
| Authentication (JWT, email verify)              | Must     | Security is a core exam topic               |
| Playing the game (dice, holds, betting, ELO)    | Must     | The whole point of the platform             |
| Web Components game board                       | Must     | Explicitly required by the exam             |
| WebSockets for the game                         | Must     | Required - rolls must be sent via WS        |
| Core frontend pages                             | Must     | Home, lobby, game, profile, login, register |
| Basic tournament (join, start, advance, finish) | Must     | Required feature                            |
| Seeded database                                 | Must     | Cannot demo without data                    |
| Points system + buy-in                          | Should   | If time allows                              |
| Admin pages                                     | Should   | If time allows                              |
| Forgot-password                                 | Skip     | Low value, not worth the time               |
| Arena tournaments                               | Skip     | README says only one type required          |
| Comment WebSockets                              | Skip     | Non-live comments still work                |

---

## What Johan did (setup + merge)

**Starter codebase:**
- Johan's Oblig 3 chosen as base
- Single root `package.json`, `.env.dev` / `.env.prod` split
- Fixed all bugs: regex injection, auth gaps, wrong enums, graceful shutdown, 404 page

**Merged from Tobias:**
- `results[]` on game model (rolls, holds, outcome, timestamps per round)
- `requireAdmin` / `requireUser` route guards wired into all routers
- `elo.js` utility (standard ELO formula)

**Merged from Seb:**
- Tournament schema: `tournamentType`, `rounds[]`, `arenaScores[]`, `byePlayer`
- `GameCategory` model + full CRUD
- `Trophy` model + full CRUD with image upload
- Tournament: leave, standings, delete, improved join + getAllTournaments
- `GET /users/:username/trophies`
- Comment ban check on create
- 6 frontend service files

**Current state:**
- All models, full CRUD, route guards, ELO util, tournament logic (join/leave/standings/start/delete)
- All existing pages, auth context, appearance context, full service layer
- No JWT, no WebSockets, no game logic, no Web Components

---

## AUTHENTICATION
**Assigned to: ___**

Backend:
- [ ] User model: add `emailVerified` (false), `refreshToken`, replace MD5 with bcrypt
- [ ] New model: `EmailVerification` (userId, code, expiresAt)
- [ ] New model: `SecurityIncident` (type, ip, userAgent, userId, timestamp)
- [ ] Install `jsonwebtoken`, `bcrypt`/`argon2`, `nodemailer`
- [ ] `POST /auth/register` - hash password, send verification email
- [ ] `POST /auth/login` - issue access (15 min) + refresh (7 days) tokens as httpOnly cookies, record IP
- [ ] `POST /auth/refresh` - validate token, compare IP - log SecurityIncident on mismatch
- [ ] `POST /auth/logout` - clear cookies, invalidate refresh token
- [ ] `GET /auth/verify-email/:code` - expires 15 min, set emailVerified true
- [ ] `POST /auth/resend-verification`
- [ ] Update `auth.middleware.js` to read JWT from cookie instead of headers
- [ ] Log SecurityIncident on rate limit exceeded

Frontend:
- [ ] Switch `apiFetch` from headers to JWT cookie
- [ ] Silent access token refresh on 401
- [ ] `AuthContext` stores decoded JWT payload (userId, type, emailVerified)
- [ ] `ProtectedRoute` and `AdminRoute` components
- [ ] `LoginPage`, `RegisterPage` wired to new auth endpoints
- [ ] `EmailVerificationPage` - success/fail + resend
- [ ] Email verification guard before joining a game or tournament

---

## PLAYING THE GAME
**Assigned to: ___**

Backend:
- [ ] WebSocket server alongside Express
- [ ] Roll generation on backend, sent to players in their game room via WebSocket
- [ ] Other players' rolls hidden until reveal at end of round
- [ ] Hold logic: client sends held indices, backend stores in `results[]`
- [ ] Betting state machine: bet / match / fold / raise
- [ ] Pot calculation, winner collects pot at round end
- [ ] `PATCH /games/:gid/leave` - leave before game starts
- [ ] `GET /games/:gid/state` - restore full state on page reload
- [ ] ELO update on finish - pairwise for all player combinations (use `backend/utils/elo.js`)
- [ ] Time enforcement: auto-roll + auto-match if player runs out of time

Frontend:
- [ ] `<game-board>` Web Component
- [ ] `<game-die>` Web Component (face, held state, roll animation)
- [ ] `<game-player>` Web Component (name, stack, turn indicator)
- [ ] Betting UI (bet/match/fold/raise buttons + pot display)
- [ ] `GameBoardWrapper.jsx` - React wrapper wiring WebSocket to the Web Component
- [ ] `GamePage` wired end-to-end - join, play, finish
- [ ] State restored on page reload via `GET /games/:gid/state`
- [ ] Sound effects gated by `soundEnabled`

---

## POINTS SYSTEM
**Assigned to: ___**

Backend:
- [ ] User model: add `points` (default 0)
- [ ] Game model: add `numPlayers` (2/3/5), `buyIn` (1/10/50), `pot`, per-player stack
- [ ] Buy-in deducted from `user.points` on game join
- [ ] Per-player stack tracked during game, added back to profile at end
- [ ] Weekly +100 points grant (on login or cron)

Frontend:
- [ ] `CreateGamePage` - add numPlayers + buyIn fields
- [ ] `UserProfilePage` - points balance displayed
- [ ] `LobbyPage` - filter by straights/rounds/time/num players

---

## TOURNAMENTS
**Assigned to: ___**

Backend:
- [ ] Tournament model: add `buyIn`, Elo range filter, points reward, `cancelled` status
- [ ] `POST /tournaments/:tid/start` - shuffle players, create Game docs for round 1
- [ ] `POST /tournaments/:tid/advance` - collect winners, create Game docs for next round
- [ ] `PATCH /tournaments/:tid/finish` - determine winner by most wins, award trophy
- [ ] `PATCH /tournaments/:tid/cancel` - admin sets status to cancelled
- [ ] Elo range + buy-in validation on join
- [ ] Points reward for winning

Frontend:
- [ ] `TournamentListPage` - upcoming/ongoing/past sections, sortable, searchable, load-more
- [ ] `TournamentPage` - standings, join/leave, player list, trophy image, admin controls
- [ ] Tournament redirect to game page when round starts (WebSocket)
- [ ] Homepage: 5 upcoming tournaments component

---

## ADMIN + PLATFORM
**Assigned to: ___**

Backend:
- [ ] `GET /admin/stats` - new users, security incidents, platform activity
- [ ] `GET /admin/users` + `PATCH .../ban` + `PATCH .../make-admin` + `DELETE`
- [ ] `GET /admin/comments` + `DELETE`
- [ ] `GET /admin/security-incidents`
- [ ] `GET /users/:username/stats` - wins, losses, win% from game results

Frontend:
- [ ] Admin layout: no footer, minimal header (logo + admin nav only)
- [ ] `AdminDashboardPage` - security incidents, platform stats, links
- [ ] `AdminUsersPage` - search, list, ban, make-admin
- [ ] `AdminCommentsPage` - recent comments, delete
- [ ] `AdminTournamentsPage` - tournament creation form
- [ ] `UserProfilePage` - stats (Elo in 3 time controls, wins/losses last month), email guard

---

## SEEDING + POLISH
**All hands - last 2 days**

- [ ] Rewrite seed using JSON data files (ref: `projects/Seb/backend/project/seed/`)
- [ ] Seed: users (registered, admin, banned - with points, trophies, elo history)
- [ ] Seed: game categories (all 18 variant combinations)
- [ ] Seed: games (waiting, ongoing, finished with results)
- [ ] Seed: tournaments (upcoming, ongoing, finished with rounds)
- [ ] Seed: comments and security incidents
- [ ] Fix existing game `timeControl` values in seed (currently 3, must be 10/30/90)
- [ ] `.env.example` with all required variables
- [ ] Responsive layout
- [ ] Consistent loading states and error messages
- [ ] `NOTES.md` - starter code credits, work distribution, known bugs
- [ ] Full walkthrough test before defense

---
---

## DONE

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

### Bugs fixed
- [x] Game validator `timeControl` was `[3,10,30]` - corrected to `[10,30,90]`
- [x] Tournament validator had wrong enum - rewritten with `tournamentType` required
- [x] Upload middleware destination `uploads/` - fixed to `backend/uploads/`
- [x] User model had `elo3s` - replaced with `elo90s`
- [x] `loginUser` duplicate `pwd` variable - fixed
- [x] Comment delete - fixed to own or admin only
- [x] All pagination converted from page-based to skip-based
- [x] Tournament `startTournament` was writing to removed `bracket` - fixed to `rounds[]`
- [x] Tournament trophy award was pushing embedded object - fixed to ObjectId ref
- [x] Tournament controller redundant inline auth checks - removed

> **Note for Tobias:** Your Oblig 3 has `POST /users/guest`. We don't need it - anonymous = just not logged in. Confirm at next meeting.
