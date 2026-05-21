import activityServices from "../services/activity.services.js";

// "/activity"
export async function getPlatformActivity(req, res){
    const activity = await activityServices.getPlatformActivity();
    res.json({ activity });
}

export default { getPlatformActivity };
