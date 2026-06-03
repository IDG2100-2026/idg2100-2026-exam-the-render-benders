import mongoose from "mongoose";

const { DB_HOSTNAME, DB_PORT, DB_NAME, NODE_ENV } = process.env;

const CONNECTION_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

export async function connectDB() {
    if (DB_HOSTNAME && DB_PORT && DB_NAME) {
        mongoose.connection.on("error", (err) => {
            console.log("Connection error on Mongoose/MongoDB", err);
        });
        console.log("Connection to MongoDB...", CONNECTION_URI);
        return mongoose.connect(CONNECTION_URI, {
            appName: DB_NAME + "-" + NODE_ENV,
        
            maxPoolSize: 50
        });
    }
    throw new Error(`Missing env variables needed to connect to mongoDB: ${DB_HOSTNAME}, ${DB_PORT}, ${DB_NAME}`);
}

export async function disconnectDB() {
    return mongoose.disconnect();
}
