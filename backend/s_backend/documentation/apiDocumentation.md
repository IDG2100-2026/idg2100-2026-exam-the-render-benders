# Introduction: Spanish Poker Dice Platform API

## Author

- Sebastian Maurbakken

## Problem Statement

The Spanish Poker Dice Platform needs a backend API to support a multiplayer dice game platform. The platform must allow users to register and manage profiles, be automatically matched against suitable opponents, play and record matches, participate in tournaments, view leaderboards, and leave comments. There are three user roles with different levels of access: anonymous users, registered users, and admins. Admins additionally need tools to manage users, moderate comments, create tournaments, and manage game categories.

## Solution

The solution relies on a client-server architecture using the MERN stack (MongoDB, Express.js, Node.js). The backend exposes a REST API that the frontend consumes. The API supports the following scenarios and operations:

- User registration, profile management, and basic role-based access control
- Automatic matchmaking between registered users based on ELO rating proximity, with a relaxing tolerance window over time
- Match creation, result recording, and ELO rating updates using the standard ELO formula
- Knockout and arena tournament management including random/ELO-based pairing, round advancement, and standings
- Global, weekly, and filtered leaderboards
- Comments on matches and tournaments
- Trophy creation with image upload, awarded to tournament winners
- Platform activity statistics

## Implementation

The project follows a layered MVC-style (Model-view-controller) architecture:

**Models** (`project/models`): Mongoose schemas for all data collections: `User`, `Match`, `GameCategory`, `Tournament`, `Comment`, `Trophy`.

**Controllers** (`project/controllers`): One controller per resource, containing all business logic for that resource. Controllers validate input, interact with models, and return structured JSON responses.

**Validators** (`project/validators`): Lightweight manual validators per resource that validate IDs and field values before database operations. These return a structured `{ valid, error, message }` object so controllers can respond consistently.

**Router** (`project/routers/api.v1.router.js`): A single versioned Express router that maps all routes to controller methods and applies role-based middleware where needed.

**Middleware** (`project/utils/auth.middleware.js`): `attachUser` reads `X-User-Type` and `X-User-Id` headers and attaches them to `req.user`. `requireRole(...roles)` guards routes by checking the attached user type.

**Services** (`project/services/matchmaking.service.js`): An in-memory matchmaking queue that runs on a background timer (`setInterval`), scanning for compatible players and creating match documents when a pair is found. A second timer resets weekly ELO change every 7 days.

**Config** (`project/config`): `db.config.js` handles MongoDB connection/disconnection. `multer.config.js` configures disk storage for trophy image uploads.

**Architectural decisions:**

- Custom `nanoid`-based string IDs (e.g. `user_abc123`) are used instead of MongoDB ObjectIds for human-readable references across all collections.
- ELO ratings are updated directly on the `User` document after each match result is saved, using K=32 and the standard expected-score formula.
- The matchmaking queue is held in memory (a `Map`) rather than persisted to the database, as it represents transient state. Players poll a status endpoint to discover when they have been matched.
- Tournaments support two types: `knockout` (single-elimination with byes for odd player counts) and `arena` (timed, continuous pairing by closest points, with an `arenaScores` subdocument tracking per-player points).
- All list endpoints support `limit` and `offset` pagination and return a `pagination` object in the response.

---

# API Specification

## Authentication

Authentication is handled via HTTP request headers on every request. The frontend must include the following headers:

| Header | Values | Required |
|---|---|---|
| `X-User-Type` | `anonymous`, `registered`, `admin` | Yes (defaults to `anonymous` if omitted) |
| `X-User-Id` | The user's `_id` string (e.g. `user_abc123`) | Required for `registered` and `admin` requests |

The `attachUser` middleware reads these headers and attaches `{ userType, userId }` to `req.user` for every request. Protected routes use the `requireRole(...roles)` middleware, which checks `req.user.userType` against the allowed roles and returns `403 Forbidden` if the caller does not qualify.

**Role summary:**

| Role | Can do |
|---|---|
| `anonymous` | Read public data (users, matches, leaderboards, tournaments, trophies, platform stats) |
| `registered` | Everything anonymous can do, plus create matches, post comments, join/leave tournaments, use matchmaking |
| `admin` | Everything registered can do, plus create/update/delete any resource, manage users, moderate comments |

---

## Errors

All error responses follow a consistent JSON envelope:

```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Human-readable description of what went wrong"
}
```

