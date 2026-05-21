# API Specifications - Spanish Poker Dice

All endpoints are relative to the base URL: `http://localhost:3000/api/v1`

## Headers

All requests should include these headers for proper identification:

| Header        | Values                       | Purpose                                           |
| ------------- | ---------------------------- | ------------------------------------------------- |
| `x-user-type` | `anonymous`, `user`, `admin` | Auth middleware - protects restricted routes      |
| `x-user-id`   | MongoDB ObjectId string      | Personal filtering (e.g. hide own games in lobby) |

---

## Users

### Register
`POST /users`
- Body: `{ "username", "email", "pwd", "dateOfBirth" }` (dateOfBirth: ISO 8601, e.g. `1990-05-20`)
- Rules: Must be 18+ years old. Returns 400 if underage or username taken.

### Login
`POST /users/login`
- Body: `{ "username", "password" }`
- Response: Full user object (password excluded)
- Returns 401 if credentials are wrong

### Get All Users
`GET /users`

### Get User Profile
`GET /users/:username`
- Response: Profile data, stats (monthly W/L, eloChangeLastWeek), trophies, and 10 most recent games

### Update Profile
`PUT /users/:username`
- Body: `FormData` with fields: `aboutMe` (string), `profileImage` (file), `pwd` (string, optional)
- Requires: `x-user-type: user`

### Update Appearance Preferences
`PATCH /users/:username/preferences`
- Body: `{ "theme", "boardColor", "sound", "lobbyCount" }`

### Ban User
`PATCH /users/:username/ban`
- Requires: `x-user-type: admin`

### Leaderboard
`GET /leaderboard`
- Query param: `?sortBy=elo` (default) | `wins` | `gamesPlayed` | `winRate`

---

## Games

### Get All Games
`GET /games`
- Query params: `?status=waiting` | `ongoing` | `finished`, `?limit=N`
- Server-side filtering uses `x-user-id` and `x-user-type` headers to exclude unsuitable games

### Get Top Games
`GET /games/top`
- Returns 5 games sorted by highest average player Elo. Fills with recent finished games if fewer than 5 are ongoing.

### Get Single Game
`GET /games/:gid`

### Create Game
`POST /games`
- Body:
```json
{
  "players": ["<userId>"],
  "variant": {
    "rounds": 3,
    "rules": "straights-allowed",
    "timeControl": 10
  },
  "allowAnonymous": true,
  "desiredElo": 1200
}
```
- Valid `rounds`: `3`, `5`, `7`
- Valid `rules`: `"straights-allowed"`, `"no-straights"`
- Valid `timeControl`: `3`, `10`, `30`

### Update Game
`PUT /games/:gid`

### Join Game
`PATCH /games/:gid/join`
- Body: `{ "player": "<userId>" }`
- Automatically sets status to `ongoing` when enough players have joined

### Get Comments for a Game
`GET /games/:gid/comments`

---

## Comments

### Get All Comments
`GET /comments`

### Get Single Comment
`GET /comments/:cid`

### Add Comment
`POST /comments`
- Body: `{ "body": "...", "author": "<userId>", "game": "<gameId>" }`
- Requires: `x-user-type: user`

### Update Comment
`PUT /comments/:cid`
- Body: `{ "body": "..." }`

### Delete Comment
`DELETE /comments/:cid`

---

## Tournaments

### Get All Tournaments
`GET /tournaments`

### Get Single Tournament
`GET /tournaments/:tid`

### Create Tournament
`POST /tournaments`
- Body: `FormData` with fields: `name`, `description`, `format`, `variant` (JSON string), `trophyImage` (file)
- Requires: `x-user-type: admin`

### Update Tournament
`PUT /tournaments/:tid`

### Join Tournament
`PATCH /tournaments/:tid/join`
- Body: `{ "player": "<userId>" }`

### Start Tournament (generate brackets)
`PATCH /tournaments/:tid/start`
- Uses Fisher-Yates shuffle to generate random bracket

### Get Comments for a Tournament
`GET /tournaments/:tid/comments`

---

## Activity

### Platform Activity
`GET /activity`
- Returns: number of ongoing games and active users this week

---

## Queues

### Get All Queues
`GET /queues`

### Get Single Queue
`GET /queues/:qid`

### Create Queue
`POST /queues`

### Update Queue
`PUT /queues/:qid`

### Delete Queue
`DELETE /queues/:qid`
