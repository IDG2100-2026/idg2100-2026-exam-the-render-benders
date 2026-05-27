# Exam Project - Task List
### The Render Benders · IDG2100 · Defense: June 3-5, 2026

---

## Strategy

> "Your understanding of the code and principles behind it will be prioritized during the exam over feature completeness." - README

Each priority is split into 3 parts. Each person owns their letter across all priorities - that way everyone has backend + logic + frontend work and can explain a complete flow at the exam.

**A = Sebbegang** - backend foundation: models, routes, core service logic
**B = Tobbelobb** - middleware, rules, validation, business logic enforcement
**C = Johchacho** - frontend pages, components, UX

Use priorities top-to-bottom if time gets tight. Earlier sections block other work, are explicitly required by the exam, or make the demo credible.

Useful reference code in `projects/`:
- `projects/Seb/frontend/src/components/game/` - older game card/board/comment layout ideas
- `projects/Seb/backend/project/seed/data/` - JSON seed-file structure worth copying
- `projects/Seb/backend/project/services/matchmaking.service.js` - queue/matchmaking ideas (exam now wants waiting rooms instead)
- Tournament frontend in `projects/Seb` and `projects/Tobias` is mostly stubbed - build in main app

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

**Current state after bug bash (May 22):**
- All models, full CRUD, route guards, ELO util, tournament logic
- Auth persists on refresh (localStorage), auto-login after register, guest accounts for anonymous join
- REST endpoints refactored to nouns: `POST /sessions`, `POST/DELETE /games/:gid/players/:uid`
- Leave/forfeit game, active games on homepage + lobby, style preferences persisted to backend
- All 35 bugs from BUGS.md resolved
- Still missing: JWT, WebSockets, actual game logic, Web Components

---

## Priority 1 - Authentication, Authorization, And Email Verification

### Part 1A - Backend Auth Foundation `[Sebbegang]`
- [X] Replace `backend/utils/hash.js` MD5 hashing with `bcrypt` or `argon2` | Decided to stick with crypto since it's what we used in class
- [x] Install auth dependencies: `jsonwebtoken`, `cookie-parser`, `nodemailer`
- [x] Add `emailVerified` and refresh-token/session fields to `user.model.js`
- [x] Add `EmailVerification` model with `userId`, `code`, `expiresAt`
- [x] Add auth routes: register, login, refresh, logout, verify-email, resend-verification
- [x] Issue access and refresh tokens through httpOnly cookies

#### Good to know (Just in case we get a security question related to the cookies):
> Refresh tokens are now stored in the browser as httpOnly cookies and stored in MongoDB only as hashes. JavaScript cannot read the cookies directly, and a leaked database session hash is not itself a usable refresh token.

### Part 1B - Auth Middleware And Security Rules `[Tobbelobb]`
- [x] Update `auth.middleware.js` to verify JWT cookies instead of trusting `x-user-type` / `x-user-id` headers
- [x] Include userId, admin state, emailVerified, and issuing IP in token payload
- [x] Fix profile authorization: `requireSelfOrAdmin` currently allows any logged-in user to edit any profile
- [x] Require verified, non-banned users before joining games/tournaments
- [x] Make admin-only writes depend on real admin auth

### Part 1C - Frontend Auth Flow `[Johchacho]`
- [x] Update `api.js` to use `credentials: "include"` and remove fake auth headers
- [x] Add automatic refresh/retry on 401, then logout/redirect if refresh fails
- [x] Update `AuthProvider` to restore session from `POST /auth/refresh` on mount
- [x] Fix `AuthProvider` logout to call `POST /auth/logout` to clear JWT cookie
- [x] Wire login/register pages to new auth endpoints
- [x] Add email verification result page and resend-verification UI
- [x] Auto-send verification code on EmailVerificationPage mount - user should not need to click Resend to get their first code
- [x] Show "verify email" prompt on profile page if emailVerified is false
- [x] Add `ProtectedRoute` component - Wire into App.jsx routes (do after 1C wiring is done)
- [x] Add `AdminRoute` component - Wire into App.jsx on admin routes (do after admin pages exist)

---

## Priority 2 - Game Variants, Points, Buy-Ins, And Lobby Filtering

### Part 2A - Backend Data Model And Validation `[Sebbegang]`
- [x] Add `points` to `user.model.js`
- [x] Expand `game.model.js` with `numPlayers` (2/3/5), `buyIn` (1/10/50), `pot`, per-player stacks
- [x] Update game validators for `numPlayers: 2/3/5` and `buyIn: 1/10/50`
- [x] `timeControl: [10,30,90]` already correct, `MAX_ELO=3000` enforced

