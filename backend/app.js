import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { connectDB, disconnectDB } from "./config/db.js";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from "./config/constants.js";
import { setUserType } from "./middleware/auth.middleware.js";
import { setupCommentSockets } from "./socket/comment.socket.js";
import { initializeGameSocket } from "./socket/game.socket.js";
import { User } from "./models/user.model.js";


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

await connectDB();

await User.syncIndexes();

const app = express();

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  message: { error: "Too many requests, please try again later." }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(limiter);

app.use(express.json());
app.use(cookieParser());
app.use(setUserType);

app.use("/uploads", express.static("backend/uploads"));

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

const httpServer = app.listen(process.env.APP_PORT);

setupCommentSockets(httpServer);

initializeGameSocket(httpServer);

httpServer.on("listening", () =>
  console.log(
    "Our Poker Backend is listening on port",
    httpServer.address().port
  )
);

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