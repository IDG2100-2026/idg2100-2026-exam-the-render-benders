import { Trophy } from "../models/trophy.model.js";
import { sendError } from "../utils/controllerHelpers.js";

export async function getAllTrophies(req, res) {
    try {
        const trophies = await Trophy.find().populate("tournament", "name").sort({ createdAt: -1 });
        res.status(200).json(trophies);
    } catch (err) {
        sendError(res, err);
    }
}

export async function getTrophy(req, res) {
    try {
        const trophy = await Trophy.findById(req.params.tid).populate("tournament", "name");
        if (!trophy) return res.status(404).json({ error: "Trophy not found" });
        res.status(200).json(trophy);
    } catch (err) {
        sendError(res, err);
    }
}

export async function createTrophy(req, res) {
    try {
        const data = { ...req.body };
        if (req.file) data.image = req.file.filename;
        const trophy = await Trophy.create(data);
        res.status(201).json(trophy);
    } catch (err) {
        sendError(res, err);
    }
}

export async function deleteTrophy(req, res) {
    try {
        const trophy = await Trophy.findByIdAndDelete(req.params.tid);
        if (!trophy) return res.status(404).json({ error: "Trophy not found" });
        res.status(200).json(trophy);
    } catch (err) {
        sendError(res, err);
    }
}

export default { getAllTrophies, getTrophy, createTrophy, deleteTrophy };
