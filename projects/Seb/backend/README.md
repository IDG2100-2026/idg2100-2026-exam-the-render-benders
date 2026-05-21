# Backend

Express + MongoDB backend for the Spanish Poker Dice platform.

## What This Backend Includes

- REST API under `/api/v1`
- User, match, tournament, comment, trophy, and platform-stat endpoints
- MongoDB persistence through Mongoose
- Seed script for dummy test data
- API documentation and REST request collections

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose

## Folder Notes

- Main server entry: `backend/project/server.js`
- Environment file location: `backend/project/.env`
- Seed script: `backend/project/seed/seed.js`
- API docs: `backend/documentation/apiDocumentation.md`
- REST request files: `backend/REST scripts`

## Requirements

- Node.js
- npm
- MongoDB running locally

## Installation

From the `backend` folder:

```bash
npm install
```

## Environment Variables

Create `backend/project/.env` with:

```env
SERVER_PORT=9090
DB_HOST=localhost
DB_PORT=27017
DB_NAME=spanish_poker_dice
NODE_ENV=development
```

## Run The Backend

From `backend/`:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:9090/api/v1
```

## Seed The Database

From `backend/`:

```bash
npm run seed
```

The seed script inserts dummy data for local testing.

## Documentation

- API overview: [documentation/apiDocumentation.md](./documentation/apiDocumentation.md)
- Backend notes and assignment-specific backend changes:
  - [backend.md](./backend.md)
  - [project/readme.txt](./project/readme.txt)
- REST request files for testing endpoints:
  - [REST scripts/GET.http](./REST%20scripts/GET.http)
  - [REST scripts/POST.http](./REST%20scripts/POST.http)
  - [REST scripts/PATCH.http](./REST%20scripts/PATCH.http)
  - [REST scripts/DELETE.http](./REST%20scripts/DELETE.http)

## Notes

- This sprint does not require WebSockets.
- Authentication is simplified for the frontend sprint. (Login will always succeed)
- Tournament endpoints exist in the backend, but tournament UI work is optional for the frontend submission.
