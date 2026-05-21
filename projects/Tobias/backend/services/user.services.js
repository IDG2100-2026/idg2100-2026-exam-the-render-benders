import { User } from "../models/users.js";
import { hashPassword } from "../utils/hash.js";

export async function checkIfUsernameExists(username) {
    // checks if there is a user with this username already in the db
    const exists = await User.exists({ username });
    if (!exists){
        // username is available
        return true;
    } else {
        // throws error which express-validator catches and marks as invalid
        throw new Error(`The ${username} is already taken`)
    }
}

export async function checkIfEmailExists(email){
    // checks if a user with the email already exists in the db
    const exists = await User.exists({ email });
    if (!exists){
        // available
        return true;
    } else {
        // throws error if not
        throw new Error(`The email ${email} is already in use`);
    }
}

export async function getAllUsers(limit, skip, filter, sort){
    // fetches users from the database
    // limit controls how many users to return and skip controls how many to skip (for paging)
    // filter limits which users to return (example: only banned users)
    // sort controls the order (example: by eloRating)
    return await User.find(filter).sort(sort).limit(limit).skip(skip);
}

export async function getUser(uid){
    // finds a single user by their uid
    return await User.findOne({ uid });
}

export async function createUser(userObj){
    // creates a new User
    const user = new User(userObj);
    // and saves it to the database
    const savedUser = await user.save();
    // returns the auto-generated uid of the new user
    return savedUser.uid;
}

export async function updateUser(uid, updates){
    // finds users by uid and updates only the specified fields
    return await User.findOneAndUpdate(
        { uid }, // find user with the specific uid
        updates, // the fields that will be updated
        { new: true } // returning the updated version
    );
}

export async function checkUserExistence(uid) {
    // checks if a user with the uid exists in the db
    const exists = await User.exists({ uid });
    if (exists){
        // user found, validation passes
        return true;
    } else {
        // error if the user does not exist
        throw new Error(`The user with id ${uid} does not exist`);
    }
}

export async function loginUser(username, pwd){
    // find the user by username 
    const user = await User.findOne({ username });
    if (!user) return null;

    // hashing the incoming password and comparing it with the stored hash
    if (hashPassword(pwd) !== user.pwd) return null;

    // returning the user if the login is successful
    return user;
}

export async function createGuestUser() {
    const guestNum = Math.floor(Math.random() * 100000);
    const guest = new User({
        username: `Guest_${guestNum}`,
        age: 18,
        email: `guest_${guestNum}_${Date.now()}@guest.local`,
        pwd: Math.random().toString(36),
        isGuest: true
    });
    return await guest.save();
}

export default {
    checkIfUsernameExists,
    checkIfEmailExists,
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    checkUserExistence,
    loginUser,
    createGuestUser
}