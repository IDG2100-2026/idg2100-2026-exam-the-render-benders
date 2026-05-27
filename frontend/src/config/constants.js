// Game variant options - must match backend/config/constants.js
export const GAME_TIME_CONTROLS = [10, 30, 90];
export const GAME_ROUND_COUNTS = [3, 5, 7];
export const GAME_PLAYER_COUNTS = [2, 3, 5];
export const GAME_BUY_INS = [1, 10, 50];
export const GAME_RULES = ["straights-allowed", "no-straights"];
export const RULES_STRAIGHTS = "straights-allowed";
export const RULES_NO_STRAIGHTS = "no-straights";

// ELO
export const DEFAULT_ELO = 1000;
export const MAX_ELO = 3000;

// User
export const MIN_AGE = 18;
export const MAX_AGE = 100;
export const MAX_BIO_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 1000;
