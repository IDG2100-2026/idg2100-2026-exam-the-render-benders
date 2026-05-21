import activityService from "../services/activity.service.js";

// Returns platform activity stats as JSON
export async function getActivity(req, res) {
    try {
        const activity = await activityService.getActivity();
        res.status(200).json(activity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export default { getActivity };
