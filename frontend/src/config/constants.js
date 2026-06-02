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

// Polling intervals
export const LOBBY_POLL_MS = 10000;
export const TIMEOUT_RETRY_MS = 800;
export const TIMEOUT_FALLBACK_MS = 2000;

// Max rolls per turn: 1 automatic + 2 optional rerolls
export const MAX_ROLLS_PER_TURN = 3;

// User
export const MIN_AGE = 18;
export const MAX_AGE = 100;
export const MAX_BIO_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 1000;

export const HAND_NAMES = {
    8: "Five of a kind",
    7: "Four of a kind",
    6: "Full house",
    5: "Straight",
    4: "Three of a kind",
    3: "Two pair",
    2: "Pair",
    1: "High card"
};

export const FACE_VALUES = ["7", "8", "J", "Q", "K", "A"];