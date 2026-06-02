# Leave below any info you want examiners to see

Including the info on the starter code (whose repository and how used), notes on seeding and launching the app, optional info on the work distribution within the team, and notes on unfinished parts of the project and unpatched bugs.

## Startup Codebase 
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


## Seeding and launching the app

### Prerequisites
- Node.js installed
- MongoDB running locally on port `27017`

### Setup
1. Clone the repository
2. Run `npm install` from the root directory
3. Create `backend/.env.dev` with the following variables:
```
NODE_ENV=development
APP_PORT=3000
DB_HOSTNAME=localhost
DB_PORT=27017
DB_NAME=poker
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
APP_SALT=your_salt
FRONTEND_URL=http://localhost:5173
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_16_char_app_password
```

4. Create `frontend/.env` with:
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
```

### Seed the database
```bash
npm run seed
```
This populates the database with users, games, and tournaments from the JSON files in `backend/seed/data/`.

### Start the app
```bash
npm run dev
```
This starts both the backend (port `3000`) and the frontend (port `5173`) concurrently. The app is available at `http://localhost:5173`.

### Seed credentials
| Role         | Username      | Password       |
| ------------ | ------------- | -------------- |
| Admin        | `admin`       | `Adminpass1!`  |
| Regular user | `carlos88`    | `Password123!` |
| Banned user  | `banned_user` | `Password123!` |

## Work distribution
We wanted to make the work distribution as fair and equal as possible. We therefore divided the project into phases, with each phase containing a feature or functionality. Within each phase, we used AI to divide into tangible tasks for each member, which helped us work together on the same problems and made sure everyone was involved in all parts of the application and learned from it. After each phase, we presented what we had done and explained to each other. After everyone had explained, we discussed how it all came together and tried to explain to each other things that were unclear. 

This work distribution helped us a lot with both taking ownership of each part of the code, while also getting good updates and explanations for the things we did not understand or do ourselves. 

After implementing the phases, we went through a phase of checking for bugs and fixing things. This took longer than anticipated, and therefore hindered us from doing everything in the project description. 

