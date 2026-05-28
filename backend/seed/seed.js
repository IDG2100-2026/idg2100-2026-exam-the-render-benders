import { connectDB, disconnectDB } from "../config/db.js";
import { hashPwd } from "../utils/hash.js";
import userArray from "./users.json" with { type: "json" };

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

// --- USERS ---
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

const [carlos, mariasol, eriklarsen, sofiaberg, lucas, elena, bannedUser, adminPoker] = insertedUsers;

// --- GAME CATEGORIES (18 combinations: 3 rounds x 2 straights x 3 time controls) ---
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

// Handy references to specific categories
const cat3rStraights10s = insertedCategories.find(c => c.numOfRounds === 3 && c.straightsAllowed && c.timePerRound === 10);
const cat5rNoStraights30s = insertedCategories.find(c => c.numOfRounds === 5 && !c.straightsAllowed && c.timePerRound === 30);
const cat7rStraights10s = insertedCategories.find(c => c.numOfRounds === 7 && c.straightsAllowed && c.timePerRound === 10);

// --- GAMES ---
let insertedGames;
try {
    insertedGames = await Game.insertMany([
        // Finished games
        {
            players: [lucas._id, elena._id],
            variant: { rounds: 5, rules: "no-straights", timeControl: 30 },
            status: "finished",
            result: { winner: lucas._id },
            createdAt: new Date(Date.now() - 86400000 * 2)
        },
        {
            players: [carlos._id, elena._id],
            variant: { rounds: 3, rules: "straights-allowed", timeControl: 10 },
            status: "finished",
            result: { winner: elena._id },
            createdAt: new Date(Date.now() - 86400000)
        },
        {
            players: [carlos._id, mariasol._id],
            variant: { rounds: 3, rules: "straights-allowed", timeControl: 10 },
            status: "finished",
            result: { winner: carlos._id }
        },
        // Ongoing game
        {
            players: [eriklarsen._id, sofiaberg._id],
            variant: { rounds: 5, rules: "no-straights", timeControl: 10 },
            status: "ongoing"
        },
        // Waiting games (lobby)
        {
            players: [lucas._id],
            variant: { rounds: 7, rules: "straights-allowed", timeControl: 10 },
            status: "waiting",
            allowAnonymous: false,
            desiredElo: 1400
        },
        {
            players: [carlos._id],
            variant: { rounds: 3, rules: "straights-allowed", timeControl: 10 },
            status: "waiting",
            allowAnonymous: true,
            desiredElo: 1200
        },
        {
            players: [mariasol._id],
            variant: { rounds: 5, rules: "no-straights", timeControl: 30 },
            status: "waiting",
            allowAnonymous: false,
            desiredElo: 950
        },
        {
            players: [eriklarsen._id],
            variant: { rounds: 7, rules: "straights-allowed", timeControl: 10 },
            status: "waiting",
            allowAnonymous: true,
            desiredElo: 1100
        }
    ]);
    console.log(`Games inserted: ${insertedGames.length}`);
} catch (err) {
    console.error("Could not insert games:", err.message);
    await disconnectDB();
    process.exit(1);
}

// --- COMMENTS ---
try {
    await Comment.insertMany([
        {
            body: "What a spectacular match! That last roll was insane.",
            author: carlos._id,
            game: insertedGames[0]._id
        },
        {
            body: "I agree, lucas_diez played perfectly.",
            author: sofiaberg._id,
            game: insertedGames[0]._id
        },
        {
            body: "Good game elena, you deserved that win.",
            author: eriklarsen._id,
            game: insertedGames[1]._id
        }
    ]);
    console.log("Comments inserted: 3");
} catch (err) {
    console.error("Could not insert comments:", err.message);
}

// --- TOURNAMENTS + TROPHIES ---
// Finished tournament first (needs a trophy)
try {
    const finishedTournament = await Tournament.create({
        name: "Spring Classic 2026",
        description: "The inaugural Spanish Dice knockout tournament.",
        startDate: new Date(Date.now() - 86400000 * 7),
        tournamentType: "knockout",
        gameCategory: cat3rStraights10s._id,
        variant: { rounds: 3, rules: "straights-allowed", timeControl: 10 },
        status: "finished",
        players: [lucas._id, elena._id, carlos._id, eriklarsen._id],
        minParticipants: 2,
        maxParticipants: 8,
        winner: lucas._id,
        rounds: [
            {
                roundNumber: 1,
                matches: [insertedGames[0]._id, insertedGames[2]._id]
            }
        ]
    });

    const finishedTrophy = await Trophy.create({
        title: "Spring Classic 2026 Champion",
        image: "https://cdn-icons-png.flaticon.com/512/3112/3112946.png",
        tournament: finishedTournament._id
    });

    await Tournament.findByIdAndUpdate(finishedTournament._id, { trophy: finishedTrophy._id });
    await User.findByIdAndUpdate(lucas._id, { $push: { trophies: finishedTrophy._id } });

    console.log(`Tournaments inserted: 1 finished (Spring Classic 2026)`);
    console.log(`Trophies inserted: 1 (${finishedTrophy._id})`);

    // Upcoming knockout tournament
    const upcomingKnockout = await Tournament.create({
        name: "Summer Knockout 2026",
        description: "Fast-paced knockout - top prize goes to the last player standing.",
        startDate: new Date(Date.now() + 86400000 * 3),
        tournamentType: "knockout",
        gameCategory: cat5rNoStraights30s._id,
        variant: { rounds: 5, rules: "no-straights", timeControl: 30 },
        status: "upcoming",
        players: [carlos._id, mariasol._id, eriklarsen._id],
        minParticipants: 4,
        maxParticipants: 8
    });

    // Upcoming arena tournament
    const upcomingArena = await Tournament.create({
        name: "Weekend Arena",
        description: "Play as many games as you can in 60 minutes. Most wins takes the crown.",
        startDate: new Date(Date.now() + 86400000 * 5),
        tournamentType: "arena",
        gameCategory: cat7rStraights10s._id,
        variant: { rounds: 7, rules: "straights-allowed", timeControl: 10 },
        status: "upcoming",
        players: [lucas._id, elena._id, sofiaberg._id],
        minParticipants: 2,
        maxParticipants: 16,
        durationMinutes: 60,
        arenaScores: [
            { participant: lucas._id, points: 0 },
            { participant: elena._id, points: 0 },
            { participant: sofiaberg._id, points: 0 }
        ]
    });

    console.log(`  upcoming knockout: ${upcomingKnockout._id}`);
    console.log(`  upcoming arena:    ${upcomingArena._id}`);
} catch (err) {
    console.error("Could not insert tournaments/trophies:", err.message);
}

await disconnectDB();
console.log("\nSeeding complete.");
console.log("  Admin login:  admin / Adminpass1!");
console.log("  User logins:  carlos88 / Password123!  |  lucas_diez / Password123!  |  elena_r / Password123!");
console.log("  Banned user:  banned_user / Password123!");
