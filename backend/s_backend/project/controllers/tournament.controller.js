import { Tournament } from "../models/tournament.js";
import { User } from "../models/users.js";
import { Match } from "../models/match.js";
import { GameCategory } from "../models/game.js";
import httpStatus from "../utils/statusCodes.js";
import tournamentValidator from '../validators/tournament.validator.js';
import userValidator from "../validators/user.validator.js";

// GET all tournaments
export async function getAllTournaments(req, res) {
    try {
        const { status, tournamentType, gameCategory } = req.query;

        // Build filter object based on query parameters
        const filter = {};
        if (status) filter.status = status;
        if (tournamentType) filter.tournamentType = tournamentType;
        if (gameCategory) filter.gameCategory = gameCategory;

        const tournaments = await Tournament.find(filter)
            .populate('participants', 'username eloRating')
            .populate('gameCategory', 'name numOfRounds')
            .populate('createdBy', 'username')
            .populate('trophy', 'title')
            .sort({ startDateTime: -1 })
            .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            data: tournaments,
            count: tournaments.length
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving tournaments',
            errorMessage: err.message
        });
    }
}

// GET tournament by ID
export async function getTournamentById(req, res) {
    try {
        const { tid } = req.params;

        // Validate tournament id (tid) format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Populate related fields for a comprehensive tournament view
        const tournament = await Tournament.findById(tid)
            .populate('participants', 'username eloRating')
            .populate('gameCategory', 'name numOfRounds straightsAllowed timePerRound')
            .populate('createdBy', 'username')
            .populate('trophy', 'title imageUrl')
            .select('-__v');

        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            data: tournament
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving tournament',
            errorMessage: err.message
        });
    }
}

// POST create a new tournament
export async function createTournament(req, res) {
    try {
        const { title, description, tournamentType, gameCategory, startDateTime, createdBy, durationMinutes } = req.body;

        // Validate required fields and formats
        const validation = tournamentValidator.validateTournamentCreation(
            title, tournamentType, gameCategory, startDateTime, createdBy
        );
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Arena tournaments must have a duration
        if (tournamentType === 'arena' && durationMinutes !== undefined) {
            if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
                return res.status(httpStatus.BAD_REQUEST.code).json({
                    success: false,
                    error: httpStatus.BAD_REQUEST.message,
                    message: 'durationMinutes must be a positive integer for arena tournaments'
                });
            }
        }

        // Verify creator user exists
        const creator = await User.findById(createdBy);
        if (!creator) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'Creator user not found'
            });
        }

        // Verify game category exists
        const category = await GameCategory.findById(gameCategory);
        if (!category) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'Game category not found'
            });
        }

        // Create the tournament
        const newTournament = new Tournament({
            title,
            description: description || '',
            tournamentType,
            gameCategory,
            startDateTime,
            createdBy,
            durationMinutes: durationMinutes || 60,
            status: 'pending',
            participants: [],
            arenaScores: [],
            rounds: []
        });

        await newTournament.save();

        const populated = await Tournament.findById(newTournament._id)
            .populate('gameCategory', 'name numOfRounds')
            .populate('createdBy', 'username');

        res.status(httpStatus.CREATED.code).json({
            success: true,
            message: 'Tournament created successfully',
            data: populated
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error creating tournament',
            errorMessage: err.message
        });
    }
}

