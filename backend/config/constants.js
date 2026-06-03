const { NODE_ENV } = process.env;

export const MIN_USERNAME_LENGTH = 4;
export const MAX_USERNAME_LENGTH = 64;

export const MIN_PWD_LENGTH = 8;
export const MAX_PWD_LENGTH = 128;

export const MIN_AGE = 18;

export const MAX_AGE = 100;

export const MAX_BIO_LENGTH = 500;

export const MAX_COMMENT_LENGTH = 200;

export const DEFAULT_POINTS = 100;

export const MIN_POINTS = 1;

export const DEFAULT_ELO = 1000;

export const MAX_ELO = 3000;

export const GAME_TIME_CONTROLS = [10, 30, 90];

export const GAME_PLAYER_COUNTS = [2, 3, 5];
export const DEFAULT_PLAYER_COUNT = 2;

export const PLAYER_STACK_DEFAULT = 0;
export const MIN_PLAYER_STACK_DEFAULT = 0;

export const GAME_BUY_INS = [1, 10, 50];
export const DEFAULT_GAME_BUY_INS = 1;

export const DEFAULT_POT_VALUE = 0;
export const MIN_POT_VALUE = 0;

export const GAME_STATUSES = ["waiting", "ongoing", "finished"];

export const GAME_PHASES = ["waiting", "rolling", "betting", "round-ended", "finished"];

export const BET_ACTIONS = ["bet", "match", "raise", "fold", "check", "timeout"];

export const DEFAULT_BET = 0;
export const MIN_BET = 0;

export const DICE_FACES = ["7", "8", "J", "Q", "K", "A"];

export const DICE_COUNT = 5;

export const MAX_ROLLS_PER_TURN = 3;

export const DEFAULT_ROUND = 1;
export const MIN_ROUND = 1;

export const DEFAULT_TIMEOUT = 0;
export const MIN_TIMEOUT = 0;

export const TOURNAMENT_STATUSES = ["upcoming", "ongoing", "finished"];

export const QUEUE_STATUSES = ["waiting", "matched"];

export const DEFAULT_THEME = "dark";
export const DEFAULT_BOARD_COLOR = "#3e3e68";
export const DEFAULT_SOUND = true;
export const DEFAULT_LOBBY_COUNT = 5;

export const EMAIL_VERIFICATION_EXPIRES_MS = 15 * 60 * 1000;

export const WEEKLY_POINTS_GAINED = 100;
export const WEEKLY_POINT_INTERVAL = 7 * 24 * 60 * 60 * 1000; 

export const JWT_ACCESS_MAX_AGE_MS = 15 * 60 * 1000; 
export const JWT_REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; 
export const JWT_REFRESH_ROTATION_GRACE_MS = 5 * 1000; 
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

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; 
export const RATE_LIMIT_MAX = 1000;

export const ROUND_END_DELAY_MS = 6000;

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const USER_UPDATABLE_FIELDS = ["email", "pwd", "aboutMe", "profileImage", "dateOfBirth"];
