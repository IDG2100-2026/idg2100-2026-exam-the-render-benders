import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { connectDB, disconnectDB } from "./config/db.js";
import { setUserType } from "./middleware/auth.middleware.js";
import { setupCommentSockets } from "./socket/comment.socket.js"; 
import { initializeGameSocket } from "./socket/game.socket.js";

// Import Routers
import userRouter from "./routers/user.router.js";
import sessionRouter from "./routers/session.router.js";
import gameRouter from "./routers/game.router.js";
import tournamentRouter from "./routers/tournament.router.js";
import commentRouter from "./routers/comment.router.js";
import queueRouter from "./routers/queue.router.js";
import activityRouter from "./routers/activity.router.js";
import trophyRouter from "./routers/trophy.router.js";
import gameCategoryRouter from "./routers/gameCategory.router.js";
import authRouter from "./routers/auth.router.js";

// Connects to MongoDB via Mongoose 
await connectDB();

// Creates an Express app
const app = express();

// Rate Limiter - max 100 requests per IP per 15 minutes 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-8",
  message: { error: "Too many requests, please try again later." } // return JSON
});

// Allow requests from frontend (CORS)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Apply rate limiter to all routes 
app.use(limiter);

// Middleware, runs on every request before reaching the endpoints
app.use(express.json());
app.use(cookieParser());
app.use(setUserType);

// Serve uploads directory (path relative to project root since we run from there)
app.use("/uploads", express.static("backend/uploads"));

// Register routers
app.use("/api/v1", userRouter);
app.use("/api/v1", sessionRouter);
app.use("/api/v1", gameRouter);
app.use("/api/v1", tournamentRouter);
app.use("/api/v1", commentRouter);
app.use("/api/v1", queueRouter);
app.use("/api/v1", activityRouter);
app.use("/api/v1", trophyRouter);
app.use("/api/v1", gameCategoryRouter);
app.use("/api/v1/auth", authRouter);

// Listens on a port
const httpServer = app.listen(process.env.APP_PORT);

setupCommentSockets(httpServer);

// initializing Socket.IO and attaching it to the HTTP server so WebSocket
    // connections can be handled
initializeGameSocket(httpServer);

httpServer.on("listening", () =>
  console.log(
    "Our Poker Backend is listening on port",
    httpServer.address().port
  )
);

// Graceful shutdown
let shuttingDown = false;
async function gracefulShutDown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("\nThe Poker Backend application is being shut down...");
  await disconnectDB();
  httpServer.close(() => process.exit(0));
}

process.on("SIGTERM", gracefulShutDown);
process.on("SIGINT", gracefulShutDown);