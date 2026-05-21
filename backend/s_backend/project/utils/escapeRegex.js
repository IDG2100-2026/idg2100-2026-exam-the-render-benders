
// This function takes a string as input, then replaces characters that have special meaning in regular expressions with their escaped versions.
// This helps to avoid users injecting regex patterns into search queries, which could lead to unexpected behavior or security issues.
export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');