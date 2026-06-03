import queueService from "../services/queue.service.js";
import { sendError } from "../utils/controllerHelpers.js";

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

export async function getQueue(req, res) {
    try {
        const queue = await queueService.getQueue(req.params.qid);
        if (!queue) return res.status(404).json({ error: "Queue entry not found" });
        res.status(200).json(queue);
    } catch (err) {
        sendError(res, err);
    }
}

export async function createQueue(req, res) {
    try {
        const queue = await queueService.createQueue(req.body);
        res.status(201).json(queue);
    } catch (err) {
        sendError(res, err);
    }
}

export async function updateQueue(req, res) {
    try {
        const queue = await queueService.updateQueue(req.params.qid, req.body);
        if (!queue) return res.status(404).json({ error: "Queue entry not found" });
        res.status(200).json(queue);
    } catch (err) {
        sendError(res, err);
    }
}

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