### The work done: 
#### Tobias
- Socket.IO server: game rooms, cookie-based auth, `buildGameState` / `sanitizeGameForViewer` (hides other players' hidden dice)
- All betting socket events (`bet`, `match`, `raise`, `fold`, `check`) with auth guard and per-socket personalised state emit
- Game economy: buy-in deduction on game creation, points validation, weekly grant endpoint, stack return on finish/forfeit
- Reusable `Comments` component with live Socket.IO updates and REST fallback
- Tournament list page (search, sort, upcoming/ongoing/past sections) and tournament detail page
- Points balance on profile page
- `PlatformActivity` and `TournamentPreview` components on the homepage
- Economy bar on the game board (player stacks + current bet)
- Admin section: `AdminLayout` with its own header/nav, `AdminDashboardPage` (platform activity + links), `AdminUsersPage` (search, ban/unban), `AdminCommentsPage` (list + delete), `AdminCreateTournamentPage` (full form); all behind `AdminRoute` at `/admin/*`; admin link in header shown only to admins
- Security fix: `GET /users` now requires admin (was publicly accessible)
- `banUser` service now toggles ban status (enables unban, not just ban)
- Clear held dice when round ends or game finishes; refresh user points in header after game finishes
- Trophy display on tournament winner section
- Bug fixes including bet contributions not persisting between turns (Mongoose subdocument proxy issue), correct tournament name field in search/sort, all-in player blocking betting round

#### Seb
- **Auth backend:** entire JWT + httpOnly cookie auth system - `auth.service.js`, `auth.router.js`, `auth.controller.js`, `EmailVerification` schema, `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/verify-email`, `POST /auth/resend-verification`; tokens stored as httpOnly cookies; refresh tokens hashed with SHA-256 in MongoDB
- **Game state machine:** game phases (rolling/betting/round-ended/finished), hidden/revealed dice (rolls only revealed to owner until round end), backend-only dice generation, betting logic (bet/match/raise/fold/check), pot calculation and draw split
- **Comment WebSocket:** broadcasting `comment-created` and `comment-deleted` events to game rooms and tournament rooms; `populate` fix on REST comment responses
- **ELO recalculation** at game end - adapted for 2+ players: each pair of players runs the standard ELO formula, win/loss determined by final stack size
- **Backend timeout handling** - server-side fallback if client does not call timeout
- User game history route and profile stats (6A) - sanitized response (hides other players' hidden dice in results)
- Homepage activity data and upcoming tournament backend endpoints
- Roll validation middleware and `heldIndexes` validation (#12)
- Multiplayer forfeit fix - correct pot/score distribution for 3+ players (#16)
- Dice hold click fix (#24)
- Betting round completion fix after all players act
- Round result feedback: hand name, winner, and points won displayed after each round
- Frontend: 6 service files (userService, gameService, tournamentService, commentService, leaderboardService, activityService)
- Backend refactoring: centralised error helpers, shared helpers across services and sockets
- Bug fixes: E11000 guest email key, double-refresh, game state sync, round betting limits, immediate email verification

#### Johan
- **Authentication flow:** rewired `apiFetch` with `credentials: "include"`, automatic 401 retry with token refresh (raw `fetch` used for refresh to avoid infinite recursion), `AuthProvider` restores session on mount via `POST /auth/refresh`, login/register pages wired to auth endpoints, `EmailVerificationPage` (auto-send on mount, single message state), verify-email banner on profile, `ProtectedRoute` and `AdminRoute` route guards
- **Game board and realtime play:** `<game-die>` and `<game-board>` native Web Components with shadow DOM (CSS custom properties for responsive sizing, styles in `<style>` tag inside shadowRoot), `GameBoard.jsx` React bridge connects via Socket.IO, handles roll/bet/timeout actions, countdown timer turns red at 5s and fires timeout endpoint exactly once, held dice tracked in a `Set`, state restored from REST on page load, spectator mode
- **Game creation and lobby:** `CreateGamePage` with numPlayers (2/3/5) and buyIn (1/10/50) selectors, 5 client-side lobby filters, LobbyCard shows buy-in and player count, anonymous "Play as Guest" for `allowAnonymous` games, points balance chip in header greeting
- **Profile permissions:** email hidden from non-owners, banned account banner, trophies empty state, edit button only visible to owner, guest users cannot open edit profile
- **UX polish:** loading states on lobby/homepage sections, `--success`/`--danger` CSS variables replacing hardcoded hex colours, anonymous homepage hero shows Login/Register, platform activity guest message
- **Comment moderation:** delete button for comment owners and admins, banned-user error feedback, removed local state append (WebSocket broadcast handles it - local append caused duplicates)
- **Email verification:** `backend/services/email.service.js` with nodemailer Gmail SMTP; styled HTML email (dark theme, gold code, dice emoji); falls back to `console.log` if env vars missing
- Timeout fallback: non-current-player clients call timeout after 1s if current player is unresponsive; backend rejects rolls/bets after turn has expired
- Seed data refactor: split inline data into `games.json`, `comments.json`, `tournaments.json` with username references; fixed `emailVerified` and points for all seed users
- Component restructuring: all page sub-components moved to `frontend/src/components/`; `formatDate` utility for Norwegian locale dates (DD.MM.YYYY); favicon as hexagonal dice SVG
- Bug fixes: #25, #26, #27, #28, #29, #31, #32, #33, #34, #38, #40, #42, #44, #45, #46


## Unfinished parts 
There were some parts of the application that we did not have time to implement, some of these were: 
- Tournament functionality
    - We have the tournament list page and a page for individual tournament. We also have some backend functionality for tournaments (join, leave, standings etc.), but there is logic not implemented - brackets for knockout, round matching for arena and the standings/progression UI are all missing.
- Some Admin functionality (make users admin/un-admin users)

There were also parts of the task description that we decided to do differently, such as: 
- Anonymous players can still play the game 
- Sound effects

- **Admin dashboard security incidents:** the dashboard shows platform activity but does not track or display rate-limit hits or IP-change incidents (rate limit hits and IP changes) as described in the spec
- **"Make admin" in user administration:** admin users page supports ban/unban but not promoting users to admin
- **Forgot password page:** email verification and password change on profile are implemented, but a dedicated forgot-password flow (reset by email) is not

