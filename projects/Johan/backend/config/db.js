import mongoose from "mongoose";

// Get the database connection settings from the .env file so we don't hardcode sensitive info
const { DB_HOSTNAME, DB_PORT, DB_NAME, NODE_ENV } = process.env;

// Build the MongoDB connection string using the variables above
const CONNECTION_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

// Connects to MongoDB using Mongoose, checks for: DB_HOSTNAME, DB_PORT and DB_NAME are in .env, else it throws an error.
export async function connectDB() {
    if (DB_HOSTNAME && DB_PORT && DB_NAME) {
        mongoose.connection.on("error", (err) => {
            console.log("Connection error on Mongoose/MongoDB", err);
        });
        console.log("Connection to MongoDB...", CONNECTION_URI);
        return mongoose.connect(CONNECTION_URI, {
            appName: DB_NAME + "-" + NODE_ENV,

            // How many requests to MongoDB that can be queued at the same time
            maxPoolSize: 50
        });
    }
    throw new Error(`Missing env variables needed to connect to mongoDB: ${DB_HOSTNAME}, ${DB_PORT}, ${DB_NAME}`);
}

// Disconnects from MongoDB, called on gracefulShutdown()
export async function disconnectDB() {
    return mongoose.disconnect();
}
