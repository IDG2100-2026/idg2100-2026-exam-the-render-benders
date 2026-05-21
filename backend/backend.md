# Backend - Spanish Poker Dice Platform

> Put your backend project here - Don't forget to include a seeding script and instructions on how to launch the project. List external dependencies (e.g., MongoDB running on a specific port).


The backend is based on the Oblig 2 submission. The following changes were made for Oblig 3.

## Changes from Oblig 2

### CORS support
Added the `cors` package to allow the frontend (running on a different port) to make requests to the backend.

- Installed: `npm install cors`
- Added `app.use(cors())` in `app.js`, before the rate limiter

### Login endpoint
Added a login endpoint so the frontend can authenticate users.

- Route: `POST /api/v1/users/login`
- Accepts: `{ username, password }` in the request body
- Hashes the password with MD5 + salt and compares to stored hash
- Returns the user object without the password field on success
- Returns 401 if the username or password is wrong

Files changed: `routers/user.router.js`, `controllers/user.controller.js`, `services/user.service.js`

### MD5 + Salt password hashing
Implemented secure password hashing using MD5 with a salt value from the environment.

- `utils/hash.js` - exports a `hashPassword(pwd)` function that concatenates the salt and hashes with MD5
- `config/constants.js` - reads `APP_SALT` from `.env`
- Applied at registration, login, and profile password updates
- Passwords are never stored in plain text and stripped from all API responses

### Request identification headers
The frontend sends two custom headers on every API request to identify the user:

- `x-user-type` - `"user"` or `"anonymous"`. Used by auth middleware to protect routes.
- `x-user-id` - the logged-in user's MongoDB ObjectId. Used by game service to exclude the user's own games from lobby results and for personal filtering.

Both values are stored in `localStorage` on login and cleared on logout.

### Replaced age with dateOfBirth
Changed the user model to store date of birth instead of age, since age becomes incorrect over time.

- `models/user.model.js` - replaced `age: Number` with `dateOfBirth: Date`
- `validators/user.validator.js` - replaced age validation with `isISO8601()` date validation
- `services/user.service.js` - added age calculation and 18+ check in `createUser`
- `seed/users.json` - replaced `age` values with `dateOfBirth` in ISO 8601 format (`YYYY-MM-DD`)

### Added aboutMe, profileImage and separate ELOs to user model
Added fields to the User model to support profile customization and performance tracking across different game variants.

- `models/user.model.js` - added `aboutMe` (string), `profileImage` (string), and separate ELO fields: `elo3s`, `elo10s`, `elo30s`
- `services/user.service.js` - updated `updateUser` to handle new profile fields; `getUser` calculates and returns `monthlyWins`, `monthlyLosses` (last 30 days), and `eloChangeLastWeek`
- `validators/user.validator.js` - added `aboutMe` character limit validation

### Elo logic for game variants
Updated the game completion logic to handle separate Elo ratings based on the game's time control (3s, 10s, or 30s).

- `services/game.service.js` - `updateGame` detects the variant and updates the corresponding user Elo field (`elo3s`, `elo10s`, or `elo30s`). The general Elo is also updated based on the average change.

### File uploads (Multer) + unified asset storage
All images are stored in `backend/uploads/` - both user-uploaded profile pictures and the demo avatars (`user1-5.jpg`, `default-avatar.svg`).

- `middleware/upload.middleware.js` - configured disk storage and image-only file filtering
- `app.js` - `app.use("/uploads", express.static("uploads"))` serves all images via URL
- `routers/user.router.js` - `uploadProfileImage` middleware integrated in the user update route
- `controllers/user.controller.js` - handles `req.file` and generates a full URL for the image
- Frontend resolves image paths using `getAssetUrl(path)` in `api.js`

### Rate limiting fix
Modified the rate limiter in `app.js` to return a JSON response instead of plain text. This prevents frontend parsing errors when a user makes too many requests.

### Server-side matchmaking filtering
All lobby filtering has been moved from the frontend to `game.service.js` for security and correctness.

A game is excluded from lobby results if:
- The requesting user (`x-user-id`) is already a participant (`$ne` query)
- The Elo difference between the user and `desiredElo` is greater than 200
- The user is anonymous (`x-user-type: "anonymous"`) and `allowAnonymous` is false

### Waiting status, allowAnonymous, desiredElo, and join game endpoint
Added fields and functionality needed for the lobby and create game features.

- `config/constants.js` - added `"waiting"` to `GAME_STATUSES`
- `models/game.model.js` - added `allowAnonymous` and `desiredElo`; default status is `"waiting"`
- `services/game.service.js` - added `.populate("players", "username elo elo3s elo10s elo30s")` and `joinGame` function
- `controllers/game.controller.js` - added `joinGame` controller
- `routers/game.router.js` - added `PATCH /api/v1/games/:gid/join`

### Populate author in comment responses
Added `.populate("author", "username")` so comment endpoints return the author's username instead of the MongoDB ObjectId.

- `services/comment.service.js` - added populate to `getCommentsByGame` and `createComment`

### Appearance preferences
Added a `preferences` field to the user model so appearance settings can be saved per user.

- `config/constants.js` - added `DEFAULT_THEME`, `DEFAULT_BOARD_COLOR`, `DEFAULT_SOUND`, `DEFAULT_LOBBY_COUNT`
- `models/user.model.js` - added `preferences` subdocument with defaults from constants
- `services/user.service.js` - added `updatePreferences` function
- `controllers/user.controller.js` - added `updatePreferences` controller
- `routers/user.router.js` - added `PATCH /api/v1/users/:username/preferences`

### Trophy system
Trophies are stored as an array of objects on the user model with `title` and `image` fields.

- `$addToSet` operator used when awarding trophies to prevent duplicates
- `seed.js` seeds sample trophies (Grandmaster, Tavern Legend) with public CDN icon URLs
- `UserProfilePage` displays the trophy cabinet when `profile.trophies?.length > 0`

### Top games endpoint
Added a specialized endpoint for the homepage Top Games section.

- `services/game.service.js` - `getTopGames` calculates average Elo, sorts descending, fills with recent finished games if fewer than 5 are ongoing
- `controllers/game.controller.js` - `getTopGames` controller
- `routers/game.router.js` - `GET /api/v1/games/top` (placed before `:gid` to avoid route conflicts)

### Full tournament support
The backend includes a full implementation of the Tournament feature as required by Oblig 2.

- `models/tournament.model.js` - stores name, description, format, variant, and signed-up players
- `services/tournament.service.js` - handles player signups and bracket generation (Fisher-Yates shuffle)
- `routers/tournament.router.js` - list, view, create, and join endpoints

### Seeding
Run with `npm run seed` from the `backend/` directory.

- `seed/users.json` - rich test data: bios, variant Elos, realistic stats, trophies, avatar filenames
- `seed/seed.js` - seeds users, games (waiting/ongoing/finished mix), and tournaments
- Valid `timeControl` values: `3`, `10`, `30` (not 15)
- Demo avatar images (`user1-5.jpg`) must be present in `backend/uploads/` before seeding

## Environment variables (.env)

```
NODE_ENV=development
APP_PORT=3000
APP_SALT=pokerdice_salt_2026
DB_HOSTNAME=localhost
DB_PORT=27017
DB_NAME=pokerdice_app
```

The `.env` file is in `.gitignore` and must be created manually on each machine.
