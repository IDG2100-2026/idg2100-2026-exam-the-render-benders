// Seed data (users.json) was generated with AI assistance (Claude)
import { connectDB, disconnectDB } from "../config/db.js";
import { hashPwd } from "../utils/hash.js";
import userArray from "./users.json" with { type: "json" };

// Importing Models
import { User } from "../models/user.model.js";
import { Game } from "../models/game.model.js";
import { Comment } from "../models/comment.model.js";

// Connect to MongoDB before seeding
await connectDB();

// Clear all collections before inserting new data
try {
    await User.deleteMany({});
    await Game.deleteMany({});
    await Comment.deleteMany({});
    console.log("Collections cleared");

} catch (err) {
    console.error("Could not clear collections", err);
}

// Insert users and save the returned documents
let insertedUsers;
try {
    const hashedUsers = userArray.map(u => ({ ...u, pwd: hashPwd(u.pwd) }));
    insertedUsers = await User.insertMany(hashedUsers);
    
    // Add some initial trophies to players to showcase the trophy cabinet
    await User.findByIdAndUpdate(insertedUsers[0]._id, {
        $push: { trophies: [
            { title: "Beta Tester 2026", image: "https://cdn-icons-png.flaticon.com/512/610/610333.png" },
            { title: "First Win", image: "https://cdn-icons-png.flaticon.com/512/179/179249.png" }
        ]}
    });
    await User.findByIdAndUpdate(insertedUsers[4]._id, {
        $push: { trophies: [
            { title: "Grandmaster", image: "https://cdn-icons-png.flaticon.com/512/3112/3112946.png" },
            { title: "Madrid Tavern Legend", image: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png" }
        ]}
    });

    console.log("Users inserted:", insertedUsers.length);

} catch (err) {
    console.error("Could not insert users", err);
    await disconnectDB();
    process.exit(1);
}

// Destructure users to use their IDs
const [carlos, maria, erik, sofia, lucas, elena] = insertedUsers;

// Insert games using the inserted user IDs
try {
    const games = await Game.insertMany([
        {
            players: [lucas._id, elena._id],
            variant: { rounds: 5, rules: "no-straights", timeControl: 30 },
            status: "finished",
            result: { winner: lucas._id },
            createdAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
        },
        {
            players: [carlos._id, elena._id],
            variant: { rounds: 3, rules: "straights-allowed", timeControl: 3 },
            status: "finished",
            result: { winner: elena._id },
            createdAt: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
            players: [carlos._id, maria._id],
            variant: { rounds: 3, rules: "straights-allowed", timeControl: 10 },
            status: "finished",
            result: { winner: carlos._id }
        },
        {
            players: [erik._id, sofia._id],
            variant: { rounds: 5, rules: "no-straights", timeControl: 10 },
            status: "ongoing"
        },
        // Waiting games - visible in the lobby
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
            players: [maria._id],
            variant: { rounds: 5, rules: "no-straights", timeControl: 30 },
            status: "waiting",
            allowAnonymous: false,
            desiredElo: 950
        },
        {
            players: [erik._id],
            variant: { rounds: 7, rules: "straights-allowed", timeControl: 10 },
            status: "waiting",
            allowAnonymous: true,
            desiredElo: 1100
        }
    ]);
    console.log("Games inserted");

    // Add some comments to the first finished game
    await Comment.insertMany([
        {
            body: "What a spectacular match! That last roll was insane.",
            author: carlos._id,
            game: games[0]._id
        },
        {
            body: "I agree, lucas_diez played perfectly.",
            author: sofia._id,
            game: games[0]._id
        }
    ]);
    console.log("Comments inserted");

} catch (err) {
    console.error("Could not insert games or comments", err);
}

// Disconnect from MongoDB when done
await disconnectDB();
console.log("Seeding complete");
