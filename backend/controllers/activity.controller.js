import activityService from "../services/activity.service.js";
import { sendError } from "../utils/controllerHelpers.js";

// Returns platform activity stats as JSON
export async function getActivity(req, res) {
    try {
        const activity = await activityService.getActivity();
        res.status(200).json(activity);
    } catch (err) {
        sendError(res, err);
    }
}

export default { getActivity };
