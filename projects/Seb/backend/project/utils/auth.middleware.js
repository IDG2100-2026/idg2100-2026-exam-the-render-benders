import httpStatus from './statusCodes.js';

const VALID_USER_TYPES = ['anonymous', 'registered', 'admin'];

/**
 * Attaches user identity to req.user based on request headers.
 *
 * Expected headers:
 *   X-User-Type : 'anonymous' | 'registered' | 'admin'  (defaults to 'anonymous')
 *   X-User-Id   : the user's _id string (required for registered / admin)
 */
export function attachUser(req, res, next) {
    const userType = req.headers['x-user-type'] || 'anonymous';
    const userId   = req.headers['x-user-id']   || null;

    if (!VALID_USER_TYPES.includes(userType)) {
        return res.status(httpStatus.BAD_REQUEST.code).json({
            success: false,
            error: httpStatus.BAD_REQUEST.message,
            message: `Invalid X-User-Type header. Must be one of: ${VALID_USER_TYPES.join(', ')}` 
        });
    }

    req.user = { userType, userId };
    next();
}

// Middleware: requires the caller to have at least one of the given roles.
// Usage: requireRole('admin')  or  requireRole('registered', 'admin')
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            // attachUser must run first
            return res.status(httpStatus.UNAUTHORIZED.code).json({
                success: false,
                error: httpStatus.UNAUTHORIZED.message,
                message: 'Authentication required'
            });
        }
        // Check if user's role is in the allowed roles
        if (!roles.includes(req.user.userType)) {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: `This action requires one of the following roles: ${roles.join(', ')}`
            });
        }

        next();
    };
}

export default { attachUser, requireRole };