// POST join tournament
export async function joinTournament(req, res) {
    try {
        const { tid } = req.params;
        const { userId } = req.body;

        // Validate tournament ID and user ID formats
        const tidValidation = tournamentValidator.validateTid(tid);
        if (!tidValidation.valid) {
            return res.status(tidValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: tidValidation.message
            });
        }

        const userValidation = userValidator.validateUid(userId);
        if (!userValidation.valid) {
            return res.status(userValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Invalid user ID format'
            });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Verify user exists and is not banned
        const user = await User.findById(userId);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'User not found'
            });
        }
        if (user.isBanned) {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Banned users cannot join tournaments'
            });
        }

        // Check tournament capacity, duplicate join, and status
        if (tournament.participants.length >= tournament.maxParticipants) {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Tournament is full'
            });
        }
        if (tournament.participants.includes(userId)) {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'User already joined this tournament'
            });
        }
        if (tournament.status !== 'pending') {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Cannot join a tournament that has already started'
            });
        }

        tournament.participants.push(userId);

        // Initialise arena score entry for this participant
        if (tournament.tournamentType === 'arena') {
            tournament.arenaScores.push({ participant: userId, points: 0 });
        }

        await tournament.save();

        const updated = await Tournament.findById(tid)
            .populate('participants', 'username eloRating')
            .populate('gameCategory', 'name numOfRounds');

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'User joined tournament successfully',
            data: updated
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error joining tournament',
            errorMessage: err.message
        });
    }
}

// POST leave tournament
export async function leaveTournament(req, res) {
    try {
        const { tid } = req.params;
        const { userId } = req.body;

        // Validate tournament ID
        const tidValidation = tournamentValidator.validateTid(tid);
        if (!tidValidation.valid) {
            return res.status(tidValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: tidValidation.message
            });
        }

        // Confirm tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }
        // Confirm user exists
        if (!tournament.participants.includes(userId)) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'User is not in this tournament'
            });
        }
        // Only allow leaving if tournament hasn't started yet
        if (tournament.status !== 'pending') {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Cannot leave a tournament that has already started'
            });
        }
        // Note: we allow leaving even if the user is the creator, to avoid edge cases where a banned user can't leave their own tournament.
        // The tournament can still be deleted by an admin if needed.
        tournament.participants = tournament.participants.filter(
            id => id.toString() !== userId.toString()
        );
        // Also remove their arena score entry if it's an arena tournament
        if (tournament.tournamentType === 'arena') {
            tournament.arenaScores = tournament.arenaScores.filter(
                s => s.participant.toString() !== userId.toString()
            );
        }

        await tournament.save();

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'User left tournament successfully'
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error leaving tournament',
            errorMessage: err.message
        });
    }
}

// GET tournament standings
// Knockout: returns rounds array.
// Arena: returns arenaScores sorted by points, with populated usernames.
export async function getTournamentStandings(req, res) {
    try {
        const { tid } = req.params;

        // Validate tournament ID format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }
        // Verify tournament exists and populate participants for username lookup
        const tournament = await Tournament.findById(tid)
            .populate('participants', 'username eloRating')
            .select('-__v');

        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // For arena tournaments, build standings from arenaScores and populate usernames.
        let standings;
        if (tournament.tournamentType === 'arena') {
            // Build a username lookup from the populated participants array
            const usernameMap = Object.fromEntries(
                tournament.participants.map(p => [p._id.toString(), p.username])
            );

            // Sort arenaScores by points descending and map to include usernames
            standings = [...tournament.arenaScores]
                .sort((a, b) => b.points - a.points)
                .map((score, index) => ({
                    rank: index + 1,
                    userId: score.participant,
                    username: usernameMap[score.participant.toString()] || null,
                    points: score.points
                }));
        } else {
            // Knockout — return rounds as-is
            standings = tournament.rounds;
        }

        // For arena, also expose time remaining if still ongoing
        let timeRemainingSeconds = null;
        if (tournament.tournamentType === 'arena' && tournament.status === 'ongoing' && tournament.startDateTime) {
            const elapsedMs = Date.now() - new Date(tournament.startDateTime).getTime();
            const totalMs   = tournament.durationMinutes * 60 * 1000;
            timeRemainingSeconds = Math.max(0, Math.round((totalMs - elapsedMs) / 1000));
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            tournamentType: tournament.tournamentType,
            ...(timeRemainingSeconds !== null && { timeRemainingSeconds }),
            data: standings
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving tournament standings',
            errorMessage: err.message
        });
    }
}

