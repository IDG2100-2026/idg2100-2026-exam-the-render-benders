import { apiFetch } from "@/api.js";

// getting all tournaments
export async function getAllTournaments(){
    const tournaments = await apiFetch("/tournaments");
    return tournaments.allTournaments;
}

// getting a single tournament
export async function getTournament(tid){
    const tournament = await apiFetch(`/tournaments/${tid}`);
    return tournament.tournamentObj;
}

// joining a tournament
export async function joinTournament(tid, userData){
    const joinedTournament = await apiFetch(`/tournaments/${tid}/join`, {
        method: "PATCH",
        body: JSON.stringify(userData)
    });
    return joinedTournament.updatedTournament;
}

// getting the upcoming tournaments sorted by date (closes first)
export async function getUpcomingTournaments(limit = 5){
    const result = await apiFetch(`/tournaments?status=pending&limit=${limit}&sort=startDateTime`);
    return result.allTournaments;
}

