import express from "express";
import cors from 'cors';
import apiV1Router from "./routers/api.v1.router.js";
import { connectDB, disconnectDB } from './config/db.config.js';
import httpStatus from "./utils/statusCodes.js";

// Gets server port from .env
const SERVER_PORT = process.env.SERVER_PORT;

// Connect to MongoDB via an imported function that handles connection logic and error handling
await connectDB();

// Create an Express app
const app = express();

// Middleware
app.use(cors());
// Built-in middleware to parse JSON request bodies
app.use(express.json());
// Middleware to serve static files from the 'uploads' directory when requests are made to '/uploads/*'
app.use('/uploads', express.static('project/uploads'));

// Routes
app.use('/api/v1', apiV1Router);

// A general 404 handler.
// When a route isn't found, this will be the fallback route.
app.use((req, res) => {
    res.status(httpStatus.NOT_FOUND.code).json({
        success: false,
        error: httpStatus.NOT_FOUND.message,
        message: `Route '${req.method} ${req.path}' not found`
    });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR.code).json({
        success: false,
        error: err.message || httpStatus.INTERNAL_SERVER_ERROR.message,
        message: process.env.NODE_ENV === 'development' ? err.stack : 'An error occurred'
    });
});

// Start the server and listen on the specified port
const httpServer = app.listen(SERVER_PORT);
// Log a message when the server starts successfully, including the port number and address information
httpServer.on('listening', () => {
    console.log('Application is listening on port', httpServer.address().port);
    console.log('Application available at:', httpServer.address());
});

// Graceful shutdown function to handle termination signals and clean up resources before exiting
async function gracefulShutdown(){
    console.log('\nThe application is being shut down');
    await disconnectDB();
    httpServer.close(()=>{
        process.exit(0); // Exit with success code after the server has closed and database connection has been terminated
    });
}
// Listen for termination signals (e.g., Ctrl+C) and call the graceful shutdown function when they are received
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);