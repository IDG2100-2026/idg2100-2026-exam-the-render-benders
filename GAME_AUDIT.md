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
- `backend/controllers/game.controller.js:55` - wrap `game` in `sanitizeGameForViewer` (Bug 3)
- `backend/socket/game.socket.js` - add `if (!socket.user?.id)` guard to all action handlers (Bug 5)
- `backend/validators/game.validator.js` - change amount `min: 0` to `min: 1` (Bug 6)
- `backend/config/constants.js` / `backend/utils/gameHelpers.js` - remove unused `"revealing"` phase (Bug 7)

---

## Bug 1: Missing "check" action (Critical - confirmed)

### What is broken

When `currentBet === 0` (nobody has bet yet this round), players need to be able to **check** — pass without putting anything in the pot. Right now:

- `BET_ACTIONS` in `backend/config/constants.js:62` only includes `["bet", "match", "raise", "fold", "timeout"]` — no `"check"`.
- `validateBet` in `backend/validators/game.validator.js:88` only accepts `["bet", "match", "raise", "fold"]` — sending `"check"` returns HTTP 400 immediately.
- The frontend (`frontend/src/components/Game/GameBoard.jsx:179-193`) shows **Fold / Match / Bet / Raise** — no **Check** button.
- Players who want to check are forced to fold unnecessarily, or guess that "Match" works when `currentBet === 0`.

### Why "match" almost works but isn't enough

The `"match"` branch in `game.service.js` handles `amountNeededToMatch <= 0` by adding the player to `actedUsers` and logging `"match"` with amount 0. Functionally this is a check — but:

1. The label is misleading; players assume "Match" requires an existing bet.
2. Sending `action: "check"` hits the `else` block and throws `"Invalid betting action"`.

### Files to change

| File | Change |
|---|---|
| `backend/config/constants.js:62` | Add `"check"` to `BET_ACTIONS` |
| `backend/validators/game.validator.js:88` | Add `"check"` to `.isIn([...])` in `validateBet` |
| `backend/services/game.service.js` (in `placeBet`) | Add `else if (action === "check")` block |
| `frontend/src/components/Game/GameBoard.jsx:179-193` | Show **Check** when `currentBet === 0`; show **Match** only when `currentBet > 0` |

### Proposed backend handler (in `placeBet`, after the `"fold"` block)

```js
} else if (action === "check") {
    if (currentBet > 0) {
        throw new Error("Cannot check when there is an active bet; use match or fold");
    }
    if (!game.bettingState.actedUsers.some(id => idsEqual(id, playerId))) {
        game.bettingState.actedUsers.push(playerId);
    }
    pushBetLog(game, playerId, "check", 0);
}
```

### Proposed frontend change (in `GameBoard.jsx` betting controls)

Note: Raise button is removed as part of Bug 8 (bet/raise merge). The single **Bet** button handles both opening bet and raising.

```jsx
{isPlayer && isMyTurn && phase === "betting" && (
    <div className={styles.betControls}>
        <button onClick={() => handleBet("fold")}>Fold</button>
        {serverState?.bettingState?.currentBet === 0
            ? <button onClick={() => handleBet("check")}>Check</button>
            : <button onClick={() => handleBet("match")}>Match</button>
        }
        <div className={styles.betInput}>
            <input
                type="number"
                min={1}
                max={serverState?.buyIn}
                value={betAmount}
                onChange={e => setBetAmount(Number(e.target.value))}
            />
            <button onClick={() => handleBet("bet")}>
                {serverState?.bettingState?.currentBet === 0 ? "Bet" : "Raise"}
            </button>
        </div>
    </div>
)}
```

---

## Bug 2: Buy-in stack too small for multi-round games (Critical - confirmed)

### What is broken

With the default buy-in of 1 point and a 3-round game:

- Each player's starting stack is `1` (set in `game.service.js createGame` and `joinGame`).
- After round 1, the pot is distributed to the winner. The loser ends round 1 with **0 stack**.
- In round 2 the loser **cannot bet**, is forced to fold immediately, making rounds 2+ trivial/broken.

### Root cause

`createGame` (`game.service.js:181-185`) sets `stack: buyIn` (e.g. 1).
`joinGame` (`game.service.js:146-149`) sets `stack: game.buyIn` (e.g. 1).
The stack is the player's entire bankroll for the whole game, but it only covers one round of minimum betting.

### Proposed fix: `initialStack = buyIn × rounds`

**`game.service.js` — `createGame`:**

