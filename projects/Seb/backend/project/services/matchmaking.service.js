import { Match } from '../models/match.js';
import { User } from '../models/users.js';

// Config
const TICK_MS = 5000; // How often the matchmaker runs (ms)
const INITIAL_ELO_WINDOW = 100; // Starting ELO tolerance on each side
const ELO_WINDOW_STEP = 50; // Extra ELO tolerance added per interval
const RELAX_INTERVAL_MS = 10000; // How often the window grows (ms)
const MAX_ELO_WINDOW = 600; // Cap so players are never matched with anyone

// How long before the ELO is reset
const ELO_RESET_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * queue: Map<userId, QueueEntry>
 *
 * QueueEntry {
 *   userId       : string
 *   eloRating    : number
 *   gameCategory : string   - GameCategory _id
 *   joinedAt     : Date
 *   matchId      : string | null  - set once matched
 * }
 */
const queue = new Map();

// Add a player to the matchmaking queue.
// Returns false if they are already queued. 
export async function enqueue(userId, gameCategory) {
    if (queue.has(userId)) return { ok: false, reason: 'already_queued' }; // User is already in the queue

    const user = await User.findById(userId).select('eloRating isBanned userType');
    if (!user) return { ok: false, reason: 'user_not_found' }; // This should not happen if attachUser middleware is working correctly, but we check just in case
    if (user.isBanned) return { ok: false, reason: 'banned' }; // Banned users cannot join the queue
    if (user.userType === 'anonymous') return { ok: false, reason: 'anonymous_not_allowed' }; // Anonymous users cannot join the queue

    queue.set(userId, {
        userId,
        eloRating: user.eloRating,
        gameCategory,
        joinedAt: new Date(),
        matchId: null
    });

    return { ok: true };
}

// Remove a player from the queue (cancel search).
// Returns false if they were not in the queue.
export function dequeue(userId) {
    return queue.delete(userId);
}

// Return the current queue entry for a user, or null.
export function getStatus(userId) {
    return queue.get(userId) ?? null;
}

//Return a snapshot of the full queue (for debugging / admin view). 
export function getQueueSnapshot() {
    return [...queue.values()];
}

// ELO window helper

// Calculate how wide the ELO tolerance is for a given entry right now.
function eloWindowFor(entry) {
    const waitMs = Date.now() - entry.joinedAt.getTime(); // How long this player has been waiting in milliseconds
    const steps = Math.floor(waitMs / RELAX_INTERVAL_MS); // How many times the window has expanded since they joined
    return Math.min(INITIAL_ELO_WINDOW + steps * ELO_WINDOW_STEP, MAX_ELO_WINDOW); // Total ELO tolerance on each side, capped at MAX_ELO_WINDOW
}

// Matchmaking tick

// Scan the queue and pair compatible players.
// Runs on a timer; should not be called manually.
async function tick() {
    // Separate players who have already been matched (waiting to be collected)
    // from those still searching.
    const searching = [...queue.values()].filter(e => e.matchId === null);

    // Track which userIds we have already used in this tick so we don't pair
    // the same player twice.
    const used = new Set();

    for (let i = 0; i < searching.length; i++) {
        const a = searching[i]; // For each unmatched player, look for a compatible opponent further down the list
        if (used.has(a.userId)) continue; // already matched this tick

        for (let j = i + 1; j < searching.length; j++) {
            const b = searching[j]; // Compare against later entries to avoid duplicate checks
            if (used.has(b.userId)) continue; // already matched this tick
            if (a.gameCategory !== b.gameCategory) continue;  // must want the same game type

            // Both players' windows must accommodate the other's ELO
            const windowA = eloWindowFor(a);
            const windowB = eloWindowFor(b);
            const eloDiff = Math.abs(a.eloRating - b.eloRating); // ELO difference between the two players (absolute value)

            if (eloDiff <= windowA && eloDiff <= windowB) {
                // Match found
                try {
                    const newMatch = new Match({
                        player1: a.userId,
                        player2: b.userId,
                        gameType: a.gameCategory,
                        visibility: 'public',
                        player1Score: 0,
                        player2Score: 0,
                        status: 'ongoing'
                    });
                    await newMatch.save();

                    // Update both queue entries with the resulting match ID.
                    // Players poll GET /matchmaking/status/:uid to discover it.
                    queue.get(a.userId).matchId = newMatch._id;
                    queue.get(b.userId).matchId = newMatch._id;

                    used.add(a.userId);
                    used.add(b.userId);

                    console.log(
                        `[Matchmaking] Matched ${a.userId} (ELO ${a.eloRating}) ` +
                        `vs ${b.userId} (ELO ${b.eloRating}) - match ${newMatch._id}`
                    );
                } catch (err) {
                    console.error('[Matchmaking] Error creating match:', err.message);
                }

                break; // Move on to the next unmatched player
            }
        }
    }
}

// Weekly ELO reset

// Every 7 days all users' eloRatingChange field is reset to 0.
// 
// This runs once every 7 days via setInterval below.
// On server restart the 7-day clock begins again from zero
async function resetWeeklyEloChange() {
    try {
        // Update all users, setting eloRatingChange to 0
        const result = await User.updateMany({}, { eloRatingChange: 0 });
        console.log(`[ELO Reset] Weekly eloRatingChange reset - ${result.modifiedCount} users updated`);
    } catch (err) {
        console.error('[ELO Reset] Failed to reset weekly ELO change:', err.message);
    }
}

// Start background timers

// Matchmaking tick - runs every TICK_MS
setInterval(tick, TICK_MS);

// Weekly ELO reset - runs every 7 days
setInterval(resetWeeklyEloChange, ELO_RESET_INTERVAL_MS);

export default { enqueue, dequeue, getStatus, getQueueSnapshot };