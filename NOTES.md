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


### (Seb) likely not from the starter project, but done afterwards
- [x] Tournament: leave, standings, delete, improved join + getAllTournaments
- [x] `GET /users/:username/trophies`
- [x] Comment `createComment` checks author is not banned
- [x] Frontend: 6 service files


## Seeding and launching the app

### Prerequisites
- Node.js installed
- MongoDB running locally on port `27017`

### Setup
1. Clone the repository
2. Run `npm install` from the root directory
3. Create `backend/.env.dev` based on the `.env.example` file in the repo


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
- Bug fixes

#### Seb
- Roll validation middleware and `heldIndexes` validation (#12)
- Multiplayer forfeit fix — correct pot/score distribution for 3+ players (#16)
- User game history route and profile stats (6A)
- Homepage activity data and upcoming tournament backend endpoints
- Dice hold click fix (#24)
- Betting round completion fix after all players act
- Frontend: 6 service files
- Various backend refactoring: centralised error helpers, shared helpers across services and sockets
- Bug fixes

#### Johan
- Timeout fallback: auto-acts for disconnected players, rejects actions after turn expires
- Player stacks and current bet on game board (later merged with Tobias's economy bar)
- Round result feedback and hand evaluation display
- Anonymous homepage with login/register hero CTA
- Spectating without login (#26)
- Seed data fixes: `emailVerified` for seed users, split seed data into JSON files
- Component restructuring: moved page sub-components to components folder
- Norwegian date format via `formatDate` utility
- Various small fixes: favicon, header breakpoint, dice icon colour, Enter-to-submit comments, game-deleted navigation
- Bug fixes


## Unfinished parts 
There were some parts of the application that we did not have time to implement, some of these were: 
- Tournament functionality
    - We have the tournament list page and a page for individual tournament. We also have backend functionality for tournaments (join, leave, standings etc.) but the frontend is missing 

There were also parts of the task description that we decided to do differently, such as: 
- Anonymous players can still play the game 
- Sound effects

