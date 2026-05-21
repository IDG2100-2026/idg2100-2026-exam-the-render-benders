import crypto from "node:crypto";

// added secret string (from .env) to every password before hashing
const { HASH_SALT } = process.env;

export function hashPassword(pwd) {
    // combine the password and salt into one string before hashing
    const pwdWithSalt = pwd + HASH_SALT;
    return crypto
        .createHash("md5") // use md5 hashing algorithm
        .update(pwdWithSalt) // feed salted password into the algorithm
        .digest("hex") // output the result as hex string (only 0-9 and a-f)
        .toString(); // convert to string
}