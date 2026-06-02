import { connectDB, disconnectDB } from "../config/db.js";
import { hashPwd } from "../utils/hash.js";
import { MS_PER_DAY } from "../config/constants.js";
import userArray from "./data/users.json" with { type: "json" };
import gameArray from "./data/games.json" with { type: "json" };
import commentArray from "./data/comments.json" with { type: "json" };
import tournamentArray from "./data/tournaments.json" with { type: "json" };

import { User } from "../models/user.model.js";
import { Game } from "../models/game.model.js";
import { Comment } from "../models/comment.model.js";
import { GameCategory } from "../models/gameCategory.model.js";
import { Tournament } from "../models/tournament.model.js";
import { Trophy } from "../models/trophy.model.js";

await connectDB();

// Clear all collections
try {
    await Promise.all([
        User.deleteMany({}),
        Game.deleteMany({}),
        Comment.deleteMany({}),
        GameCategory.deleteMany({}),
        Tournament.deleteMany({}),
        Trophy.deleteMany({})
    ]);
    console.log("All collections cleared");
} catch (err) {
    console.error("Could not clear collections:", err.message);
    await disconnectDB();
    process.exit(1);
}

// USERS
let insertedUsers;
try {
    const usersWithHashedPwd = userArray.map(u => ({ ...u, pwd: hashPwd(u.pwd) }));
    insertedUsers = await User.insertMany(usersWithHashedPwd);
    console.log(`Users inserted: ${insertedUsers.length}`);
    insertedUsers.forEach(u => console.log(`  ${u.isAdmin ? "[admin]" : u.isBanned ? "[banned]" : "[user] "} ${u.username} (${u._id})`));
} catch (err) {
    console.error("Could not insert users:", err.message);
    await disconnectDB();
    process.exit(1);
}

// Build username, _id lookup for resolving references in other JSON files
const userMap = Object.fromEntries(insertedUsers.map(u => [u.username, u._id]));

// GAME CATEGORIES (18 combinations: 3 rounds x 2 straights x 3 time controls)
let insertedCategories;
try {
    const categories = [];
    for (const numOfRounds of [3, 5, 7]) {
        for (const straightsAllowed of [true, false]) {
            for (const timePerRound of [10, 30, 90]) {
                const straights = straightsAllowed ? "straights" : "no-straights";
                categories.push({
                    name: `${numOfRounds}R ${straights} ${timePerRound}s`,
                    numOfRounds,
                    straightsAllowed,
                    timePerRound
                });
            }
        }
    }
    insertedCategories = await GameCategory.insertMany(categories);
    console.log(`Game categories inserted: ${insertedCategories.length}`);
} catch (err) {
    console.error("Could not insert game categories:", err.message);
    await disconnectDB();
    process.exit(1);
}

// Build category name, doc lookup
const categoryMap = Object.fromEntries(insertedCategories.map(c => [c.name, c]));

// GAMES
let insertedGames;
try {
    const games = gameArray.map(g => {
        const resolvedPlayers = g.players.map(username => userMap[username]);
        const game = {
            ...g,
            players: resolvedPlayers
        };
        if (g.result?.winner) game.result = { winner: userMap[g.result.winner] };
        if (g.daysAgo) game.createdAt = new Date(Date.now() - MS_PER_DAY * g.daysAgo);
        delete game.daysAgo;
        // set playerStacks so each player starts with the correct stack (buyIn * rounds)
        // the service does this on createGame/joinGame, but seed bypasses the service
        if (g.status !== "finished") {
            game.playerStacks = resolvedPlayers.map(userId => ({
                user: userId,
                stack: g.buyIn * g.variant.rounds
            }));
        }
        return game;
    });
    insertedGames = await Game.insertMany(games);
    console.log(`Games inserted: ${insertedGames.length}`);
} catch (err) {
    console.error("Could not insert games:", err.message);
    await disconnectDB();
    process.exit(1);
}

// COMMENTS
try {
    const comments = commentArray.map(c => ({
        body: c.body,
        author: userMap[c.author],
        game: insertedGames[c.gameIndex]._id
    }));
    await Comment.insertMany(comments);
    console.log(`Comments inserted: ${comments.length}`);
} catch (err) {
    console.error("Could not insert comments:", err.message);
}

// TOURNAMENTS + TROPHIES
try {
    for (const t of tournamentArray) {
        const startDate = t.daysAgo
            ? new Date(Date.now() - MS_PER_DAY * t.daysAgo)
            : new Date(Date.now() + MS_PER_DAY * (t.daysFromNow || 0));

        const tournamentData = {
            name: t.name,
            description: t.description,
            startDate,
            tournamentType: t.tournamentType,
            variant: t.variant,
            status: t.status,
            players: t.players.map(username => userMap[username]),
            minParticipants: t.minParticipants,
            maxParticipants: t.maxParticipants
        };

        if (t.categoryKey) tournamentData.gameCategory = categoryMap[t.categoryKey]?._id;
        if (t.winner) tournamentData.winner = userMap[t.winner];
        if (t.durationMinutes) tournamentData.durationMinutes = t.durationMinutes;
        if (t.rounds) {
            tournamentData.rounds = t.rounds.map(r => ({
                roundNumber: r.roundNumber,
                matches: r.matchIndices.map(i => insertedGames[i]._id)
            }));
        }
        if (t.arenaScorePlayers) {
            tournamentData.arenaScores = t.arenaScorePlayers.map(username => ({
                participant: userMap[username],
                points: 0
            }));
        }

        const tournament = await Tournament.create(tournamentData);

        if (t.trophy) {
            const trophy = await Trophy.create({
                title: t.trophy.title,
                image: t.trophy.image,
                tournament: tournament._id
            });
            await Tournament.findByIdAndUpdate(tournament._id, { trophy: trophy._id });
            await User.findByIdAndUpdate(userMap[t.trophy.awardTo], { $push: { trophies: trophy._id } });
            console.log(`Tournament inserted: ${t.name} (with trophy)`);
        } else {
            console.log(`Tournament inserted: ${t.name}`);
        }
    }
} catch (err) {
    console.error("Could not insert tournaments/trophies:", err.message);
}

await disconnectDB();
console.log("\nSeeding complete.");
console.log("  Admin login:  admin / Adminpass1!");
console.log("  User logins:  carlos88 / Password123!  |  lucas_diez / Password123!  |  elena_r / Password123!");
console.log("  Banned user:  banned_user / Password123!");
