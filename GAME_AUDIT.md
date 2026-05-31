# Game Logic Audit - Findings & Proposed Fixes

---

## Work split

### Johan - Bug 1 + 4 + 8: Check action, bet/raise merge, and hold/reroll (full stack)
- `backend/config/constants.js` - add `"check"` to `BET_ACTIONS`, remove `"raise"`
- `backend/validators/game.validator.js` - add `"check"`, remove `"raise"` from `.isIn([...])`
- `backend/services/game.service.js` - add `else if (action === "check")` block in `placeBet`; merge `"raise"` logic into `"bet"` handler and delete the `"raise"` block
- `frontend/src/components/Game/GameBoard.jsx` - show **Check** when `currentBet === 0`, show **Match** only when `currentBet > 0`; remove **Raise** button (the single **Bet** button handles both opening bet and raise)
- `backend/services/game.service.js` - update `rollForPlayer` to accept `heldIndexes`, only re-roll unheld dice, update `holds`
- `backend/controllers/game.controller.js` - pass `req.body.heldIndexes` through to `rollForPlayer`
- `frontend/src/components/Game/GameBoard.jsx` - send `heldIndexes: [...heldDice]` in the roll request body

### Seb - Bug 2: Stack size + bet cap (full feature, backend + frontend)
- `backend/services/game.service.js` - change stack to `buyIn * rounds` in `createGame` and `joinGame`
- `backend/services/game.service.js` - add per-round bet cap in `"bet"` branch of `placeBet`
- `frontend/src/components/Game/GameBoard.jsx` - add `max={serverState?.buyIn}` to the bet amount input

### Tobias - Bug 3 + 5 + 6 + 7: Security, validation, and cleanup
- `backend/controllers/game.controller.js:55` - wrap `game` in `sanitizeGameForViewer` (Bug 3) ✅
- `backend/socket/game.socket.js` - add `if (!socket.user?.id)` guard to all action handlers (Bug 5) ✅
- `backend/validators/game.validator.js` - change amount `min: 0` to `min: 1` (Bug 6) ✅
- `backend/config/constants.js` / `backend/utils/gameHelpers.js` - remove unused `"revealing"` phase (Bug 7) ✅

---

## Current status (post-fix audit)

| # | Owner | Status | Notes |
|---|---|---|---|
| 1 | Johan | ✅ Done | check handler in service + validator + frontend button |
| 2 | Seb | ✅ Done | stack = buyIn × rounds, bet cap in service, max on input |
| 3 | Tobias | ✅ Done | sanitizeGameForViewer added to getGameState |
| 4 | Johan | ✅ Done | heldIndexes wired through controller → service → model; rollCount tracked |
| 5 | Tobias | ✅ Done | auth guard added outside try/catch in all 5 socket handlers |
| 6 | Tobias | ✅ Done | min: 1 in validator |
| 7 | Tobias | ✅ Done | "revealing" removed from constants, gameHelpers, socket buildGameState |
| 8 | Johan | ⚠️ Partial | raise block still in service + validator + constants; frontend sends "raise" not "bet" |

---

## Remaining issues found in post-fix audit

### Issue A: `handleTimeout` doesn't use `rollCount` — rolling phase will break (Medium)

`game.service.js:635-671` — the timeout handler's rolling phase logic was not updated to match the new 3-roll system:

**Problem 1:** The timeout-created result has no `rollCount` set:
```js
game.results.push({
    player: timedOutPlayerId,
    round,
    hiddenRolls: rolls,
    // ...
    // rollCount is missing — defaults to 0 in the schema
});
```
`rollCount` will be 0, so the frontend will still show this player as having 3 rolls left even after a timeout.

**Problem 2:** `everyoneRolled` uses the old existence check:
```js
const everyoneRolled = activePlayers.every(activePlayerId =>
    game.results.some(result =>
        idsEqual(result.player, activePlayerId) && result.round === round
    )
);
```
With the new system, betting should only start when all players have `rollCount >= 3`. This check will send everyone into betting prematurely — e.g. if player A has rolled once and player B times out, betting starts even though neither has used all 3 rolls.

**Fix — owner: Seb (touches `game.service.js` in his area):**
```js
// On timeout-created result, mark as done with all rolls
game.results.push({
    ...
    rollCount: 3,
    ...
});

// Update everyoneRolled to match rollForPlayer's everyoneFinished logic
const everyoneRolled = activePlayers.every(activePlayerId => {
    const r = game.results.find(res =>
        idsEqual(res.player, activePlayerId) && res.round === round
    );
    return r && r.rollCount >= 3;
});
```

---

