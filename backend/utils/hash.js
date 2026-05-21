import crypto from "node:crypto";

const { APP_SALT: salt } = process.env;

// Hashes a password by combining it with a salt and running it through MD5.
// The salt makes sure two users with the same password get different hashes.
export function hashPwd(pwd) {
    return crypto.createHash("md5").update(pwd + salt).digest("hex").toString();
}