| HTTP Status Code | Error | When it occurs |
|---|---|---|
| 400 Bad Request | Bad Request | Missing required fields, invalid field values, malformed IDs, tied match scores |
| 401 Unauthorized | Unauthorized | `requireRole` middleware runs before `attachUser` (should not happen in normal use) |
| 403 Forbidden | Forbidden | Caller's role is not in the allowed list for that route; attempting to change a locked field (e.g. username); banned user performing a restricted action |
| 404 Not Found | Not Found | Referenced resource does not exist; route does not exist |
| 409 Conflict | Conflict | Duplicate username; saving result on a completed match; joining a full or started tournament; player already in matchmaking queue |
| 500 Internal Server Error | Internal Server Error | Unhandled server-side exception |

---

## Endpoints

### Users

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `GET /users` | Get all users, optionally filtered by type, with pagination | Query: `limit` (default 20, max 100), `offset` (default 0), `userType` (`registered`/`anonymous`/`admin`) | 200 with array of user objects and `pagination` metadata |
| `GET /users/:uid` | Get a single user by ID | Route: `uid` (user ID string) | 200 with user object; 404 if not found |
| `POST /users` | Register a new user | Body: `username` (string, 3–30 chars, unique), `age` (integer ≥ 18), `userType` (optional, defaults to `anonymous`) | 201 with created user; 400 if validation fails; 409 if username taken |
| `PATCH /users/:uid` | Update a user's age or type. Username cannot be changed. | Route: `uid`. Body: `age` (integer ≥ 18, optional), `userType` (optional). Headers: `registered` or `admin` role required | 200 with updated user; 400 if underage; 403 if attempting to change username or insufficient role; 404 if not found |
| `DELETE /users/:uid` | Delete a user by ID | Route: `uid`. Headers: `admin` role required | 200 with deleted user; 404 if not found |
| `GET /users/:uid/matches` | Get all matches a user has participated in | Route: `uid` | 200 with array of populated match objects |
| `GET /users/:uid/recent-games` | Get the 10 most recent matches for a user | Route: `uid` | 200 with array of up to 10 match objects |
| `GET /users/:uid/stats` | Get a user's statistics | Route: `uid` | 200 with `{ username, eloRating, eloRatingChange, wins, losses, totalMatches, winPercentage }` |
| `GET /users/:uid/trophies` | Get all trophies won by a user (from completed tournaments where they are the winner) | Route: `uid` | 200 with array of trophy objects |

---

### Game Categories

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `GET /game-categories` | Get all game categories | None | 200 with array of category objects |
| `GET /game-categories/:gcid` | Get a single game category by ID | Route: `gcid` | 200 with category object; 404 if not found |
| `GET /game-categories/by-name` | Get a game category by name | Query: `name` (string) | 200 with matching category; 404 if not found |
| `POST /game-categories` | Create a new game category | Body: `name` (string, unique), `numOfRounds` (3, 5, or 7), `straightsAllowed` (boolean), `timePerRound` (3, 10, or 30). Headers: `admin` role required | 201 with created category; 400 if validation fails; 409 if name already exists |
| `PATCH /game-categories/:gcid` | Update a game category | Route: `gcid`. Body: any of `name`, `numOfRounds`, `straightsAllowed`, `timePerRound`. Headers: `admin` role required | 200 with updated category; 400 if invalid values; 404 if not found; 409 if new name already exists |
| `DELETE /game-categories/:gcid` | Delete a game category | Route: `gcid`. Headers: `admin` role required | 200 with deleted category; 404 if not found |

---

### Matches

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `GET /matches` | Get all matches with optional filters and pagination | Query: `visibility` (`public`/`private`), `gameType` (category ID), `player` (user ID), `status` (`pending`/`ongoing`/`completed`), `limit` (default 20, max 100), `offset` (default 0) | 200 with array of populated match objects and pagination |
| `GET /matches/:mid` | Get a single match by ID with all populated references | Route: `mid` | 200 with match object; 404 if not found |
| `GET /matches/:mid/spectate` | Get a public match for spectating | Route: `mid` | 200 with match object; 403 if match is private; 404 if not found |
| `GET /matches/:mid/comments` | Get all comments on a match | Route: `mid` | 200 with array of comment objects; 404 if match not found |
| `POST /matches` | Create a new match. If `player2` is omitted, match status is `pending`. | Body: `player1` (user ID, required), `player2` (user ID, optional), `gameType` (category ID, required), `visibility` (`public`/`private`, optional). Headers: `registered` or `admin` role required | 201 with populated match; 400/404 if players or category not found; 403 if a player is banned |
| `POST /matches/:mid/result` | Save the result of a match. Determines winner/loser, marks match completed, and updates ELO for registered players. | Route: `mid`. Body: `player1Score` (integer ≥ 0), `player2Score` (integer ≥ 0, must differ). Headers: `registered` or `admin` role required | 200 with updated match; 400 if scores are tied or invalid; 409 if match already completed |
| `POST /matches/:mid/invite` | Invite a user to a pending match | Route: `mid`. Body: `invitedUserId` (user ID). Headers: `registered` or `admin` role required | 200 with confirmation; 404 if match or user not found |
| `POST /matches/:mid/join` | Join a pending match as player 2, setting status to `ongoing` | Route: `mid`. Body: `userId` (user ID). Headers: `registered` or `admin` role required | 200 with updated match; 403 if user is banned; 409 if match already has two players |
| `POST /matches/:mid/comments` | Post a comment on a match | Route: `mid`. Body: `author` (user ID), `content` (string, max 1000 chars). Headers: `registered` or `admin` role required | 201 with created comment; 403 if author is banned; 404 if match or author not found |
| `PATCH /matches/:mid` | Update a match's visibility or tournament assignment | Route: `mid`. Body: `visibility` (optional), `tournament` (tournament ID, optional). Headers: `admin` role required | 200 with updated match; 404 if not found |
| `DELETE /matches/:mid` | Delete a match | Route: `mid`. Headers: `admin` role required | 200 with deleted match; 404 if not found |

