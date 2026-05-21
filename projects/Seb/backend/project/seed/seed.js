import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { User } from '../models/users.js';
import { GameCategory } from '../models/game.js';
import { Match } from '../models/match.js';
import { Tournament } from '../models/tournament.js';
import { Comment } from '../models/comment.js';
import { Trophy } from '../models/trophy.js';

//  Seed data imports
import usersData from './data/users.json' with { type: 'json' };
import gameCategoriesData from './data/game-categories.json' with { type: 'json' };
import matchesData from './data/matches.json' with { type: 'json' };
import tournamentsData from './data/tournaments.json' with { type: 'json' };
import trophiesData from './data/trophies.json' with { type: 'json' };
import commentsData from './data/comments.json' with { type: 'json' };

// Construct MongoDB connection URI from environment variables
const { DB_HOST, DB_PORT, DB_NAME } = process.env;
const CONN_URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Connect to MongoDB
await mongoose.connect(CONN_URI);
console.log('Connected to MongoDB');

try {
    // Clear ALL collections
    await Promise.all([
        User.deleteMany({}),
        GameCategory.deleteMany({}),
        Match.deleteMany({}),
        Tournament.deleteMany({}),
        Comment.deleteMany({}),
        Trophy.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Inserting data

    // Game Categories
    const gameCategories = await GameCategory.insertMany(
        // map each game category doc to include a generated _id field with the "game_" prefix and a nanoid string (f.ex "game_a1b2c3d4e5")
        gameCategoriesData.map(doc => ({ _id: `game_${nanoid(10)}`, ...doc })) // Generate a new ID and spread the rest of the doc's fields into the new object
    );
    console.log(`Created ${gameCategories.length} game categories`);

    // Users
    const users = await User.insertMany(
        // map each user doc to include a generated _id field with the "user_" prefix and a nanoid string (f.ex "user_a1b2c3d4e5")
        usersData.map(doc => ({ _id: `user_${nanoid(10)}`, ...doc })) // Generate a new ID and spread the rest of the doc's fields into the new object
    );
    console.log(`Created ${users.length} users`);

    // Build lookup maps so JSON symbolic keys (f.ex "proPlayer") resolve to real DB IDs.
    // User keys are matched positionally by username order in users.json.
    const userKeys = ['adminUser', 'proPlayer', 'casualPlayer', 'newbieUser'];
    // This creates an object like { adminUser: 'user_a1b2c3d4e5', proPlayer: 'user_f6g7h8i9j0', ... }
    const userMap = Object.fromEntries(userKeys.map((key, i) => [key, users[i]._id]));

    // Game category keys matched positionally by order in game-categories.json.
    const gameCatKeys = ['quickPlay', 'standard', 'proLeague'];
    // This creates an object like { quickPlay: 'game_a1b2c3d4e5', standard: 'game_f6g7h8i9j0', ... }
    const gameCatMap = Object.fromEntries(gameCatKeys.map((key, i) => [key, gameCategories[i]._id]));

    // Resolves a symbolic key or passes through null/real values unchanged
    const resolve = (map, key) => (key === null ? null : (map[key] ?? key));

    // Matches
    const matches = await Match.insertMany(
        // map each match doc to include a generated _id field with the "match_" prefix and a nanoid string (f.ex "match_a1b2c3d4e5")
        matchesData.map(doc => ({
            _id: `match_${nanoid(10)}`, // Generate a new ID for this match
            ...doc,
            player1:  resolve(userMap,    doc.player1),
            player2:  resolve(userMap,    doc.player2),
            gameType: resolve(gameCatMap, doc.gameType),
            winner:   resolve(userMap,    doc.winner ?? null),
            loser:    resolve(userMap,    doc.loser  ?? null)
        }))
    );
    console.log(`Created ${matches.length} matches`);

    // Update ELO ratings to reflect seeded match results
    const eloUpdates = [
        { key: 'adminUser',    eloRating: 2020, eloRatingChange:  20 },
        { key: 'proPlayer',    eloRating: 1840, eloRatingChange:  40 },
        { key: 'casualPlayer', eloRating: 1572, eloRatingChange: -28 },
        { key: 'newbieUser',   eloRating: 1360, eloRatingChange: -40 }
    ];
    // This applies the new ELO ratings to the seeded users based on the match outcomes.
    await Promise.all(
        eloUpdates.map(({ key, eloRating, eloRatingChange }) =>
            User.findByIdAndUpdate(userMap[key], { eloRating, eloRatingChange })
        )
    );

    // Build a match index so tournament rounds can reference matches by position key
    // f.ex "match_0" → matches[0]._id | "match_1" → matches[1]._id | etc. based on order in matches.json
    const matchIndexMap = Object.fromEntries(matches.map((m, i) => [`match_${i}`, m._id]));

    // Trophies (created before tournaments so IDs are available)
    // Trophies reference tournaments by key — resolve after tournament creation
    const trophyKeyMap = {};
    const trophies = await Trophy.insertMany(
        trophiesData.map((doc, i) => {
            const id = `trophy_${nanoid(10)}`; // Generate a new ID for this trophy
            trophyKeyMap[`trophy_${i}`] = id; // temporary index key
            return { _id: id, ...doc, tournament: 'placeholder' }; // resolved below
        })
    );
    console.log(`Created ${trophies.length} trophies`);

    // Build trophy key map keyed by the "tournament" field value in trophies.json
    // so we can look up a trophy by its symbolic tournament key
    const trophyByTournamentKey = Object.fromEntries(
        trophiesData.map((doc, i) => [doc.tournament, trophies[i]._id])
    );

    // Tournaments
    const tournamentKeyMap = {};
    const tournaments = await Tournament.insertMany(
        // map each tournament doc to include a generated _id field with the "tournament_" prefix and a nanoid string (f.ex "tournament_a1b2c3d4e5")
        tournamentsData.map(doc => {
            const id = `tournament_${nanoid(10)}`; // Generate a new ID for this tournament
            tournamentKeyMap[doc.key] = id;
            // Return the tournament object with resolved references and the new ID
            return {
                _id: id,
                title:          doc.title,
                description:    doc.description,
                tournamentType: doc.tournamentType,
                gameCategory:   resolve(gameCatMap, doc.gameCategory),
                status:         doc.status,
                participants:   doc.participants.map(k => resolve(userMap, k)),
                minParticipants: doc.minParticipants,
                maxParticipants: doc.maxParticipants,
                startDateTime:  new Date(doc.startDateTime),
                endDateTime:    doc.endDateTime ? new Date(doc.endDateTime) : null,
                rounds: doc.rounds.map(r => ({
                    roundNumber: r.roundNumber,
                    matches: r.matchKeys.map(k => resolve(matchIndexMap, k))
                })),
                trophy:    trophyByTournamentKey[doc.key] ?? null,
                winner:    resolve(userMap, doc.winner),
                createdBy: resolve(userMap, doc.createdBy)
            };
        })
    );
    console.log(`Created ${tournaments.length} tournaments`);

    // Now patch each trophy's tournament field with the real tournament ID
    await Promise.all(
        trophiesData.map((doc, i) =>
            Trophy.findByIdAndUpdate(trophies[i]._id, {
                tournament: tournamentKeyMap[doc.tournament] ?? null
            })
        )
    );

    // Comments
    await Comment.insertMany(
        commentsData.map(doc => ({
            _id: `comment_${nanoid(10)}`, // Generate a new ID for this comment
            ...doc,
            author:     resolve(userMap,          doc.author),
            match:      resolve(matchIndexMap,    doc.match),
            tournament: resolve(tournamentKeyMap, doc.tournament)
        }))
    );
    console.log(`Created ${commentsData.length} comments`);

    // Summary
    console.log('\nDatabase seeded successfully!\n');

    // Print out the created documents, for easy access when testing the endpoints
    console.log('Users:');
    users.forEach(u => console.log(`  - ${u.username} (${u._id}) [${u.userType}]`));

    console.log('\nGame Categories:');
    gameCategories.forEach(c => console.log(`  - ${c.name} (${c._id})`));

    console.log('\nMatches:');
    matches.forEach((m, i) => console.log(`  - ${m._id} [${matchesData[i].status}]`));

    console.log('\nTournaments:');
    tournaments.forEach((t, i) => console.log(`  - ${t._id} [${tournamentsData[i].status}] — ${t.title}`));

    console.log('\nTrophies:');
    trophies.forEach((t, i) => console.log(`  - ${t._id} — ${trophiesData[i].title}`));

} catch (err) {
    // IF any error occurs during the seeding process, log it here. The finally block will still run to close the DB connection.
    console.error('Seeding error:', err.message);
    console.error(err);
} finally {
    // Close connection to MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
}