# Frontend

React + Vite frontend for the Spanish Poker Dice platform.

## What This App Includes

- Homepage with platform activity, joinable game preview, and top games
- Login and registration pages
- Lobby page for joinable matches
- Create game flow with preset rulesets and direct rule controls
- Individual game page with reserved board area and comments
- User profile and user games pages
- About Us, About Spanish Dice, Terms, and Privacy pages
- Appearance settings for theme, board color, sound toggle, and homepage lobby count

## Tech Stack

- React
- React Router
- Vite
- CSS Modules

## Requirements

- Node.js
- npm
- Running backend API

## Installation

From the `frontend` folder:

```bash
npm install
```

## Environment Variables

Create a `.env` file inside `frontend/` with:

```env
VITE_API_PROTOCOL=http
VITE_API_HOSTNAME=localhost
VITE_API_PORT=9090
VITE_API_VERSION=v1
```

This makes the frontend call:

```text
http://localhost:9090/api/v1
```

## Run Locally

Start the development server from `frontend/`:

```bash
npm run dev
```

## Build And Preview

Create a production build:

```bash
npm run build
```

## Notes

- This sprint does not implement WebSockets.
- Real-time gameplay is not implemented yet.
- Real-time spectating and real-time comment updates are not implemented yet.
- Tournament functionality is optional for this delivery, and have not been implemented.