async function register(data){
    // TODO
    // create user with emailVerified: false
    // generate verification code
    // save codeHash + expireAt in EmailVerification
    // send email, or console.log code for now
    // return safe user withour pwd
}

async function login({ username, pwd }, req) {
    // TODO
    // find user
    // compare hashed password
    // optionally block if emailVerified: false
    // create accessToken + refreshToken
    // save refreshTokenHash in user.sessions
    // return user + tokens
}

async function refresh(refreshToken) {
    // TODO
    // verify refresh token
    // find user with matching refreshTokenHash in sessions
    // check session expiresAt
    // return new access token, optionally new refresh token too
}

async function logout(refreshToken) {
    // TODO
    // Remove matching refreshTokenHash from user.sessions
}

async function verifyEmail({ userId, code }) {
    // TODO
    // find EmailVerification by userId + codeHash
    // check expiresAt is still in future
    // set user.emailVerified = true
    // delete used verification code
}

async function resendVerification(email) {
    // TODO
    // Find user by email
    // delete old verification codes for that user
    // create new codeHash + expiresAt
    // send email/code
}

export default {
    register,
    login,
    refresh,
    logout,
    verifyEmail,
    resendVerification
};