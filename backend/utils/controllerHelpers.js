export function sendError(res, err, status = 500) {
    return res.status(status).json({ error: err.message });
}

export function statusFromMessage(message, rules, fallback = 500) {
    const match = rules.find(rule => message.includes(rule.text));
    return match?.status ?? fallback;
}