// GET tournament matches
export async function getTournamentMatches(req, res) {
    try {
        const { tid } = req.params;

        // Validate tournament ID format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Fetch matches belonging to this tournament, populating player and game details
        const matches = await Match.find({ tournament: tid })
            .populate('player1', 'username eloRating')
            .populate('player2', 'username eloRating')
            .populate('winner', 'username')
            .populate('loser', 'username')
            .populate('gameType', 'name numOfRounds')
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            data: matches,
            count: matches.length
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving tournament matches',
            errorMessage: err.message
        });
    }
}

// Create Match documents for a list of paired player IDs and return their IDs.
// Players are taken two at a time from `paired` (must be even).
async function createRoundMatches(paired, gameCategory, tid) {
    const matchIds = [];
    for (let i = 0; i < paired.length; i += 2) {
        const m = new Match({
            player1: paired[i],
            player2: paired[i + 1],
            gameType: gameCategory,
            visibility: 'public',
            player1Score: 0,
            player2Score: 0,
            status: 'ongoing',
            tournament: tid
        });
        await m.save();
        matchIds.push(m._id);
    }
    return matchIds;
}

// Fisher-Yates shuffle
// Grabbed from: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#JavaScript_implementation
// This shuffle is used for randomizing participant order before pairing in knockout tournaments.
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { // For i from n - 1 down to 1 do
        const j = Math.floor(Math.random() * (i + 1)); //   j = random integer such that 0 ≤ j ≤ i
        [arr[i], arr[j]] = [arr[j], arr[i]]; //   exchange arr[i] and arr[j]
    }
    return arr; // return shuffled array
}

// POST generate pairings — knockout only.
// For arena tournaments use POST /tournaments/:tid/arena-start instead.
export async function generatePairing(req, res) {
    try {
        const { tid } = req.params;

        // Validate tournament ID format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Only allow pairing generation for knockout tournaments, and only if there are enough participants and the tournament is still pending
        if (tournament.tournamentType !== 'knockout') {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Use POST /tournaments/:tid/arena-start to start an arena tournament'
            });
        }

        // We require at least minParticipants to generate pairings, even if maxParticipants is higher.
        // This prevents generating pairings for a tournament that doesn't have enough participants to proceed.
        if (tournament.participants.length < tournament.minParticipants) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: `Tournament needs at least ${tournament.minParticipants} participants`
            });
        }

        // Only allow pairing generation if tournament is still pending.
        // Once pairings are generated, the tournament status changes to ongoing and pairings cannot be regenerated.
        if (tournament.status !== 'pending') {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Pairings can only be generated for pending tournaments'
            });
        }

        // Randomly shuffle participants, using Fisher-Yates algorithm, before pairing them off.
        const participants = shuffle([...tournament.participants]);

        // Odd player out gets a bye (automatically advances)
        const byePlayer  = participants.length % 2 !== 0 ? participants.pop() : null;
        const matchIds   = await createRoundMatches(participants, tournament.gameCategory, tid);

        tournament.rounds.push({
            roundNumber: 1,
            matches: matchIds,
            ...(byePlayer && { byePlayer })
        });
        tournament.status = 'ongoing';
        await tournament.save();

        const updated = await Tournament.findById(tid)
            .populate('participants', 'username eloRating')
            .populate('gameCategory', 'name')
            .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            message: `Round 1 pairings generated — ${matchIds.length} match(es)${byePlayer ? ', 1 bye' : ''}`,
            data: updated
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error generating pairings',
            errorMessage: err.message
        });
    }
}

