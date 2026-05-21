import { apiFetch, API_URL } from "@/api.js";

// get a single user by their id
export async function getUser(uid){
    // getting a single user by their uid
    const result = await apiFetch(`/users/${uid}`);
    return result.userObj;
}

// login - returns the user data if it was successful
export async function loginUser(username, password){
    // sending username and password to backend for verification
    // password is sent in the request, but not stored
    const result = await apiFetch("/users/login", {
        method: "POST",
        // JSON.stringify converts the object to JSON string for the request body
        body: JSON.stringify({ username, password })
    });
    return result.user;
}

// register a new user
export async function createUser(userData){
    // creating a new user account
    const newUser = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(userData) 
    });
    return newUser.newUserId;
}

// update a current user
export async function updateUser(uid, userData){
    // updates a users profiles field (email, about me, password)
    const updatedUser = await apiFetch(`/users/${uid}`, {
        method: "PATCH",
        headers: { "x-user-type": "user" },
        body: JSON.stringify(userData)
    });
    return updatedUser.updatedUser;
}

// getting the last 10 matches for a user
export async function getUserMatches(uid){
    // getting the last 10 matches for a specific user
    const userMatches = await apiFetch(`/users/${uid}/matches`);
    return userMatches.recentMatches;
}

export async function updateProfilePicture(uid, imageFile) {
    // sending a file, so I have to use formData instead of JSON
    const formData = new FormData();
    formData.append("image", imageFile);
    const result = await fetch(`${API_URL}/users/${uid}/image`, {
        method: "PATCH",
        headers: { "x-user-type": "user" },
        body: formData 
    });
    const data = await result.json();
    return data.updatedUser;
}

export async function getUserStats(uid) {
    const result = await apiFetch(`/users/${uid}/stats`);
    return result.stats;
}

export async function createGuestUser() {
    const result = await apiFetch("/users/guest", { method: "POST" });
    return result.user;
}
