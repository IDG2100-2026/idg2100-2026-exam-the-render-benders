# Frontend Overview - Spanish Poker Dice Platform

## Technologies

- **Vite + React 19** - same setup as LibApp from lectures
- **React Router v7** - client-side routing (explicit requirement)
- **React Context** - state management (AuthContext + AppearanceContext)
- **CSS Modules** - scoped styling per component
- **Custom api.js** - no axios, own fetch helper with getAssetUrl
- **react-icons** - fa6 and md packages for icons

## Structure

```
frontend/src/
  api.js                  - fetch helper, asset resolution, error handling
  contexts/               - AuthContext, AppearanceContext
  providers/              - AuthProvider, AppearanceProvider
  layouts/                - Layout with Header + Footer
  components/
    LobbyCard/            - Shared game card (used by LobbySection and LobbyPage)
    Greeting/             - Avatar + username + logout
    AppearancePanel/      - Theme/color/sound/lobby settings
  pages/
    HomePage/             - Hero + LobbySection + TopGames
    LobbyPage/            - Full game browser with filtering
    CreateGamePage/       - Variant selectors (Rounds, Rules, Time)
    GamePage/             - Real-time HUD and social sidebar
    UserProfilePage/      - Stats dashboard and trophy cabinet
    UserGamesPage/        - Full match history for a user
    LoginPage/
    RegisterPage/
    AboutPage/
    AboutSpanishDicePage/
    TermsPage/
    PrivacyPage/
```

## Pages

| Route | Description |
|---|---|
| `/` | Hero + LobbySection (auto-join) + TopGames (ranked) |
| `/lobby` | All waiting games, manual join, server-side Elo/anon filtering |
| `/create-game` | Form for all 18 game variants + Elo preference |
| `/games/:id` | Game HUD, 15s polling, waiting overlay, comment sidebar |
| `/login` | Login form, Enter-key, autoFocus |
| `/register` | Registration with date-of-birth, terms checkbox |
| `/users/:username` | Profile: Overall Elo, variant Elos, stats, trophies, recent games |
| `/users/:username/games` | Full paginated game history |
| `/about` | Platform introduction |
| `/about-spanish-dice` | Game rules and description |
| `/terms` | Terms and conditions |
| `/policy` | Privacy policy |

> Note: Tournament pages (/tournaments, /tournaments/:id) are not included in this sprint. The teacher confirmed tournaments are out of scope for the frontend delivery. The backend tournament endpoints remain fully functional.

## Design

- Dark casino theme by default
- CSS variables in `index.css` for colors, shadows, typography
- Light mode via `[data-theme="light"]` on `<html>`
- CSS Modules per component, no global styles except `index.css`
- Responsive: hamburger menu on mobile (<640px), flex-wrap on all cards

## Header

```
<header>
  Logo (far left) - "Spanish Poker Dice", Link to /
  <div right>
    <nav desktopNav>     Lobby, About Spanish Dice
    <Greeting />         Avatar + Username + Logout
    <AppearancePanel />  Settings gear
    <button menuButton>  FaBars/FaXmark (mobile only)
  </div>
  {open && <nav mobileNav>}  position:absolute dropdown
</header>
```

- Click-outside detection closes both the mobile menu and appearance panel.
- Long usernames truncate with ellipsis on mobile.

## Auth flow

- Login stores user object in `AuthContext` (React memory).
- `localStorage` stores `userType` and `userId` - cleared on logout.
- `api.js` sends `x-user-type` and `x-user-id` headers on every request.
- Login always succeeds (assignment requirement - no JWT verification).

## Appearance

- `AppearanceContext` manages: theme, boardColor, sound, lobbyCount.
- On change: saves to `localStorage` (all users) + `PATCH /users/:username/preferences` (logged in).
- Theme applied via `document.documentElement.setAttribute("data-theme", ...)`.

## Key patterns

- **LobbyCard props:** `onJoin` = shows Join button (LobbyPage). `onCardClick` = whole card clickable (LobbySection auto-join).
- **FormData:** Profile updates use `FormData` for file + text in one request. `api.js` omits `Content-Type` so browser sets the correct multipart boundary.
- **Polling:** `setInterval` every 15s in GamePage fetches new game state and comments. `clearInterval` in useEffect cleanup stops it on unmount.
- **getAssetUrl:** Prepends backend base URL to image filenames. Fallback to `default-avatar.svg`.
- **URL.createObjectURL:** Shows instant avatar preview from a local file before upload.