// POST advance knockout tournament to the next round.
export async function advanceTournament(req, res) {
    try {
        const { tid } = req.params;

        // Validate tournament ID format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Only allow advancing if it's a knockout tournament, currently ongoing, and has at least one round of matches generated.
        if (tournament.tournamentType !== 'knockout') {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Use POST /tournaments/:tid/arena-advance to advance an arena tournament'
            });
        }

        // Confirm tournament is ongoing before allowing advancing to the next round.
        // This ensures pairings have been generated and the first round is underway.
        if (tournament.status !== 'ongoing') {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Can only advance tournaments that are currently ongoing'
            });
        }

        // Verify there is at least one round of matches before advancing. This prevents advancing a tournament that hasn't had pairings generated yet.
        if (tournament.rounds.length === 0) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'No rounds found — generate pairings first'
            });
        }

        // Verify all matches in the current round are completed before allowing advancing to the next round.
        const currentRound   = tournament.rounds[tournament.rounds.length - 1];
        const currentMatches = await Match.find({ _id: { $in: currentRound.matches } });
        const incomplete     = currentMatches.filter(m => m.status !== 'completed');

        // If any matches are still ongoing, we cannot advance to the next round yet.
        if (incomplete.length > 0) {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: `${incomplete.length} match(es) in the current round are not yet completed`
            });
        }

        // Gather winners; add any bye player from this round
        const roundWinners = currentMatches.map(m => m.winner.toString());
        if (currentRound.byePlayer) {
            roundWinners.push(currentRound.byePlayer.toString());
        }

        // One winner left → tournament over
        if (roundWinners.length === 1) {
            tournament.status    = 'completed';
            tournament.winner    = roundWinners[0];
            tournament.endDateTime = new Date();
            await tournament.save();

            return res.status(httpStatus.OK.code).json({
                success: true,
                message: 'Tournament completed!',
                winner: roundWinners[0],
                data: tournament
            });
        }

        // Build the next round
        const nextRound  = currentRound.roundNumber + 1;
        const byePlayer  = roundWinners.length % 2 !== 0 ? roundWinners.pop() : null; // If odd number of winners, last one gets a bye to the next round
        const matchIds   = await createRoundMatches(roundWinners, tournament.gameCategory, tid);

        // Append the new round to the tournament document.
        tournament.rounds.push({
            roundNumber: nextRound,
            matches: matchIds,
            ...(byePlayer && { byePlayer })
        });
        await tournament.save();

        res.status(httpStatus.OK.code).json({
            success: true,
            message: `Advanced to round ${nextRound} — ${matchIds.length} match(es)${byePlayer ? ', 1 bye' : ''}`,
            data: tournament
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error advancing tournament', 
            errorMessage: err.message
        });
    }
}

// POST /tournaments/:tid/arena-start
// Starts an arena tournament: records the real start time, creates round 1
// pairings sorted by current ELO (closest ELOs play each other first).
export async function startArenaTournament(req, res) {
    try {
        const { tid } = req.params;

        // Validate tournament ID format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }
        // Only allow starting if it's an arena tournament, currently pending, and has enough participants.
        if (tournament.tournamentType !== 'arena') {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'This endpoint is only for arena tournaments'
            });
        }
        if (tournament.status !== 'pending') {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Arena tournament has already started or is completed'
            });
        }
        if (tournament.participants.length < tournament.minParticipants) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: `Tournament needs at least ${tournament.minParticipants} participants`
            });
        }

        // Fetch ELO ratings so we can pair by proximity
        const users = await User.find({ _id: { $in: tournament.participants } })
            .select('_id eloRating');

        // Sort participants by ELO ascending, then pair adjacent players
        const sorted    = users.sort((a, b) => a.eloRating - b.eloRating).map(u => u._id.toString());
        const byePlayer = sorted.length % 2 !== 0 ? sorted.pop() : null; // If odd number of participants, last one gets a bye for the first round
        const matchIds  = await createRoundMatches(sorted, tournament.gameCategory, tid);

        // Use the real wall-clock start time so we can compute time-remaining accurately
        const now = new Date();
        tournament.startDateTime = now;
        tournament.status = 'ongoing';
        tournament.rounds.push({
            roundNumber: 1,
            matches: matchIds,
            ...(byePlayer && { byePlayer })
        });
        await tournament.save();

        // Populate related fields for the response
        const updated = await Tournament.findById(tid)
            .populate('participants', 'username eloRating')
            .populate('gameCategory', 'name')
            .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            message: `Arena tournament started — ${matchIds.length} match(es) in round 1${byePlayer ? ', 1 bye' : ''}`,
            endsAt: new Date(now.getTime() + tournament.durationMinutes * 60 * 1000),
            data: updated
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error starting arena tournament',
            errorMessage: err.message
        });
    }
}

