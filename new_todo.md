# New TODO - Prioritized Feature Split Into 3 Related Parts

The main repo already has a MERN skeleton: models, routers, controllers, services, seed data, core pages, auth/appearance contexts, comments, game/tournament CRUD, trophies, game categories, and a 404 page. The missing work is mostly real auth, realtime gameplay, tournaments, admin pages, points/buy-ins, filtering/searching, seed/docs, and polish.

Use this TODO from top to bottom if time gets tight. Earlier sections are more important because they either block other work, are explicitly required by the exam, or make the demo credible. Each feature is split into three related parts so all three group members can work on the same area from different angles and explain the full flow during the oral exam.

Useful reference code in `projects/`:
- `projects/Seb/frontend/src/components/game/` has older game card/board/comment layout ideas.
- `projects/Seb/backend/project/seed/data/` has JSON seed-file structure worth copying into the main seed.
- `projects/Seb/backend/project/services/matchmaking.service.js` has queue/matchmaking ideas, but the exam now wants waiting rooms instead of queues.
- Tournament frontend in `projects/Seb` and `projects/Tobias` is mostly stubbed, so tournament pages should be built in the main app.

## Priority 1 - Authentication, Authorization, And Email Verification

### Part 1A - Backend Auth Foundation
- [ ] Replace `backend/utils/hash.js` MD5 hashing with `bcrypt` or `argon2`.
- [ ] Install/use auth dependencies: likely `jsonwebtoken`, `cookie-parser`, `bcrypt`/`argon2`, `nodemailer`.
- [ ] Add `emailVerified` and refresh-token/session fields to `backend/models/user.model.js`.
- [ ] Add `EmailVerification` model with `userId`, `code`, `expiresAt`.
- [ ] Add auth routes: register, login, refresh, logout, verify-email, resend-verification.
- [ ] Issue access and refresh tokens through httpOnly cookies.

### Part 1B - Auth Middleware And Security Rules
- [ ] Update `backend/middleware/auth.middleware.js` to verify JWT cookies instead of trusting `x-user-type` and `x-user-id`.
- [ ] Include user id, admin state, email verification state, and issuing IP in token/session handling.
- [ ] Fix profile authorization: current `requireSelfOrAdmin` allows any logged-in user to edit any username.
- [ ] Require verified, non-banned users before joining games/tournaments.
- [ ] Make admin-only writes depend on real admin auth.

### Part 1C - Frontend Auth Flow
- [ ] Update `frontend/src/api.js` to use `credentials: "include"` and remove fake auth headers.
- [ ] Add automatic refresh/retry on `401`, then logout/redirect if refresh fails.
- [ ] Update `AuthProvider` to load current session and expose `user`, `isAdmin`, and `emailVerified`.
- [ ] Wire login/register pages to the new auth endpoints.
- [ ] Add email verification result page and resend-verification UI.
- [ ] Add `ProtectedRoute` and `AdminRoute`.

## Priority 2 - Game Variants, Points, Buy-Ins, And Lobby Filtering

### Part 2A - Backend Data Model And Validation
- [ ] Add `points` to `backend/models/user.model.js`.
- [ ] Expand `backend/models/game.model.js` with `numPlayers` (`2/3/5`), `buyIn` (`1/10/50`), `pot`, and per-player stacks.
- [ ] Update game validators for `rounds: 3/5/7`, `rules`, `timeControl: 10/30/90`, `numPlayers: 2/3/5`, and `buyIn: 1/10/50`.
- [ ] Fix any old `3/10/30` time-control assumptions.

### Part 2B - Backend Join/Points Logic
- [ ] Deduct buy-in from `User.points` when a verified user joins a game.
- [ ] Reject joins if the user lacks enough points.
- [ ] Add weekly +100 point grant on login or via a simple scheduled job.
- [ ] Add per-player stacks back to profiles when a game ends.
- [ ] Start games automatically when required `numPlayers` have joined.
- [ ] Add `PATCH /games/:gid/leave` for leaving before the game starts.

### Part 2C - Frontend Game Creation And Lobby
- [ ] Update `CreateGamePage` with number of players, buy-in, and `10/30/90` total time controls.
- [ ] Update lobby cards to show buy-in, player count, and join eligibility.
- [ ] Add lobby filters for straights, rounds, time control, number of players, and buy-in.
- [ ] Ensure anonymous users can spectate but are prompted/redirected when trying to join.
- [ ] Show points balance where it matters before join/create actions.

## Priority 3 - Realtime Game And Web Component Board

### Part 3A - Backend Game State Machine
- [ ] Define game phases: waiting, rolling, betting, revealing, round-ended, finished.
- [ ] Generate dice rolls on the backend only.
- [ ] Store hidden rolls, revealed rolls, holds, bets, folded users, current turn, current round, and timeout state.
- [ ] Hide other players' rolls until reveal/end-of-round.
- [ ] Implement betting: bet, match, raise, fold, pot calculation, draw split.
- [ ] Implement timeout behavior: auto-roll, no holds/rerolls, auto-match.
- [ ] Update ELO for 2-5 players using pairwise comparisons and `backend/utils/elo.js`.

