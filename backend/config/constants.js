// Setup
const { NODE_ENV } = process.env;

// Minimum and maximum length for usernames, in characters
export const MIN_USERNAME_LENGTH = 4;
export const MAX_USERNAME_LENGTH = 64;

// Minimum and maximum length for passwords, in characters
export const MIN_PWD_LENGTH = 8;
export const MAX_PWD_LENGTH = 128;

// Minimum age to register, players must be adults to use the platform
export const MIN_AGE = 18;

// Maximum age to register, prevents absurd birth years
export const MAX_AGE = 100;

// Maximum length for a user bio
export const MAX_BIO_LENGTH = 500;

// Maximum length for a comment body
export const MAX_COMMENT_LENGTH = 1000;

// Default "buy-in" points for users
export const DEFAULT_POINTS = 100;

// Minimum "buy-in" points for users
export const MIN_POINTS = 1;

// Default ELO rating for new users, all players start at the same level
export const DEFAULT_ELO = 1000;

// Maximum ELO a player or desired-ELO field can reach
export const MAX_ELO = 3000;

// Valid time controls in seconds (total per game, not per round)
export const GAME_TIME_CONTROLS = [10, 30, 90];

// Number of players per game
export const GAME_PLAYER_COUNTS = [2, 3, 5];
export const DEFAULT_PLAYER_COUNT = 2;

// Per-player stack
export const PLAYER_STACK_DEFAULT = 0;
export const MIN_PLAYER_STACK_DEFAULT = 0;

// Game buy-ins
export const GAME_BUY_INS = [1, 10, 50];
export const DEFAULT_GAME_BUY_INS = 1;

// Game Pot
export const DEFAULT_POT_VALUE = 0;
export const MIN_POT_VALUE = 0;

// Allowed status values for a game
export const GAME_STATUSES = ["waiting", "ongoing", "finished"];

// Gameplay phases
export const GAME_PHASES = ["waiting", "rolling", "betting", "round-ended", "finished"];

// Bet actions
export const BET_ACTIONS = ["bet", "match", "raise", "fold", "timeout"];

// Default / Minimum Bet value
export const DEFAULT_BET = 0;
export const MIN_BET = 0;

// Allowed Dice faces
export const DICE_FACES = ["7", "8", "J", "Q", "K", "A"];

// Max dice
export const DICE_COUNT = 5;

// Round
export const DEFAULT_ROUND = 1;
export const MIN_ROUND = 1;

// Timeout
export const DEFAULT_TIMEOUT = 0;
export const MIN_TIMEOUT = 0;

// Allowed status values for a tournament
export const TOURNAMENT_STATUSES = ["upcoming", "ongoing", "finished"];

// Allowed status values for a queue entry
export const QUEUE_STATUSES = ["waiting", "matched"];

// Default appearance preferences for new users
export const DEFAULT_THEME = "dark";
export const DEFAULT_BOARD_COLOR = "#3e3e68";
export const DEFAULT_SOUND = true;
export const DEFAULT_LOBBY_COUNT = 5;

// Email verification expiry timer
export const EMAIL_VERIFICATION_EXPIRES_MS = 15 * 60 * 1000;
// Points granted to users who log in after 7 days
export const WEEKLY_POINTS_GAINED = 100;
export const WEEKLY_POINT_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7d

// JWT / Cookie age
export const JWT_ACCESS_MAX_AGE_MS = 15 * 60 * 1000; // 15m
export const JWT_REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7d
export const JWT_REFRESH_ROTATION_GRACE_MS = 5 * 1000; // 5s
export const JWT_ACCESS_EXPIRES_IN_SECONDS = JWT_ACCESS_MAX_AGE_MS / 1000;
export const JWT_REFRESH_EXPIRES_IN_SECONDS = JWT_REFRESH_MAX_AGE_MS / 1000;

export const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    maxAge: JWT_ACCESS_MAX_AGE_MS
};

export const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    maxAge: JWT_REFRESH_MAX_AGE_MS
};

// Rate limiter
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = 1000;

// Delay in ms before advancing to the next round after round-ended
export const ROUND_END_DELAY_MS = 3000;