// Called after all matches in the current arena round are complete.
// If the tournament time window has expired, close the tournament and pick winner
//
// Otherwise, create the next round, pairing players by their current arena
// point totals (closest points play each other).
export async function advanceArenaTournament(req, res) {
    try {
        const { tid } = req.params;

        // Validate tournament ID format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Only allow advancing if it's an arena tournament and currently ongoing.
        if (tournament.tournamentType !== 'arena') {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Use POST /tournaments/:tid/advance for knockout tournaments'
            });
        }

        // Confirm tournament is ongoing before allowing advancing to the next round.
        if (tournament.status !== 'ongoing') {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Tournament is not currently ongoing'
            });
        }

        // Verify all matches in the current round are completed
        const currentRound   = tournament.rounds[tournament.rounds.length - 1];
        const currentMatches = await Match.find({ _id: { $in: currentRound.matches } });
        const incomplete     = currentMatches.filter(m => m.status !== 'completed');

        if (incomplete.length > 0) {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: `${incomplete.length} match(es) in the current round are not yet completed`
            });
        }

        // Check whether the arena time window has elapsed
        const now       = new Date();
        const startedAt = new Date(tournament.startDateTime);
        const endsAt    = new Date(startedAt.getTime() + tournament.durationMinutes * 60 * 1000);
        const timeUp    = now >= endsAt;

        if (timeUp) {
            // Time expired: close the tournament
            const sorted = [...tournament.arenaScores].sort((a, b) => b.points - a.points);
            const winnerId = sorted.length > 0 ? sorted[0].participant : null;

            tournament.status      = 'completed';
            tournament.winner      = winnerId;
            tournament.endDateTime = now;
            await tournament.save();

            return res.status(httpStatus.OK.code).json({
                success: true,
                message: 'Arena tournament time has ended — tournament completed!',
                winner: winnerId,
                finalStandings: sorted.map((s, i) => ({
                    rank: i + 1,
                    userId: s.participant,
                    points: s.points
                }))
            });
        }

        // Time remaining: pair by closest points for the next round
        // Sort participants by their current arena point total
        const sortedByPoints = [...tournament.arenaScores]
            .sort((a, b) => a.points - b.points)
            .map(s => s.participant.toString());

        const byePlayer = sortedByPoints.length % 2 !== 0 ? sortedByPoints.pop() : null;
        const matchIds  = await createRoundMatches(sortedByPoints, tournament.gameCategory, tid);

        const nextRoundNumber = currentRound.roundNumber + 1;
        tournament.rounds.push({
            roundNumber: nextRoundNumber,
            matches: matchIds,
            ...(byePlayer && { byePlayer })
        });
        await tournament.save();

        // Calculate time remaining for the response
        const timeRemainingSeconds = Math.round((endsAt - now) / 1000);

        res.status(httpStatus.OK.code).json({
            success: true,
            message: `Arena round ${nextRoundNumber} started — ${matchIds.length} match(es)${byePlayer ? ', 1 bye' : ''}`,
            timeRemainingSeconds,
            data: tournament
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error advancing arena tournament',
            errorMessage: err.message
        });
    }
}

