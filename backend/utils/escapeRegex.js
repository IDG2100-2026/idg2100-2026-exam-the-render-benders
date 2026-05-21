// Escapes special regex characters in a string to prevent injection via user input
export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
