import crypto from "node:crypto";

const { APP_SALT: salt } = process.env;

export function hashPwd(pwd) {
    return crypto.createHash("md5").update(pwd + salt).digest("hex").toString();
}
