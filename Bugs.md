# Game Logic Audit - Findings & Fixes

---

## Fixed

| #   | Severity     | File(s)                                                                 | Description                                                                                                                                                                     |
| --- | ------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Critical** | `constants.js`, `game.validator.js`, `game.service.js`, `GameBoard.jsx` | No "check" action - validator rejects it, no Check button in UI                                                                                                                 |
| 2   | **Critical** | `game.service.js`, `GameBoard.jsx`                                      | Stack = buyIn (1 pt), players run out after round 1; no bet cap                                                                                                                 |
| 3   | **Security** | `game.controller.js:55`                                                 | `getGameState` returns unsanitized hidden dice to all viewers                                                                                                                   |
| 4   | **High**     | `game.service.js`, `game.controller.js`, `GameBoard.jsx`                | Hold dice and reroll not wired - server always re-rolls all 5 dice                                                                                                              |
| 5   | **Medium**   | `game.socket.js`                                                        | Anonymous users can trigger bet/fold/raise socket events                                                                                                                        |
| 6   | **Low**      | `game.validator.js:92`                                                  | Bet amount validator allows 0                                                                                                                                                   |
| 7   | **Low**      | `constants.js`, `gameHelpers.js`                                        | "revealing" phase defined but never set by service                                                                                                                              |
| 8   | **Critical** | `game.socket.js`, `game.service.js`, `constants.js`, `GameBoard.jsx`    | `rollCount` missing from socket broadcast; timeout auto-roll missing rollCount; hardcoded 3; controller error mismatch; Bet/Raise label always said "Bet"; stale error messages |

---

## Open

### Group 1 - Betting UX and Round Completion

| #   | Severity   | File(s)                             | Description                                                                                                  | Fix                                                                   |
| --- | ---------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 10  | **High**   | `game.service.js`, `gameHelpers.js` | All-in player (stack=0) blocks betting round - `bettingRoundIsComplete` requires exact match on `currentBet` | `contribution.amount === currentBet \|\| stackEntry.stack === 0`      |
| 13  | **High**   | `GameBoard.jsx`                     | `betAmount` not clamped - user can type negative or over-buyIn values, server rejects but UX is bad          | Clamp in `onChange`: `Math.max(1, Math.min(serverState?.buyIn, val))` |
| 14  | **Medium** | `GameBoard.jsx`                     | `betAmount` not reset between rounds - stale value from last round stays in the input                        | Reset to 1 when phase changes to "betting" or gameId changes          |

### Group 2 - Socket State and Realtime Safety

| #   | Severity   | File(s)                                         | Description                                                                                     | Fix                                                                                      |
| --- | ---------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 9   | **High**   | `GameBoard.jsx`, `frontend/config/constants.js` | `MAX_ROLLS_PER_TURN` duplicated in frontend - server is source of truth                         | Remove frontend constant, show "Reroll" without count, rely on `isMyTurn` to hide button |
| 11  | **Medium** | `game.socket.js`                                | `hold-dice` socket event receives `heldDiceIndexes` but does nothing - misleading dead code     | Remove the handler or add a comment explaining it is intentionally empty                  |
| 18  | **Medium** | `game.socket.js`                                | Socket bet/match/raise/fold events emit via `buildGameState(game, null)` - could leak hidden dice | Use `sanitizeGameForViewer` or `emitPersonalizedState` instead                           |

### Group 3 - Multiplayer Game Integrity

| #   | Severity     | File(s)              | Description                                                                                         | Fix                                                                                     |
| --- | ------------ | -------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 16  | **Critical** | `game.service.js`    | Forfeit with 3+ players broken - `.find()` picks only one opponent instead of all remaining players | Find all remaining players, not just the first one                                      |
| 17  | **High**     | `game.service.js`    | Result object created in betting phase missing `rollCount`, `holds`, `bets` fields                  | Explicitly set these fields when creating result in betting phase                       |
| 12  | **Low**      | `game.controller.js` | No validation for `heldIndexes` in roll request - should be array of integers 0-4                   | Add validator middleware to check `heldIndexes` is a valid array before reaching service |

### Group 4 - Permissions and Production Polish

| #   | Severity     | File(s)                    | Description                                                                        | Fix                                                                 |
| --- | ------------ | -------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 19  | **Critical** | `comment.controller.js:62` | `updateComment` has no owner/admin check - any logged-in user can edit any comment | Add same author/admin check that `deleteComment` has at lines 82-85 |
| 20  | **Low**      | `backend/app.js`           | CORS origin hardcoded to `localhost:5173` - breaks in production                   | Use `process.env.FRONTEND_URL \|\| "http://localhost:5173"`         |
| 15  | **Low**      | `Comments.jsx`             | Submit button always enabled when comment is empty - click does nothing with no feedback | Disable button when `!newComment.trim()`                       |