### Part 3B - WebSocket Server And Events
- [ ] Add WebSocket support beside Express, likely `ws` or Socket.IO.
- [ ] Define events: connect/auth, join-room, game-state, hold-dice, bet, match, raise, fold, leave-before-start, round-start, round-end, game-end, error.
- [ ] Add `GET /games/:gid/state` for reload/navigation restore.
- [ ] Emit state updates to all players and spectators in the game room.
- [ ] Keep player-private dice data private in emitted payloads.

### Part 3C - Frontend Web Components And Game Page
- [ ] Build `<game-board>`, `<game-die>`, and `<game-player>` Web Components.
- [ ] Add a React wrapper, e.g. `GameBoardWrapper.jsx`, to connect React state/WebSocket events to the Web Components.
- [ ] Replace the placeholder dice area in `GamePage`.
- [ ] Add betting controls and turn/phase display.
- [ ] Restore state on reload with `GET /games/:gid/state`, then subscribe to the WebSocket room.
- [ ] Add sound effects gated by the existing `sound` appearance preference.

## Priority 4 - Tournament Backend Flow

### Part 4A - Tournament Model And Rules
- [ ] Extend `backend/models/tournament.model.js` with `buyIn`, Elo min/max, points reward, author, cancellation status, full rules, standings, and round metadata.
- [ ] Decide one tournament type for the exam: random-pairing round-based.
- [ ] Remove, hide, or clearly explain unused arena/knockout complexity if it remains.

### Part 4B - Tournament Join/Leave/Cancel
- [ ] Validate upcoming status, cancellation status, verified user, Elo range, buy-in, capacity, duplicate joins, and available points on join.
- [ ] Deduct tournament buy-in points when appropriate.
- [ ] Allow users to leave tournaments at any point, per exam requirement.
- [ ] Add admin cancel endpoint.
- [ ] Add admin delete/edit behavior matching the exam text.

### Part 4C - Tournament Rounds And Standings
- [ ] Implement start flow: shuffle players and create Game docs for round 1.
- [ ] Implement advance flow: collect game results and create next round games.
- [ ] Implement finish flow: calculate winner by tournament points/standings.
- [ ] Award trophy and/or points reward to the winner.
- [ ] Add countdown data for next round start.
- [ ] Support redirecting tournament players to their active game and back.

## Priority 5 - Tournament Frontend

### Part 5A - Routes, Services, And Homepage Preview
- [ ] Add routes in `frontend/src/App.jsx`: `/tournaments`, `/tournaments/:id`, and admin create/edit routes.
- [ ] Expand `frontend/src/services/tournamentService.js` for search, sort, join, leave, cancel, standings, start, advance, finish.
- [ ] Add homepage preview of 5 upcoming tournaments.
- [ ] Add tournament link in the main header navigation.

### Part 5B - Tournament List Page
- [ ] Build `TournamentListPage`.
- [ ] Separate upcoming/ongoing tournaments from past tournaments.
- [ ] Add sorting by date, title, and number of players.
- [ ] Add title search after at least 3 characters.
- [ ] Add load-more pagination.
- [ ] Show title, date/time, variant, rounds, status, author, trophy, rules, and player count.

### Part 5C - Individual Tournament Page
- [ ] Build `TournamentPage`.
- [ ] Show full title, full description, date/time, rules, trophy image, players, standings, comments, and countdown.
- [ ] Add join/leave controls with anonymous/unverified handling.
- [ ] Show ongoing tournament games for spectators.
- [ ] Redirect joined players to their active game when a round starts.
- [ ] Add admin controls: delete, cancel, edit.

## Priority 6 - Profile, Stats, And User Game History

### Part 6A - Backend Profile Data
- [ ] Add points to the profile response.
- [ ] Ensure profile stats include Elo for `10/30/90`, total games, and last-month wins/losses.
- [ ] Add paginated recent games/all games endpoint for a user.
- [ ] Ensure email is only returned to the owner or admins.

### Part 6B - Frontend Profile UI
- [ ] Show points balance on `UserProfilePage`.
- [ ] Fix current labels/data: it references `elo3s`, but the exam wants `elo10s`, `elo30s`, `elo90s`.
- [ ] Show last-month wins/losses clearly.
- [ ] Add load-more for recent games or link to paginated full history.
- [ ] Keep profile image/about/password edit flow working with real auth.

### Part 6C - Profile Permissions And Edge Cases
- [ ] Ensure users can only edit their own profile unless admin.
- [ ] Hide email for non-owner/non-admin viewers.
- [ ] Handle banned users consistently.
- [ ] Add useful empty states for no trophies, no games, and no bio.

## Priority 7 - Homepage And Platform Activity

### Part 7A - Backend Activity Data
- [ ] Expand `GET /activity` to include active players, played games in the last week, and available games right now.
- [ ] Exclude anonymous games from platform activity if that is still the intended rule.
- [ ] Add homepage-friendly endpoint/query for 5 upcoming tournaments if the generic tournament endpoint is not enough.

