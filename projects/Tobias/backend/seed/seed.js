import { connectDB, disconnectDB } from "../config/db.config.js";
import { User } from "../models/users.js";
import { Match } from "../models/matches.js";
import { Tournament } from "../models/tournaments.js";
import { Comment } from "../models/comments.js";
import { saveMatchResult } from "../services/match.services.js";

await connectDB();

await User.deleteMany({});
await Match.deleteMany({});
await Tournament.deleteMany({});
await Comment.deleteMany({});

const users = await User.create([
    { username: "Tobias", email: "tobias@gmail.no", age: 23, pwd: "123" },
    { username: "Robin", email: "robin@gmail.no", age: 22, pwd: "456" },
    { username: "Aliaksei", email: "aliaksei@gmail.no", age: 35, pwd: "789" },
    { username: "Carlos", email: "carlos@gmail.no", age: 35, pwd: "246" },
    { username: "Johan", email: "johan@gmail.no", age: 30, pwd: "111" },
    { username: "Sebastian", email: "sebastian@gmail.no", age: 30, pwd: "222" }
]);

const [user1, user2, user3, user4, user5, user6] = users;
const allUsers = [user1, user2, user3, user4, user5, user6];

// helper to pick a random winner between two players (50/50)
function randomWinner(playerA, playerB) {
    return Math.random() < 0.5 ? playerA.uid : playerB.uid;
}

// helper to build a single result round
function makeResult(winnerUid) {
    return {
        rolls: ["A", "A", "A", "K", "Q"],
        holds: [true, true, true, false, false],
        outcome: winnerUid,
        timestamps: { startedAt: new Date(), endedAt: new Date() }
    };
}

// create finished matches and let saveMatchResult update ELO automatically
const finishedPairs = [
    [user1, user2], [user2, user3], [user3, user4],
    [user4, user5], [user5, user6], [user1, user3],
    [user2, user4], [user6, user1], [user3, user5], [user4, user6]
];

for (const [playerA, playerB] of finishedPairs) {
    const match = await Match.create({
        rounds: 5,
        includeStraights: false,
        timeControl: 10,
        players: [playerA.uid, playerB.uid],
        status: "ongoing",
        results: []
    });
    const winner = randomWinner(playerA, playerB);
    await saveMatchResult(match.mid, [makeResult(winner)]);
}

// create 6 pending matches for lobby testing (one per user)
const roundOptions = [3, 5, 7];
const timeOptions = [3, 10, 30];

for (let i = 0; i < 6; i++) {
    const player = allUsers[i];
    await Match.create({
        rounds: roundOptions[i % 3],
        includeStraights: i % 2 === 0,
        timeControl: timeOptions[i % 3],
        players: [player.uid],
        status: "pending",
        results: []
    });
}

const tournaments = await Tournament.create([
    {
        title: "Easter Tournament 2026",
        description: "First tournament of 2026 with easter theme",
        rounds: 5,
        includeStraights: false,
        timeControl: 10,
        minPlayers: 4,
        maxPlayers: 16,
        startDateTime: new Date("2026-04-05"),
        trophy: "Easter Cup Trophy",
        players: [user1.uid, user2.uid, user3.uid, user4.uid],
        status: "pending"
    }
]);

await Comment.create([
    { uid: user1.uid, text: "Good game!", matchId: users[0].uid },
    { uid: user2.uid, text: "I should have won that!", matchId: users[0].uid },
]);

console.log("Database has been seeded successfully");

await disconnectDB();