### Part 2B - Backend Join/Points Logic `[Tobbelobb]`
- [x] Deduct buy-in from `User.points` when a verified user joins a game
- [x] Reject joins if the user lacks enough points
- [x] Add weekly +100 point grant on login or cron
- [x] Add per-player stacks back to profiles when a game ends
- [x] Start games automatically when required `numPlayers` have joined
- [x] `DELETE /games/:gid/players/:uid` - leave before start or forfeit ongoing

### Part 2C - Frontend Game Creation And Lobby `[Johchacho]`
- [x] Update `CreateGamePage` with number of players and buy-in
- [x] Update lobby cards to show buy-in, player count, join eligibility
- [x] Add lobby filters: straights, rounds, time control, num players, buy-in
- [x] Anonymous users: "Play as Guest" on allowAnonymous games, redirected elsewhere
- [x] Show points balance in header (Greeting chip)

---

## Priority 3 - Realtime Game And Web Component Board

### Part 3A - Backend Game State Machine `[Sebbegang]`
- [x] Define game phases: waiting, rolling, betting, revealing, round-ended, finished
- [x] Generate dice rolls on backend only
- [x] Store hidden rolls, revealed rolls, holds, bets, folded users, current turn, current round, timeout state
- [x] Hide other players' rolls until reveal/end-of-round
- [x] Implement betting: bet, match, raise, fold, pot calculation, draw split
- [ ] Implement timeout: auto-roll, no holds/rerolls, auto-match
- [ ] Update ELO for 2-5 players using pairwise comparisons and `backend/utils/elo.js`

### Part 3B - WebSocket Server And Events `[Tobbelobb]`
- [x] Add WebSocket support beside Express (`ws` or Socket.IO)
- [x] Define events: join-room, game-state, hold-dice, bet, match, raise, fold, leave-before-start, error
- [x] Add `GET /games/:gid/state` for reload/navigation restore
- [x] Emit state updates to all players and spectators in the game room
- [x] Keep player-private dice data private in emitted payloads

### Part 3C - Frontend Web Components And Game Page `[Johchacho]`
- [x] Build `<game-board>`, `<game-die>`, `<game-player>` Web Components
- [x] Add `GameBoard.jsx` React wrapper to connect state/WebSocket to Web Components
- [x] Replace placeholder dice area in `GamePage`
- [x] Wire Socket.IO into GameBoard.jsx - replace mock state with real game-state events
- [x] Add betting controls and turn/phase display
- [ ] Restore state on reload with `GET /games/:gid/state`, then subscribe to WS room
- [ ] Add sound effects gated by `sound` appearance preference

---

## Priority 4 - Tournament Backend Flow

### Part 4A - Tournament Model And Rules `[Sebbegang]`
- [ ] Extend `tournament.model.js` with `buyIn`, Elo min/max, points reward, author, cancellation status
- [ ] Decide one tournament type for the exam: random-pairing round-based (knockout exists, arena exists but may be explained as out of scope)

### Part 4B - Tournament Join/Leave/Cancel `[Tobbelobb]`
- [ ] Validate on join: upcoming status, verified user, Elo range, buy-in, capacity, no duplicate, enough points
- [ ] Deduct buy-in points on join
- [ ] Allow users to leave upcoming tournaments
- [ ] Admin cancel endpoint
- [ ] Admin delete/edit endpoint

### Part 4C - Tournament Rounds And Standings `[Johchacho]`
- [ ] `POST /tournaments/:tid/start` - shuffle players, create Game docs for round 1
- [ ] `POST /tournaments/:tid/advance` - collect results, create next round games
- [ ] `PATCH /tournaments/:tid/finish` - determine winner, award trophy/points
- [ ] Redirect tournament players to their active game and back

---

## Priority 5 - Tournament Frontend

### Part 5A - Routes, Services, And Homepage Preview `[Sebbegang]`
- [ ] Add routes: `/tournaments`, `/tournaments/:id`, admin create/edit
- [ ] Expand `tournamentService.js`: search, sort, join, leave, cancel, standings, start, advance, finish
- [ ] Homepage preview of 5 upcoming tournaments
- [ ] Tournament link in header navigation

### Part 5B - Tournament List Page `[Tobbelobb]`
- [ ] `TournamentListPage` with upcoming/ongoing/past sections
- [ ] Sort by date, title, num players
- [ ] Title search (3+ chars)
- [ ] Load-more pagination
- [ ] Show: title, date, variant, rounds, status, trophy, player count

### Part 5C - Individual Tournament Page `[Johchacho]`
- [ ] `TournamentPage`: title, description, rules, trophy image, players, standings, comments, countdown
- [ ] Join/leave controls with anonymous/unverified handling
- [ ] Show ongoing games for spectators
- [ ] Redirect joined players to game when round starts
- [ ] Admin controls: delete, cancel, edit

