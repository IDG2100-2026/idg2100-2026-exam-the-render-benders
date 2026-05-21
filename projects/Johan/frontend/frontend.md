# Frontend - Spanish Poker Dice

Built with Vite + React 19. Uses React Router v7 for routing and React Context for auth state and appearance settings. Styling is done with CSS Modules per component. No axios - just a custom `api.js` wrapper around fetch.

## Pages

| Route                    | Page                                                          |
| ------------------------ | ------------------------------------------------------------- |
| `/`                      | HomePage - hero, lobby section (auto-join), top games         |
| `/lobby`                 | LobbyPage - waiting games, manual join, login hint for guests |
| `/create-game`           | CreateGamePage - form to create a game (18 variants)          |
| `/login`                 | LoginPage                                                     |
| `/register`              | RegisterPage                                                  |
| `/users/:username`       | UserProfilePage - stats, elo, trophies, recent games          |
| `/users/:username/games` | UserGamesPage - full game history for a user                  |
| `/games/:id`             | GamePage - game board area, players, sidebar comments         |
| `/about`                 | AboutPage - platform introduction                             |
| `/about-spanish-dice`    | AboutSpanishDicePage - game description                       |
| `/terms`                 | TermsPage - terms and conditions                              |
| `/policy`                | PrivacyPage - privacy policy                                  |

## Auth

Login stores the user object in React Context (in memory). On login, `userType: "user"` and `userId: user._id` are saved to `localStorage` and cleared on logout. `api.js` reads these and sends them as the `x-user-type` and `x-user-id` headers on every request. The backend uses these headers for auth middleware and personal filtering.

- **Forms:** Login and Registration forms support submission by pressing the **Enter** key.
- **User Flow:** Clicking on the avatar or greeting in the header navigates to the user's profile.

## Appearance

Appearance settings (theme, board color, sound, lobby count) are stored in `AppearanceContext`. `AppearanceProvider` reads from `localStorage` on startup and saves back on every change. For logged-in users it also saves to the backend via `PATCH /users/:username/preferences`.

- **Themes:** Modernized Light and Dark themes with premium color palettes.
- **UX Fixes:** Click-outside detection automatically closes the appearance panel and the mobile navigation menu.

## Game Lobbies

The platform has two lobby views that share the `LobbyCard` component:

1. **LobbySection (Homepage):** Shows a configurable number of games (limit N). Clicking a card triggers **Auto-Join** and navigates to the game immediately. Uses `onCardClick` prop.
2. **LobbyPage:** Full game browser. Shows all waiting matches with strict server-side filtering. Has an explicit **Join** button. Uses `onJoin` prop. Guests see a login hint banner.

### LobbyCard component

Located at `src/components/LobbyCard/LobbyCard.jsx`. Shared between LobbySection and LobbyPage.

| Prop          | Effect                                               |
| ------------- | ---------------------------------------------------- |
| `game`        | The game object to display                           |
| `onJoin`      | Shows a Join button; used by LobbyPage               |
| `onCardClick` | Makes the whole card clickable; used by LobbySection |

## API Wrapper (api.js)

The `apiFetch` function is a custom wrapper around the native `fetch` API. It automatically:
- Adds the base URL from `VITE_API_URL` environment variable.
- Sends `x-user-type` and `x-user-id` headers from `localStorage` on every request.
- Sets `Content-Type: application/json` for standard requests.
- **FormData support:** Detects if the body is a `FormData` instance and omits the `Content-Type` header so the browser sets the correct multipart boundary.
- Handles error formats from the backend and throws a descriptive `Error`.

The `getAssetUrl(path)` helper in `api.js` prepends the backend base URL to image paths. All images (user uploads and demo avatars) are served from `backend/uploads/`.

## Structure

```
src/
  api.js                    # fetch wrapper + getAssetUrl helper
  App.jsx
  assets/
    default-avatar.svg
  contexts/
    AuthContext.jsx
    AppearanceContext.jsx
  providers/
    AuthProvider.jsx
    AppearanceProvider.jsx
  layouts/
    Layout.jsx              # .main has flex:1 for vertical centering
    Header/
    Footer/
  components/
    Greeting/
    AppearancePanel/
    LobbyCard/              # shared card for lobby games
  pages/
    HomePage/
      components/
        LobbySection/       # was LobbyPreview - auto-join on click
        TopGames/
    LobbyPage/
    CreateGamePage/
    LoginPage/
    RegisterPage/
    UserProfilePage/
    UserGamesPage/
    GamePage/
    AboutPage/
    AboutSpanishDicePage/
    TermsPage/
    PrivacyPage/
```