```js
const buyIn = data.buyIn ?? 1;
const rounds = data.variant?.rounds ?? 1;
const stackAmount = buyIn * rounds;

const playerStacks = (data.players || []).map(playerId => ({ user: playerId, stack: stackAmount }));

for (const playerId of data.players || []) {
    if (stackAmount > 0) {
        await User.findByIdAndUpdate(playerId, { $inc: { points: -stackAmount } });
    }
}
```

**`game.service.js` — `joinGame`:**

```js
const stackAmount = game.buyIn * (game.variant?.rounds ?? 1);

if (user.points < stackAmount) {
    throw new Error("You do not have enough points to join this game");
}

await User.findByIdAndUpdate(playerId, { $inc: { points: -stackAmount } });
await Game.findByIdAndUpdate(gid, {
    $addToSet: { players: playerId },
    $push: { playerStacks: { user: playerId, stack: stackAmount } }
});
```

### Example result

| Buy-in | Rounds | Stack per player | Total cost |
|---|---|---|---|
| 1 | 3 | 3 | 3 pts |
| 1 | 5 | 5 | 5 pts |
| 10 | 3 | 30 | 30 pts |
| 50 | 7 | 350 | 350 pts |

### Additional rule: per-round bet cap

To prevent a player from going all-in on round 1 and leaving nothing for later rounds, a player's **total contribution for the current round** cannot exceed `game.buyIn`.

Add this check in the `"bet"` branch of `placeBet` before the stack deduction:

```js
const roundContribution = getContribution(game, playerId).amount;
if (roundContribution + amount > game.buyIn) {
    throw new Error(`Cannot bet more than the round limit of ${game.buyIn}`);
}
```

The frontend input should also enforce `max={serverState?.buyIn}` on the bet amount input.

---

## Bug 3: `getGameState` exposes hidden dice (Security)

### What is broken

`GET /games/:gid/state` is called by `GameBoard.jsx` on page load/reload. The controller (`backend/controllers/game.controller.js:51-59`) returns the raw game document **without sanitization**:

```js
// CURRENT (broken)
res.status(200).json(game);
```

Any player or spectator can see all other players' hidden dice by inspecting the API response. Compare to the sibling `getGame` handler which correctly calls `sanitizeGameForViewer`.

### Fix

```js
// FIXED
export async function getGameState(req, res) {
    try {
        const game = await gameService.getGame(req.params.gid);
        if (!game) return res.status(404).json({ error: "Game not found" });
        res.status(200).json(gameService.sanitizeGameForViewer(game, req.user?.id));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
```

One-line change on `backend/controllers/game.controller.js:55`.

---

## Bug 4: Hold dice and reroll not wired up (High - missing feature)

### What is broken

The hold mechanic exists visually but has no game effect:

- `GameBoard.jsx:134-141` — `handleRoll()` calls `POST /games/:gid/roll` with **no body**. Held dice indexes are never sent.
- `game.socket.js:82-95` — the `"hold-dice"` socket event receives `heldDiceIndexes` but never saves it. It just re-emits unchanged state.
- `game.service.js` — `rollForPlayer` generates a fresh 5-dice roll every time. It has no concept of held dice.
- The `holds` field on `game.results` is set to `[false,false,false,false,false]` on first roll and never updated.

Result: clicking dice toggles the visual held state but the server ignores it and re-rolls all 5 dice every time.

### Fix

**`game.service.js` — `rollForPlayer`:** Accept a `heldIndexes` array. Only re-roll dice whose index is not held. Update the `holds` field.

```js
export async function rollForPlayer(gid, playerId, heldIndexes = []) {
    // ...existing checks...
    const existing = myResult?.hiddenRolls ?? [];
    const newRolls = existing.map((val, i) =>
        heldIndexes.includes(i) ? val : rollDice()
    );
    myResult.hiddenRolls = newRolls;
    myResult.holds = existing.map((_, i) => heldIndexes.includes(i));
}
```

**`game.controller.js` — roll handler:** Pass `req.body.heldIndexes` through to the service.

**`GameBoard.jsx` — `handleRoll`:** Send held indexes in the request body.

```js
async function handleRoll() {
    await apiFetch(`/games/${gameId}/roll`, {
        method: "POST",
        body: JSON.stringify({ heldIndexes: [...heldDice] })
    });
}
```

---

## Bug 5: Anonymous users can trigger betting socket events (Medium - security)

### What is broken

Socket handlers for `"bet"`, `"match"`, `"raise"`, `"fold"` call service methods directly with `socket.user.id`. If the socket user is anonymous (`socket.user.id = null`), the service call proceeds with a null id and throws an internal error instead of a clean rejection.