---

## Priority 6 - Profile, Stats, And User Game History

### Part 6A - Backend Profile Data `[Sebbegang]`
- [ ] Add points to profile response
- [ ] Profile stats: Elo for 10s/30s/90s, total games, last-month wins/losses
- [ ] Paginated recent/all games endpoint per user
- [ ] Email only returned to owner or admin

### Part 6B - Frontend Profile UI `[Tobbelobb]`
- [x] ELO labels fixed: Blitz 10s / Rapid 30s / Classic 90s with correct field names
- [ ] Show points balance
- [ ] Show last-month wins/losses clearly
- [ ] Load-more for recent games or paginated full history
- [ ] Profile edit works with real auth (after Priority 1 done)

### Part 6C - Profile Permissions And Edge Cases `[Johchacho]`
- [ ] Users can only edit their own profile (fix `requireSelfOrAdmin`)
- [ ] Hide email for non-owner/non-admin viewers
- [ ] Handle banned users consistently
- [ ] Empty states: no trophies, no games, no bio

---

## Priority 7 - Homepage And Platform Activity

### Part 7A - Backend Activity Data `[Sebbegang]`
- [ ] Expand `GET /activity`: active players, games played last week, available games now
- [ ] Homepage-friendly endpoint for 5 upcoming tournaments

### Part 7B - Homepage Components `[Tobbelobb]`
- [ ] Platform activity component
- [ ] Tournament preview component
- [x] Active games widget (`MyActiveGames`) shows waiting/ongoing games for logged-in users
- [x] Lobby preview and top games working

### Part 7C - UX/Responsive Polish `[Johchacho]`
- [ ] Responsive layout across all pages
- [ ] Loading/error/empty states consistently
- [ ] Stats understandable for anonymous users

---

## Priority 8 - Seed Data, Docs, And Final Demo Prep

### Part 8A - Seed Data `[Sebbegang]`
- [x] Seed rewritten with `users.json` + inline data, all 6 collections
- [x] Seed: users (regular, admin, banned)
- [x] Seed: game categories (all 18 combinations)
- [x] Seed: games (waiting, ongoing, finished)
- [x] Seed: tournaments (finished w/ trophy, upcoming knockout, upcoming arena)
- [x] Seed: comments
- [ ] Seed: security incidents (model not built yet)
- [ ] Seed: user trophies, eloHistory, points (needs points model first)

### Part 8B - Documentation `[Tobbelobb]`
- [ ] Update REST scripts with auth, game, tournament, admin, comment examples
- [ ] Add `.env.example` with all required variables
- [ ] Update `README.md` setup/demo instructions
- [ ] `NOTES.md` - starter code credits, work distribution, known bugs

### Part 8C - Final Walkthrough And Shared Understanding `[Johchacho]`
- [ ] Run lint/build, fix obvious warnings
- [ ] Test full demo path: seed, register, verify email, login, create game, join, play, comment, join tournament, admin, profile
- [ ] Test failure cases: anonymous join, unverified join, insufficient points, banned comment, admin-only access
- [ ] Each group member explains one backend route, one model, one frontend page, one cross-cutting flow from someone else's work

---

## Priority 9 - Security Incidents And Admin Shell

### Part 9A - Security Incident Logging `[Sebbegang]`
- [ ] `SecurityIncident` model: type, ip, userAgent, userId, createdAt, details
- [ ] Log rate-limit incidents
- [ ] Log IP mismatch incidents (token issuing IP vs request IP)
- [ ] Return 401 on token IP mismatch

### Part 9B - Admin Backend Endpoints `[Tobbelobb]`
- [ ] `GET /admin/stats` - new users, security incidents, active players, played games last week
- [ ] Admin user endpoints: list/search, ban/unban, make/remove admin
- [ ] Admin comment endpoints: recent comments, delete
- [ ] Admin security incidents endpoint

### Part 9C - Admin Frontend Pages `[Johchacho]`
- [ ] Admin layout: minimal header, no footer
- [ ] Dashboard: platform stats, security incidents, links to admin tools
- [ ] User admin: search, ban, make-admin
- [ ] Comment admin: recent comments, delete
- [ ] Admin nav only visible to real admins

---

## Priority 10 - Comments With WebSockets

### Part 10A - Backend Comment Events `[Sebbegang]`
- [x] Comment WebSocket events: create/update/delete
- [x] Broadcast new game comments to game room
- [x] Broadcast new tournament comments to tournament page
- [x] Keep REST endpoints as fallback

### Part 10B - Shared Frontend Comment Component `[Tobbelobb]`
- [x] Extract reusable comment component for games and tournaments
- [x] Subscribe to comment WebSocket events
- [x] Append/delete comments without page reload
- [x] Keep REST fetch for initial load