// Records the result of an arena match and awards 1 point to the winner.
// This is separate from the regular match result endpoint so that the arena point
// can be credited to the tournament's arenaScores immediately.
export async function recordArenaMatchResult(req, res) {
    try {
        const { tid } = req.params;
        const { matchId, player1Score, player2Score } = req.body;

        // Validate tournament ID format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }
        // Basic validation for required fields and score sanity checks
        if (!matchId) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'matchId is required'
            });
        }

        // Since a score of 0 is allowed, we specifically check for undefined instead of wether or not the scores are false.
        if (player1Score === undefined || player2Score === undefined) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'player1Score and player2Score are required'
            });
        }

        // Scores must be different to determine a winner
        if (player1Score === player2Score) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Scores cannot be equal — there must be a winner'
            });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Only allow recording match results for arena tournaments that are currently ongoing.
        if (tournament.tournamentType !== 'arena') {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'This endpoint is only for arena tournaments'
            });
        }
        // Confirm tournament is ongoing before allowing recording match results.
        if (tournament.status !== 'ongoing') {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Tournament is not currently ongoing'
            });
        }
        // Verify the match exists and belongs to this tournament
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Match with ID '${matchId}' not found`
            });
        }
        // Check that the match belongs to this tournament to prevent tampering with matches from other tournaments.
        if (match.tournament?.toString() !== tid) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Match does not belong to this tournament'
            });
        }
        // Only allow recording match results if the match is still ongoing. This prevents tampering with match results that have already been recorded.
        if (match.status === 'completed') {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Match result has already been recorded'
            });
        }

        // Determine winner and loser
        const winnerId = player1Score > player2Score ? match.player1 : match.player2;
        const loserId  = player1Score > player2Score ? match.player2 : match.player1;
        // Update the match document with the scores and winner/loser info, and mark it as completed.
        match.player1Score = player1Score;
        match.player2Score = player2Score;
        match.winner = winnerId;
        match.loser  = loserId;
        match.status = 'completed';
        await match.save();

        // Credit 1 arena point to the winner
        const scoreEntry = tournament.arenaScores.find(
            s => s.participant.toString() === winnerId.toString()
        );
        if (scoreEntry) {
            scoreEntry.points += 1;
        }
        await tournament.save();

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Arena match result recorded — 1 point awarded to the winner',
            winner: winnerId,
            arenaScores: tournament.arenaScores
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error recording arena match result',
            errorMessage: err.message
        });
    }
}

// PATCH update tournament
export async function updateTournament(req, res) {
    try {
        const { tid } = req.params;
        const { title, description, status, durationMinutes } = req.body;

        // Validate tournament ID format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Only allow updating the title, description, status, and duration of the tournament.
        const updateData = {};
        if (title !== undefined)          updateData.title           = title;
        if (description !== undefined)    updateData.description     = description;
        if (status !== undefined)         updateData.status          = status;
        if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;

        // If the status is being updated to 'completed', set the endDateTime to now.
        const updated = await Tournament.findByIdAndUpdate(tid, updateData, {
            returnDocument: 'after',
            runValidators: true
        })
            // Re-populate participants and game category for the response since we updated the tournament document.
            .populate('participants', 'username eloRating')
            .populate('gameCategory', 'name numOfRounds')
            .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Tournament updated successfully',
            data: updated
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error updating tournament',
            errorMessage: err.message
        });
    }
}

// DELETE tournament (pending only)
export async function deleteTournament(req, res) {
    try {
        const { tid } = req.params;

        // Validate tournament ID format
        const validation = tournamentValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Only allow deleting tournaments that are still pending. This prevents deleting tournaments that have already started and have matches/standings data.
        if (tournament.status !== 'pending') {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Cannot delete a tournament that has already started'
            });
        }

        // Delete the tournament document. Since the tournament is pending, there should be no matches or standings data to worry about.
        await Tournament.findByIdAndDelete(tid);

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Tournament deleted successfully'
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error deleting tournament',
            errorMessage: err.message
        });
    }
}

export default {
    getAllTournaments,
    getTournamentById,
    createTournament,
    joinTournament,
    leaveTournament,
    getTournamentStandings,
    getTournamentMatches,
    generatePairing,
    advanceTournament,
    startArenaTournament,
    advanceArenaTournament,
    recordArenaMatchResult,
    updateTournament,
    deleteTournament
};
