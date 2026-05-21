const {
    VITE_API_HOSTNAME,
    VITE_API_PORT,
    VITE_API_PROTOCOL,
    VITE_API_VERSION
} = import.meta.env;

export const API_BASE_URL = `${VITE_API_PROTOCOL}://${VITE_API_HOSTNAME}:${VITE_API_PORT}/api/${VITE_API_VERSION}`;

// Game
export const GAME_ROUNDS = [3, 5, 7];
export const GAME_TIME_PER_ROUND = [3, 10, 30];

// Match
export const MATCH_VISIBILITY = ['public', 'private'];
export const MATCH_STATUS = ['pending', 'ongoing', 'completed'];

// Tournament
export const TOURNAMENT_TYPES = ['knockout', 'arena'];
export const TOURNAMENT_STATUS = ['pending', 'ongoing', 'completed'];

// User
export const USER_TYPE = ['registered', 'anonymous', 'admin'];
export const MIN_AGE = 18;
export const MAX_AGE = 80;

// Comment
export const COMMENT_TYPE = ['match', 'tournament']; 
export const MAX_COMMENT_LENGTH = 1000;


// Home page
export const TOP_GAMES_COUNT = 5;
