import mongoose from "mongoose";

// Construct the MongoDB connection URI using .env variables
const { DB_HOST, DB_PORT, DB_NAME, NODE_ENV } = process.env;
const CONN_URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// This module exports two functions: connectDB and disconnectDB.
// connectDB establishes a connection to the MongoDB database using Mongoose, and includes error handling for connection issues.
// disconnectDB disconnects from the MongoDB database when called, which is useful for graceful shutdowns or when the application is terminating.
export async function connectDB(){
    if(DB_HOST && DB_PORT && DB_NAME){ // Check that all required environment variables are present
        mongoose.connection.on("error", err=> {
            console.error('Unhandled Mongoose/MongoDB connection error:', err);
        });
        console.log('Connecting to MongoDB now!', CONN_URI);
        return mongoose.connect(
            // Use the constructed connection URI and options for the Mongoose connection
            CONN_URI,
            {
                appName: DB_NAME + '-' + NODE_ENV,
                maxPoolSize: 50 // Limit the number of concurrent connections in the pool to prevent overloading the DB
            }
        );
    }
    throw new Error(`Missing env variables needed to connect to MongoDB: ${DB_HOST}, ${DB_PORT}, ${DB_NAME}`);
}

export async function disconnectDB(){
    return mongoose.disconnect();
}