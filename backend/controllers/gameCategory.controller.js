import { GameCategory } from "../models/gameCategory.model.js";

export async function getAllGameCategories(req, res) {
    try {
        const categories = await GameCategory.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getGameCategory(req, res) {
    try {
        const category = await GameCategory.findById(req.params.gcid);
        if (!category) return res.status(404).json({ error: "Game category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function createGameCategory(req, res) {
    try {
        const existing = await GameCategory.findOne({ name: req.body.name });
        if (existing) return res.status(409).json({ error: "A category with that name already exists" });
        const category = await GameCategory.create(req.body);
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateGameCategory(req, res) {
    try {
        if (req.body.name) {
            const existing = await GameCategory.findOne({ name: req.body.name });
            if (existing && existing._id.toString() !== req.params.gcid) {
                return res.status(409).json({ error: "A category with that name already exists" });
            }
        }
        const category = await GameCategory.findByIdAndUpdate(req.params.gcid, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ error: "Game category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteGameCategory(req, res) {
    try {
        const category = await GameCategory.findByIdAndDelete(req.params.gcid);
        if (!category) return res.status(404).json({ error: "Game category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getGameCategoryByName(req, res) {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ error: "name query parameter is required" });
        const category = await GameCategory.findOne({ name });
        if (!category) return res.status(404).json({ error: "Game category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export default { getAllGameCategories, getGameCategory, createGameCategory, updateGameCategory, deleteGameCategory, getGameCategoryByName };
