import { Queue } from "../models/queue.model.js";

// Returns all Queues from the database, supports pagination and filtering by status
export async function getAllQueues({ skip = 0, limit = 20, filter = {} } = {}) {
    return await Queue.find(filter).skip(skip).limit(limit);
}

// Gets a single Queue by the id
export async function getQueue(qid) {
    return await Queue.findById(qid);
}

// ELO tolerance increases the longer a player has been waiting
function getEloTolerance(createdAt) {
    const waitSeconds = (Date.now() - new Date(createdAt)) / 1000;
    if (waitSeconds < 30) return 50;
    if (waitSeconds < 120) return 150;
    if (waitSeconds < 300) return 300;
    return Infinity;
}

// Joins the queue and tries to find a matching player by ELO
export async function createQueue(data) {
    const waitingPlayers = await Queue.find({ status: "waiting" });

    for (const candidate of waitingPlayers) {
        if (candidate.player.toString() === data.player?.toString()) continue;

        const tolerance = getEloTolerance(candidate.createdAt);
        const eloDiff = Math.abs(candidate.elo - (data.elo ?? 1000));

        if (eloDiff <= tolerance) {
            const matched = await Queue.findByIdAndUpdate(
                candidate._id,
                { status: "matched" },
                { returnDocument: "after" }
            );
            const newEntry = await Queue.create({ ...data, status: "matched" });
            return { matched: true, entries: [matched, newEntry] };
        }
    }
    const entry = await Queue.create(data);
    return { matched: false, entry };
}

// Updates a Queue by ID (qid), then returns the updated document
export async function updateQueue(qid, data) {
    return await Queue.findByIdAndUpdate(qid, data, { returnDocument: "after" });
}

// Removes a player from the queue by ID (qid)
export async function deleteQueue(qid) {
    return await Queue.findByIdAndDelete(qid);
}

export default {
    getAllQueues,
    getQueue,
    createQueue,
    updateQueue,
    deleteQueue
};