import mongoose from "mongoose";

// destructuring the environment variables I need to connect to MongoDB
const { DB_HOSTNAME, DB_PORT, DB_NAME, NODE_ENV } = process.env;

// creating a connection url from the environemnt variables
const CONNECTION_URL = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

// connecting mongoose to the MongoDB database
export async function connectDB() {
    // checking if all environment variables are there before connecting
    if (DB_HOSTNAME && DB_PORT && DB_NAME) {
        // checking for connection errors from mongoose
        mongoose.connection.on("error", error=>{
            console.error("There was an error connecting to MongoDB.", error);
        });
        console.log("Connecting to MongoDB...", CONNECTION_URL);
        // connecting to MongoDB with the connection URL and app name
        return mongoose.connect(
            CONNECTION_URL,
            {
                // appName is used to find it in the MongoDB logs
                appName: DB_NAME + " " + NODE_ENV
            }
        )
    }
    // error if any environment variables are missing
    throw new Error(`Missing environment variables! They are needed to connect to MongoDB (${DB_HOSTNAME} & ${DB_PORT} & ${DB_NAME}).`);
}

// creating the function that disconnects mongoose from the MongoDB database
export async function disconnectDB() {
    return mongoose.disconnect();
}