### Part 7B - Homepage Components
- [ ] Add platform activity component to `HomePage`.
- [ ] Add tournament preview component to `HomePage`.
- [ ] Keep existing lobby preview and top games working with new game variant fields.

### Part 7C - UX/Responsive Polish
- [ ] Make homepage sections responsive.
- [ ] Add loading/error/empty states.
- [ ] Keep create-game call-to-action visible.
- [ ] Make displayed stats understandable for anonymous users.

## Priority 8 - Seed Data, Docs, And Final Demo Prep

### Part 8A - Seed Data
- [ ] Rewrite `backend/seed/seed.js` to use JSON data files, inspired by `projects/Seb/backend/project/seed/data/`.
- [ ] Seed users: registered, admin, banned, verified/unverified, with points, trophies, and Elo history.
- [ ] Seed game categories or variant combinations.
- [ ] Seed games: waiting, ongoing, finished, with different player counts and buy-ins.
- [ ] Seed tournaments: upcoming, ongoing, finished, cancelled, with players/rounds/trophies.
- [ ] Seed comments and security incidents.

### Part 8B - Documentation
- [ ] Update `documentation/api-specs.md` after endpoint changes.
- [ ] Update REST scripts with auth, game, tournament, admin, and comment examples.
- [ ] Add `.env.example` with all required backend/frontend variables.
- [ ] Update `README.md` setup/demo instructions.
- [ ] Update `NOTES.md` with starter-code credits, `projects/` references used, work distribution, and known unfinished items.

### Part 8C - Final Walkthrough And Shared Understanding
- [ ] Run lint/build and fix obvious warnings/errors.
- [ ] Test full demo path: seed database, register, verify email, login, create game, join game, play game, comment, join tournament, admin moderation, profile stats.
- [ ] Test failure cases: anonymous join, unverified join, insufficient points, banned comment, admin-only access.
- [ ] Each group member explains one backend route, one model, one frontend page, and one cross-cutting flow from someone else's work.

## Priority 9 - Security Incidents And Admin Shell

This is required by the exam, but it depends on real auth and platform data. Start it after the core user/game/tournament demo path works, unless one person is blocked and can begin the admin shell early.

### Part 9A - Security Incident Logging
- [ ] Add `SecurityIncident` model with `type`, `ip`, `userAgent`, `userId`, `createdAt`, and details.
- [ ] Log rate-limit incidents when users exceed the API limit.
- [ ] Log IP mismatch incidents when a token's issuing IP does not match the request IP.
- [ ] Return `401` on token IP mismatch so the client can request a fresh access token.

### Part 9B - Admin Backend Endpoints
- [ ] Add `GET /admin/stats` for new users, security incidents, active players, played games last week, and available games.
- [ ] Add admin user endpoints: list/search, ban/unban, make/remove admin.
- [ ] Add admin comment endpoints: recent comments and delete comment.
- [ ] Add admin security incident endpoint.
- [ ] Reuse existing services where possible, but keep admin routes clearly separated.

### Part 9C - Admin Frontend Pages
- [ ] Add admin layout with minimal header and no footer.
- [ ] Add dashboard page with platform stats, security incidents, and links to admin tools.
- [ ] Add user administration page with search, ban, and make-admin controls.
- [ ] Add comment administration page with recent comments and delete controls.
- [ ] Show admin navigation only for real admins.

## Priority 10 - Comments With WebSockets

REST comments already exist, so realtime comments are a lower priority than realtime gameplay. Do this after the game WebSocket is stable.

### Part 10A - Backend Comment Events
- [ ] Add comment WebSocket events for creating/updating/deleting comments.
- [ ] Broadcast new game comments to users in the game room.
- [ ] Broadcast new tournament comments to users on the tournament page.
- [ ] Keep REST comment endpoints as fallback.

### Part 10B - Shared Frontend Comment Component
- [ ] Extract a reusable comment component for games and tournaments if practical.
- [ ] Subscribe to comment WebSocket events.
- [ ] Append/delete comments without page reload.
- [ ] Keep regular REST fetch for initial load.

### Part 10C - Moderation And Error Handling
- [ ] Respect banned-user checks when creating comments.
- [ ] Handle deleted comments in realtime.
- [ ] Add clear loading, empty, and error states.
- [ ] Make admin comment deletion update open comment lists live.

## If Time Runs Out

Minimum credible demo:
- [ ] Real login/register with protected user identity.
- [ ] Create/join game with correct variants, points, buy-in, and leave-before-start.
- [ ] Playable or mostly playable game board using Web Components, with backend-owned rolls and WebSocket updates.
- [ ] Basic tournament list/page with join/leave, standings, and admin create/cancel/edit if possible.
- [ ] Profile shows points, correct Elo fields, stats, and recent games.
- [ ] Seed data and README/API docs are good enough to run the demo locally.

Safest features to simplify:
- [ ] Full admin dashboard depth.
- [ ] Realtime comments, as long as REST comments still work.
- [ ] Forgot-password.
- [ ] Extra tournament types beyond one random-pairing round-based format.
- [ ] Advanced sound effects beyond a simple preference-gated sound.