`game.socket.js:30-57` — the auth middleware sets `socket.user = { type: "anonymous", id: null }` for unauthenticated connections. No handler checks for this before calling service functions.

### Fix

Add a guard at the top of each action handler (bet, match, raise, fold, leave-before-start):

```js
if (!socket.user?.id) return socket.emit("error", { message: "Authentication required" });
```

---

## Bug 6: Bet amount validator allows 0 (Low - validation gap)

### What is broken

`game.validator.js:92` uses `.isInt({ min: 0 })` which allows `amount: 0`. The service rejects it inside `placeBet`, but the validator should catch it before it reaches the service.

### Fix

Change `.isInt({ min: 0 })` to `.isInt({ min: 1 })` on the amount field in `game.validator.js`.

---

## Bug 7: Unused "revealing" phase (Low - dead code)

### What is broken

`backend/config/constants.js:59` defines `"revealing"` in `GAME_PHASES`. `gameHelpers.js` checks for it in `rollsArePublic`. But `game.service.js` never sets `phase = "revealing"` — the game jumps straight from `"betting"` to `"round-ended"`. The phase is defined but unreachable.

### Fix

Either remove `"revealing"` from `GAME_PHASES` and `rollsArePublic` if it is not needed, or implement a short reveal phase between betting and round-ended where all dice are shown before advancing.

---

## Bug 8: "bet" and "raise" are the same operation, split unnecessarily (Cleanup)

### What is redundant

`"bet"` and `"raise"` are the same thing — both put chips in to increase the current bet level. The only difference is context:
- `"bet"` is blocked when `currentBet > 0`
- `"raise"` requires `amount > amountNeededToMatch`

That context guard belongs inside one action. Having both is confusing for players and unnecessary branching in the code.

### Proposed unified "bet" handler

Remove `"raise"` entirely. The `"bet"` handler absorbs both cases:

```js
} else if (action === "bet") {
    if (amount <= 0) {
        throw new Error("Bet amount must be greater than 0");
    }
    if (stackEntry.stack < amount) {
        throw new Error("Not enough points in stack");
    }
    // When a bet already exists, the amount must exceed what's needed to match (acts as raise)
    if (currentBet > 0 && amount <= amountNeededToMatch) {
        throw new Error("Bet must be greater than the amount needed to match");
    }

    stackEntry.stack -= amount;
    contribution.amount += amount;
    game.pot += amount;

    game.bettingState.currentBet = contribution.amount;
    game.bettingState.lastAggressor = playerId;
    game.bettingState.actedUsers = [playerId];

    pushBetLog(game, playerId, "bet", amount);
}
```

Remove the entire `"raise"` block after this. The frontend **Raise** button is removed; the label on the **Bet** button can read "Raise" contextually when `currentBet > 0` (see Bug 1 frontend snippet).

---

## Summary table

| # | Severity | Owner | File(s) | Description | Fix |
|---|---|---|---|---|---|
| 1 | **Critical** | Johan | `constants.js`, `game.validator.js`, `game.service.js`, `GameBoard.jsx` | No "check" action — players forced to fold when `currentBet === 0` | Add `"check"` in backend + Check button in frontend |
| 2 | **Critical** | Seb | `game.service.js`, `GameBoard.jsx` | Stack = buyIn (1 pt), players run out after round 1; no bet cap | Set `stack = buyIn × rounds`; cap bets at `buyIn` per round |
| 3 | **Security** | Tobias | `game.controller.js:55` | `getGameState` returns unsanitized hidden dice to all viewers | Wrap response in `sanitizeGameForViewer(game, req.user?.id)` |
| 4 | **High** | Johan | `game.service.js`, `game.controller.js`, `GameBoard.jsx` | Hold dice and reroll not wired — server always re-rolls all 5 dice | Send `heldIndexes` in roll body; use them in `rollForPlayer` |
| 5 | **Medium** | Tobias | `game.socket.js` | Anonymous users can trigger bet/fold socket events with null id | Add `if (!socket.user?.id)` guard in each action handler |
| 6 | **Low** | Tobias | `game.validator.js:92` | Bet amount validator allows 0 — should reject before reaching service | Change `min: 0` to `min: 1` |
| 7 | **Low** | Tobias | `constants.js`, `gameHelpers.js` | `"revealing"` phase defined and checked but never set by service | Remove it or implement the reveal phase |
| 8 | **Cleanup** | Johan | `constants.js`, `game.validator.js`, `game.service.js`, `GameBoard.jsx` | `"bet"` and `"raise"` are the same operation, split unnecessarily | Merge `"raise"` into `"bet"`, remove Raise button |
