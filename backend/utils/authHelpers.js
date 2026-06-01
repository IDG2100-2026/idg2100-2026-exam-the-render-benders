export function idsMatch(a, b) {
    if (!a || !b) return false;
    return a.toString() === b.toString();
}

export function isOwnerOrAdmin(ownerId, user) {
    return user?.type === "admin" || idsMatch(ownerId, user?.id);
}