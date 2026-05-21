# Spanish Poker Dice Platform

A modern full-stack web application for playing Spanish Poker Dice online. This project was developed as part of Obligatory Assignment 3 in the course IDG2100 Full-stack Web Development at NTNU Gjøvik, Spring 2026.

## About the Game
Spanish Poker Dice is a traditional dice game played with 5 dice. Players roll the dice and attempt to achieve the best combinations (pair, two pair, three of a kind, straights, full house, four of a kind, or five of a kind). This platform allows you to compete against others, climb the Elo ladder, and earn trophies.

## Key Features
- **Homepage:** Overview of active games (Top Games), lobby preview, and an introduction to the platform.
- **Lobby:** View all games waiting for players. Includes advanced filtering based on user Elo rating and anonymity settings.
- **Create Game:** Flexible game creation with 18 different variants (rounds, rules, and time controls).
- **Game Page:** Real-time updates (polling) to see other players, a "waiting" overlay, and an integrated comment section for each game.
- **User Profiles:** Personal page with statistics (Elo rating for different variants, monthly stats), bio, trophy cabinet, and full game history.
- **Personalization:** Customize the platform with light/dark themes and choose your own game board color. Settings are saved both locally and in the database.
- **File Uploads:** Ability to upload a custom profile picture directly from the browser (Multer/FormData).

## Technologies
- **Frontend:** React (Vite), React Router v7, React Context API, CSS Modules.
- **Backend:** Node.js, Express, MongoDB (Mongoose).
- **Media:** Multer for image handling.
- **Security:** MD5 hashing and rate-limiting.

## Installation and Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance running on port 27017)

### 1. Clone the repository
```bash
git clone https://github.com/IDG2100-2026/idg2100-2026-oblig3-frontend-JoFaTech2508.git
cd idg2100-2026-oblig3-frontend-JoFaTech2508
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory with the following content:
```env
NODE_ENV=development
APP_PORT=3000
APP_SALT=pokerdice_salt_2026
DB_HOSTNAME=localhost
DB_PORT=27017
DB_NAME=pokerdice_app
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend/` directory with the following content:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Running and Testing

### Start Backend
In the `backend/` folder:
```bash
npm start
```

### Start Frontend
In the `frontend/` folder:
```bash
npm run dev
```

### Seeding Data (Test Users)
To quickly test the platform with existing users and active games, run the following from the `backend/` folder:
```bash
npm run seed
```

#### Available Test Users:
| Username        | Password    | Role            | Photo          |
| :-------------- | :---------- | :-------------- | :------------- |
| **carlos88**    | password123 | High Elo Player | Yes (Male)     |
| **mariasol**    | securepass1 | Mid Elo Player  | Yes (Female)   |
| **eriklarsen**  | hunter2abc  | Mid Elo Player  | Yes (Male)     |
| **sofiaberg**   | mysecret99  | New Player      | Yes (Female)   |
| **lucas_diez**  | password123 | Pro Player      | Yes (Male)     |
| **elena_r**     | password123 | Pro Player      | Default Avatar |
| **admin_poker** | adminpass1  | Administrator   | Default Avatar |

## Documentation & Testing
For a detailed overview of the project, please refer to the following resources:
- [API Specifications](./documentation/api-specs.md): Full list of backend endpoints and headers.
- [Frontend Overview](./documentation/frontend-overview.md): Technical details about the React architecture.
- [REST Scripts](./REST%20scripts/requests.http): Use this file with the VS Code REST Client extension to test the API directly.

---
Developed by Johan (JoFaTech2508) - BWU, NTNU Gjøvik