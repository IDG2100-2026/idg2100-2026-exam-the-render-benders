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

// Default ELO rating for new users, all players start at the same level
export const DEFAULT_ELO = 1000;

// Maximum ELO a player or desired-ELO field can reach
export const MAX_ELO = 3000;

// Valid time controls in seconds (total per game, not per round)
export const GAME_TIME_CONTROLS = [10, 30, 90];

// Allowed status values for a game
export const GAME_STATUSES = ["waiting", "ongoing", "finished"];

// Allowed status values for a tournament
export const TOURNAMENT_STATUSES = ["upcoming", "ongoing", "finished"];

// Allowed status values for a queue entry
export const QUEUE_STATUSES = ["waiting", "matched"];

// Default appearance preferences for new users
export const DEFAULT_THEME = "dark";
export const DEFAULT_BOARD_COLOR = "#3e3e68";
export const DEFAULT_SOUND = true;
export const DEFAULT_LOBBY_COUNT = 5;