---

### Matchmaking

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `POST /matchmaking/join` | Add a registered user to the matchmaking queue for a given game category. The service pairs players by ELO proximity on a background timer; ELO window relaxes every 10 seconds until capped at ±600. | Body: `userId` (user ID), `gameCategory` (category ID). Headers: `registered` or `admin` role required | 200 with confirmation; 409 if already queued, banned, or anonymous |
| `DELETE /matchmaking/leave` | Remove the user from the matchmaking queue | Body: `userId` (user ID). Headers: `registered` or `admin` role required | 200 with confirmation; 404 if not in queue |
| `GET /matchmaking/status/:uid` | Poll for matchmaking status. Returns `not_in_queue`, `searching` (with wait time and current ELO window), or `matched` (with match object). Removes user from queue once match is collected. | Route: `uid`. Headers: `registered` or `admin` role required | 200 with `{ status, data? }` |
| `GET /matchmaking/queue` | Get a snapshot of all players currently in the queue | Headers: `admin` role required | 200 with array of queue entries including userId, ELO, category, wait time |

---

### Tournaments

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `GET /tournaments` | Get all tournaments, optionally filtered | Query: `status`, `tournamentType`, `gameCategory` | 200 with array of populated tournament objects |
| `GET /tournaments/:tid` | Get a single tournament by ID | Route: `tid` | 200 with tournament object; 404 if not found |
| `GET /tournaments/:tid/standings` | Get tournament standings. Knockout returns rounds array; arena returns participants ranked by points with time remaining if ongoing. | Route: `tid` | 200 with standings data |
| `GET /tournaments/:tid/matches` | Get all matches belonging to a tournament | Route: `tid` | 200 with array of match objects |
| `GET /tournaments/:tid/comments` | Get all comments on a tournament | Route: `tid` | 200 with array of comment objects |
| `POST /tournaments` | Create a new tournament | Body: `title`, `tournamentType` (`knockout`/`arena`), `gameCategory` (ID), `startDateTime` (must be in future), `createdBy` (user ID), `description` (optional), `durationMinutes` (optional, for arena, default 60). Headers: `admin` role required | 201 with created tournament; 400 if validation fails or date is not in future |
| `POST /tournaments/:tid/join` | Join a pending tournament as a participant | Route: `tid`. Body: `userId`. Headers: `registered` or `admin` role required | 200 with updated tournament; 403 if banned or tournament already started; 409 if full or already joined |
| `POST /tournaments/:tid/leave` | Leave a pending tournament | Route: `tid`. Body: `userId`. Headers: `registered` or `admin` role required | 200 with confirmation; 403 if tournament already started |
| `POST /tournaments/:tid/pairings` | Generate round 1 pairings for a knockout tournament (randomly shuffled). Sets status to `ongoing`. Assigns a bye to the odd player out if needed. | Route: `tid`. Headers: `admin` role required | 200 with updated tournament; 400 if not enough participants or wrong type; 409 if not pending |
| `POST /tournaments/:tid/advance` | Advance a knockout tournament to the next round. Checks all current-round matches are completed, collects winners, and creates the next round or completes the tournament. | Route: `tid`. Headers: `admin` role required | 200 with next round info or tournament-complete message; 409 if matches incomplete |
| `POST /tournaments/:tid/arena-start` | Start an arena tournament. Records real start time and creates round 1 by pairing participants sorted by ELO ascending (closest ELOs play first). | Route: `tid`. Headers: `admin` role required | 200 with updated tournament and `endsAt` timestamp; 409 if not pending or wrong type |
| `POST /tournaments/:tid/arena-advance` | Advance arena to next round or close it. If time has expired, closes tournament and declares the highest-points participant the winner. Otherwise pairs by closest current point totals. | Route: `tid`. Headers: `admin` role required | 200 with round info or final standings; 409 if current round incomplete |
| `POST /tournaments/:tid/arena-result` | Record the result of an arena match and award 1 point to the winner in `arenaScores` | Route: `tid`. Body: `matchId`, `player1Score`, `player2Score`. Headers: `registered` or `admin` role required | 200 with winner and updated arenaScores; 409 if match already completed |
| `PATCH /tournaments/:tid` | Update tournament metadata | Route: `tid`. Body: any of `title`, `description`, `status`, `durationMinutes`. Headers: `admin` role required | 200 with updated tournament; 404 if not found |
| `DELETE /tournaments/:tid` | Delete a tournament (only if still pending) | Route: `tid`. Headers: `admin` role required | 200 with confirmation; 403 if already started; 404 if not found |