### Part 10C - Moderation And Error Handling `[Johchacho]`
- [x] Respect banned-user checks
- [x] Handle deleted comments in realtime
- [x] Loading, empty, error states
- [x] Admin deletion updates open comment lists live

---

## If Time Runs Out

Minimum credible demo:
- [ ] Real login/register with protected user identity
- [ ] Create/join game with correct variants, points, buy-in, leave-before-start
- [ ] Playable game board using Web Components, backend-owned rolls, WebSocket updates
- [ ] Basic tournament list/page with join/leave, standings, admin create/cancel
- [ ] Profile shows points, correct Elo fields, stats, recent games
- [ ] Seed data and README/API docs good enough to run demo locally

Safest to simplify:
- [ ] Full admin dashboard depth
- [ ] Realtime comments (REST comments still work)
- [ ] Forgot-password
- [ ] Extra tournament types (one random-pairing round-based is enough)
- [ ] Advanced sound effects beyond preference-gated simple sound

---

## Needs Team Discussion
- [ ] `allowAnonymous` checkbox on CreateGamePage contradicts README line 94 - "Anonymous user can no longer play games". Discuss with Seb before removing.
- [ ] Refresh token rotation logs user out when navigating quickly (e.g. joining a game from another tab). Blocked on Seb to fix.

## Deferred / Post-Defense

- [ ] Restructure frontend components out of page folders and into `frontend/src/components/` (Tobias's suggestion - not worth the risk before the defense)

---

## DESIGN DECISIONS (resolved)

- [x] **REST endpoint naming** - refactored to nouns: `POST /sessions` (login), `POST /sessions/guest` (guest account), `POST /games/:gid/players` (join), `DELETE /games/:gid/players/:uid` (leave). Tournament verb endpoints (`/start`, `/finish`, `/cancel`) kept - state transitions with side effects, defensible pattern used by GitHub/Stripe.
- [x] **Anonymous players** - `POST /sessions/guest` creates a minimal User doc with `isGuest: true`. "Play as Guest" on allowAnonymous games creates guest, logs in, joins.
- [x] **Leaving an ongoing game** - forfeits to opponent, triggers ELO update. Confirm dialog warns before proceeding.

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

### Bugs fixed (early)
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

### Bug bash round 1 (May 22)
- [x] Seed rewrite: all 6 collections, GameCategories (18), Tournaments, Trophies, strong passwords
- [x] Login: frontend was sending `password`, backend expects `pwd` - fixed
- [x] Auth persists on refresh - `AuthProvider` reads/writes full user to localStorage
- [x] `userType` localStorage now reflects admin status correctly
- [x] Auto-login after registration
- [x] Profile edit "Unexpected token <" - was `PUT`, router only has `PATCH`
- [x] Profile edit: `setUpdateMsg(null)` on cancel so error doesn't linger
- [x] Profile ELO labels: Blitz 10s / Rapid 30s / Classic 90s with correct field names
- [x] Constants: `MAX_AGE`, `MAX_BIO_LENGTH`, `MAX_COMMENT_LENGTH` in `constants.js`
- [x] Validators use constants instead of magic numbers
- [x] `maxLength` on every text input: register, profile edit, comments
- [x] CreateGamePage early-return for anonymous users (was crashing on `user._id`)
- [x] Backend prevents joining when already in waiting/ongoing game
- [x] "Your active games" section on Lobby and Homepage
- [x] Delete comment button (owner or admin only)
- [x] CSS: comment overflow, username overflow, dice board no longer stretches with sidebar

### Bug bash round 2 (May 22)
- [x] REST refactor: `POST /users/login` removed, replaced by `POST /sessions`
- [x] REST refactor: join/leave → `POST/DELETE /games/:gid/players/:uid`
- [x] `POST /sessions/guest` - creates guest User with `isGuest: true`, no pwd/email/dob required
- [x] User model: `isGuest` flag, conditional required fields, username regex allows æøå
- [x] Anonymous join: "Play as Guest" on allowAnonymous games
- [x] Leave/forfeit game with confirm dialog
- [x] `MAX_ELO = 3000` - enforced in validator + input max
- [x] Email TLD allowlist - blocks `.kuksti` and other made-up TLDs
- [x] Username must contain at least one letter - blocks `1234`
- [x] AppearanceProvider loads preferences from backend on login (cross-device persistence)
- [x] `MyActiveGames` component on homepage
- [x] Login error hint about password requirements
- [x] `joinGame` returns 201

> **Note for Tobias:** Your Oblig 3 has `POST /users/guest`. We don't need it - anonymous = just not logged in (or use guest account). Confirm at next meeting.
