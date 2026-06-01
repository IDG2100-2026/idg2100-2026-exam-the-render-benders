import queueService from "../services/queue.service.js";
import { sendError } from "../utils/controllerHelpers.js";

// Get all queues from the database and return them as JSON
// Supports filtering by status: ?status=waiting or ?status=matched
export async function getAllQueues(req, res) {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const queues = await queueService.getAllQueues({ skip, limit, filter });
        res.status(200).json(queues);
    } catch (err) {
        sendError(res, err);
    }
}

// Get a queue from the DB and return the queue as JSON
export async function getQueue(req, res) {
    try {
        const queue = await queueService.getQueue(req.params.qid);
        if (!queue) return res.status(404).json({ error: "Queue entry not found" });
        res.status(200).json(queue);
    } catch (err) {
        sendError(res, err);
    }
}

// Joins the matchmaking queue, and returns a match if a suitable opponent is found, otherwise adds to queue
export async function createQueue(req, res) {
    try {
        const queue = await queueService.createQueue(req.body);
        res.status(201).json(queue);
    } catch (err) {
        sendError(res, err);
    }
}

// Updates a queue by ID (qid) and return the updated queue as JSON
export async function updateQueue(req, res) {
    try {
        const queue = await queueService.updateQueue(req.params.qid, req.body);
        if (!queue) return res.status(404).json({ error: "Queue entry not found" });
        res.status(200).json(queue);
    } catch (err) {
        sendError(res, err);
    }
}

// Deletes a queue by ID (qid)
export async function deleteQueue(req, res) {
    try {
        const queue = await queueService.deleteQueue(req.params.qid);
        if (!queue) return res.status(404).json({ error: "Queue entry not found" });
        res.status(204).send();
    } catch (err) {
        sendError(res, err);
    }
}

export default {
    getAllQueues,
    getQueue,
    createQueue,
    updateQueue,
    deleteQueue
};