---

### Comments

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `GET /comments` | Get all comments across the platform, with optional filters and pagination | Query: `commentType` (`match`/`tournament`), `author` (user ID), `limit` (default 50, max 100), `offset`. Headers: `admin` role required | 200 with array of populated comment objects and pagination |
| `DELETE /comments/:cid` | Delete a comment. Allowed if the caller is the comment's author or an admin. | Route: `cid`. Body: `userId` (the caller's ID). Headers: `registered` or `admin` role required | 200 with deleted comment; 403 if not author and not admin; 404 if not found |
| `DELETE /comments/:cid/admin` | Delete any comment as admin, no authorship check | Route: `cid`. Headers: `admin` role required | 200 with deleted comment; 404 if not found |

Note: creating comments is done through the match and tournament routes (`POST /matches/:mid/comments` and `POST /tournaments/:tid/comments`).

---

### Leaderboards

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `GET /leaderboards` | Global leaderboard sorted by ELO rating descending, with rank added to each entry | Query: `limit` (default 50, max 100), `offset` | 200 with ranked user array and pagination |
| `GET /leaderboards/user/:uid` | Get a specific user's rank and full stats (wins, losses, win%) | Route: `uid` | 200 with rank, ELO, and stats object; 404 if not found |
| `GET /leaderboards/type` | Leaderboard filtered by user type | Query: `userType` (`registered`/`anonymous`/`admin`), `limit`, `offset` | 200 with filtered ranked array and pagination |
| `GET /leaderboards/weekly` | Leaderboard sorted by `eloRatingChange` descending (resets every 7 days) | Query: `limit`, `offset` | 200 with ranked array and pagination |
| `GET /leaderboards/top` | Top N players by ELO rating | Query: `count` (default 10, max 100) | 200 with array of top players |
| `GET /leaderboards/compare` | Head-to-head comparison between two players including overall stats and their history against each other | Query: `uid1`, `uid2` (both required, must differ) | 200 with comparison object for both players and head-to-head record; 404 if either user not found |

---

### Trophies

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `GET /trophies` | Get all trophies | None | 200 with array of trophy objects |
| `GET /trophies/:tid` | Get a single trophy by ID | Route: `tid` | 200 with trophy object; 404 if not found |
| `POST /trophies` | Create a trophy, optionally with an uploaded image | Multipart form: `title` (string), `tournamentId` (tournament ID), `image` (file, optional — JPEG/PNG/GIF/WebP, max 5MB). Headers: `admin` role required | 201 with created trophy; 400 if title or tournamentId missing; 404 if tournament not found |
| `POST /trophies/upload` | Upload a trophy image only (returns the image URL without creating a trophy document) | Multipart form: `image` (file — JPEG/PNG/GIF/WebP, max 5MB). Headers: `admin` role required | 201 with `{ filename, imageUrl, size }` |
| `DELETE /trophies/:tid` | Delete a trophy | Route: `tid`. Headers: `admin` role required | 200 with deleted trophy; 404 if not found |

---

### Platform Stats

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `GET /stats/platform` | Get platform-wide activity statistics | None | 200 with `{ totalUsers, registeredUsers, totalMatches, ongoingMatches, activeUsersThisWeek, recentMatches }` — `recentMatches` is the 10 most recently created matches |

---

### Admin

| URI (verb and route) | Description | Inputs | Outputs |
|---|---|---|---|
| `GET /admin/users` | Search users by username (case-insensitive regex) and/or filter by type | Query: `username` (optional), `userType` (optional). Headers: `admin` role required | 200 with matching user array |
| `PATCH /admin/users/:uid/ban` | Ban a user, preventing them from posting comments, joining matches, or using matchmaking | Route: `uid`. Headers: `admin` role required | 200 with updated (banned) user; 404 if not found |
