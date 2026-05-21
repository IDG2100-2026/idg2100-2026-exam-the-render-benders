import express from "express";
import apiV1Router from "./routers/api.v1.router.js";
import { connectDB, disconnectDB } from "./config/db.config.js";
import { setUserType } from "./middleware/auth.js";
// from here: https://www.npmjs.com/package/express-rate-limit
import { rateLimit } from "express-rate-limit";
import cors from "cors";

// connecting mongoose to mongoDB
await connectDB();

// creating the Express app
const SpanishDicePokerApp = express();

// middleware - allowing express to parse JSON so req.body works
SpanishDicePokerApp.use(express.json());
// serving uploaded files (profile pictures) from the uploads/ folder
SpanishDicePokerApp.use("/uploads", express.static("uploads"));
// CORS middleware
SpanishDicePokerApp.use(cors({ origin: "http://localhost:5173" }));
// setting user type based on the x-user-type header
SpanishDicePokerApp.use(setUserType);

// from here: https://www.npmjs.com/package/express-rate-limit
// limit each IP to 100 requests per 15 minutes to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000 // max requests per 15 minutes
});
SpanishDicePokerApp.use(limiter);

// mounting route
SpanishDicePokerApp.use("/api/v1", apiV1Router);

// listening on port 
const httpServer = SpanishDicePokerApp.listen(process.env.BACKEND_PORT);

httpServer.on("listening", () => console.log("Server running on port: ", httpServer.address().port ));

// creating the graceful shutdown 
async function gracefulShutDown() {
    console.log("Shutting down the app...");
    await disconnectDB();
    httpServer.close(async ()=>{
        // node.js process to exit without error
        process.exit(0);
    })
}

// shutting down gracefully
process.on("SIGINT", gracefulShutDown);
process.on("SIGTERM", gracefulShutDown);


