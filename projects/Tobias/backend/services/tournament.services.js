import { Tournament } from "../models/tournaments.js";
import { User } from "../models/users.js";
import { Match } from "../models/matches.js";

export async function checkTournamentExistence(tid){
    // checks if tournament already exists
    const tournamentExists = await Tournament.exists({ tid });
    if (tournamentExists){
        return true;
    } else {
        throw new Error(`A tournament with id ${tid} does not exist`)
    }
}

export async function getAllTournaments(limit, skip, filter, sort){
    // fetches tournaments with pagination: limit tells how many to return and skip says how many to skip
    // filter limits which tournaments to return (example: only ongoing tournaments)
    // sort controls the order of the results (example: by startDateTime)
    return await Tournament.find(filter).sort(sort).limit(limit).skip(skip);
}

export async function getTournament(tid){
    return await Tournament.findOne({ tid });
}

export async function createTournament(tournamentObj){
    // creating the match
    const tournament = new Tournament(tournamentObj);
    // saving it to the db
    const savedTournament = await tournament.save();
    // returning auto generated tournament id 
    return savedTournament.tid;
}

export async function startTournament(tid){
    const tournament = await Tournament.findOne({ tid });

    // spreading the players into a new array to avoid changing the original, and then sorting the new one randomly
    const players = [...tournament.players].sort(() => Math.random() - 0.5);

    // pair two and two players and create a match for each pair
    // the last player (if there is no other players to play them) will automatically progress
    for (let i = 0; i < players.length - 1; i += 2){
        const matches = new Match({
            rounds: tournament.rounds,
            includeStraights: tournament.includeStraights,
            timeControl: tournament.timeControl,
            players: [players[i], players[i + 1]],
            status: "ongoing"
        });
        await matches.save();
    }

    // setting the tournament status to ongoing and returning the updated tournament
    return await Tournament.findOneAndUpdate(
        { tid }, // finds tournament with specific tid
        { status: "ongoing" }, // setting the game as ongoing
        { new: true } // returning updated version 
    )
}

export async function updateTournament(tid, updates){
    return await Tournament.findOneAndUpdate(
        { tid }, // finds tournament with specific tid
        updates, // the fields that are updated
        { new: true } // returning updated version
    );
}
export async function joinTournament(tid, uid){
    return await Tournament.findOneAndUpdate(
        { tid }, // finds tournament with specific tid
        { $push: { players: uid }}, // adds player witd specific uid
        { new: true } // returning updated version
    );
}

export async function finishTournament(tid){
    const tournament = await Tournament.findOne({ tid });

    // find all the finished matches where both players are in the tournament 
    const matches = await Match.find({
        status: "finished",
        players: { $in: tournament.players }
    });

    // count wins per player
    const winCount = {};
    for (const match of matches) {
        // -1 is the last element in the array (the winner from the last round)
        // ?. returns undefined instead of crashing if the result is empty
        const winnerId = match.results[match.results.length - 1]?.outcome;
        if (winnerId) {
            winCount[winnerId] = (winCount[winnerId] || 0) + 1;
        } 
    }

    // find the player uid with the most wins (the tournament winner)
    const winnerId = Object.keys(winCount).reduce((a, b) => 
        // if win count for player a is bigger than b, then the winner is player a, else it is player b
        winCount[a] > winCount[b] ? a : b
    );

    // push the tournament trophy to the winner's trophies array
    await User.findOneAndUpdate(
        { uid: parseInt(winnerId) },
        { $push: { trophies: { title: tournament.title, image: tournament.trophy } } } 
    );

    // setting the tournament to finished and returning the updated tournament
    return await Tournament.findOneAndUpdate(
        { tid },
        { status: "finished" },
        { new: true }
    );
}

export async function deleteTournament(tid){
    return await Tournament.findOneAndDelete({ tid });
}

export default {
    checkTournamentExistence,
    getAllTournaments,
    getTournament,
    createTournament,
    startTournament,
    updateTournament,
    joinTournament,
    deleteTournament,
    finishTournament
}