### Issue B: Bet button sends `"raise"` but is labelled `"Bet"` — Bug 8 incomplete (Low)

`GameBoard.jsx:209-211`:
```jsx
<button onClick={() => handleBet(
    serverState?.bettingState?.currentBet === 0 ? "bet" : "raise"
)}>Bet</button>
```

Two problems:
1. The button always shows **"Bet"** — when `currentBet > 0` the player is raising but the label doesn't say so.
2. It still sends `"raise"` to the backend, so the `"raise"` block in the service can't be deleted yet.

**Fix — owner: Johan:**
Change the button to always send `"bet"` (completing the merge), and label it contextually:
```jsx
<button onClick={() => handleBet("bet")}>
    {serverState?.bettingState?.currentBet === 0 ? "Bet" : "Raise"}
</button>
```
Then delete the `"raise"` block from `game.service.js`, remove `"raise"` from `BET_ACTIONS` in `constants.js`, and from the validator's `.isIn()`.

---

### Issue C: Check error message references "raise" — stale after Bug 8 (Trivial)

`game.service.js:492`:
```js
throw new Error("Cannot check when there is an active bet, use match, raise, or fold");
```
Once "raise" is removed, this message is misleading.

**Fix — owner: Johan:** Change to `"use match, bet, or fold"`.

---

### Issue D: Roll error status mapping is stale (Trivial)

`game.controller.js:127`:
```js
: err.message.includes("already rolled") ? 400
```
The new error message is `"You have used all your rolls this turn"` — this mapping will never match and will fall through to 500.

**Fix — owner: Johan:** Change to:
```js
: err.message.includes("used all your rolls") ? 400
```

---

## Original bugs (detail)

### Bug 1: Missing "check" action ✅

When `currentBet === 0`, players need to check (pass without betting). Was missing from `BET_ACTIONS`, validator, service, and frontend. All four now fixed.

---

### Bug 2: Buy-in stack too small for multi-round games ✅

Stack was set to `buyIn` (e.g. 1 pt). After round 1 the loser had 0 stack. Fixed: stack is now `buyIn × rounds`. Bet cap at `buyIn` per round also added to prevent all-in on round 1.

---

### Bug 3: `getGameState` exposed hidden dice ✅

`GET /games/:gid/state` returned raw DB document. Fixed: now calls `sanitizeGameForViewer(game, req.user?.id)`.

---

### Bug 4: Hold dice and reroll not wired up ✅

Frontend sent no body on roll. Service always re-rolled all 5. Fixed: `heldIndexes` sent from frontend, passed through controller, used in service. `rollCount` tracked (max 3 rolls per turn, move to next player when done). Field added to game model schema.

---

### Bug 5: Anonymous users could trigger socket action events ✅

Socket handlers called service with `socket.user.id = null`. Fixed: `if (!socket.user?.id) return socket.emit("error", ...)` added outside `try/catch` in bet, match, raise, fold, leave-before-start.

---

### Bug 6: Bet amount validator allowed 0 ✅

`validateBet` had `min: 0`. Fixed: `min: 1`.

---

### Bug 7: Unused "revealing" phase ✅

`"revealing"` was in `GAME_PHASES`, `rollsArePublic`, and `buildGameState` but never set by the service. Removed from all three locations.

---

### Bug 8: "bet" and "raise" are the same operation ⚠️ Partial

`"raise"` and `"bet"` both increase the current bet — the only difference is whether a bet already exists. Should be one unified `"bet"` action. The service has the raise block with a `// Probs delete this` comment, and the validator still lists "raise". The frontend sends "raise" when `currentBet > 0`. Not yet completed — see Issue B above.

---

## Summary

| # | Severity | Owner | Status | Description |
|---|---|---|---|---|
| 1 | Critical | Johan | ✅ | No check action |
| 2 | Critical | Seb | ✅ | Stack too small, no bet cap |
| 3 | Security | Tobias | ✅ | getGameState exposed hidden dice |
| 4 | High | Johan | ✅ | Hold/reroll not wired |
| 5 | Medium | Tobias | ✅ | Socket anon auth gap |
| 6 | Low | Tobias | ✅ | Validator allowed amount=0 |
| 7 | Low | Tobias | ✅ | Dead "revealing" phase |
| 8 | Cleanup | Johan | ⚠️ | bet/raise not merged yet |
| A | Medium | Seb | ❌ | handleTimeout rollCount not updated |
| B | Low | Johan | ❌ | Bet button label wrong, still sends "raise" |
| C | Trivial | Johan | ❌ | Check error message mentions "raise" |
| D | Trivial | Johan | ❌ | Roll error status mapping stale |
