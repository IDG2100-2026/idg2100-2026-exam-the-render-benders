import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Game } from "../models/game.model.js";
import gameService from "../services/game.service.js";
import { sanitizeGameForViewer } from "../utils/gameHelpers.js";

const {
    FRONTEND_URL,
    JWT_ACCESS_SECRET
} = process.env;

let _io = null;

export function getIO() { return _io; }

export function initializeGameSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {  
            origin: FRONTEND_URL,
            credentials: true
        }
    });
    _io = io;

    io.use((socket, next) => {
        const token = socket.handshake.headers.cookie
            ?.split("; ")
            .find(cookie => cookie.startsWith("accessToken"))
            ?.split("=")[1];
        
        if (!token) {
            socket.user = { type: "anonymous", id: null };
            return next();
        }

        try {
            const payload = jwt.verify(token, JWT_ACCESS_SECRET);
            socket.user = {
                id: payload.id,
                username: payload.username,
                type: payload.type,
                isAdmin: payload.isAdmin 
            };
        } catch {
            socket.user = { type: "anonymous", id: null };
        }
        next();
    });

    io.on("connection", (socket) => {

        socket.on("join-room", async ({ gid }) => {
            try {
                const game = await Game.findById(gid)
                    .populate("players", "username")
                    .populate("result.winner", "username");
                if (!game) return socket.emit("error", { message: "Game not found" });

                socket.join(gid);

                socket.emit("game-state", sanitizeGameForViewer(game, socket.user?.id));
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("bet", async ({ gid, amount }) => {
            if (!socket.user?.id) return socket.emit("error", { message: "Authentication required" });
            try {
                const game = await gameService.placeBet(gid, socket.user.id,{ action: "bet", amount});
                if (!game) return socket.emit("error", { message: "Game not found" });
                await emitPersonalizedState(io, gid, game);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("match", async ({ gid }) => {
            if (!socket.user?.id) return socket.emit("error", { message: "Authentication required" });
            try {
                const game = await gameService.placeBet(gid, socket.user.id, { action: "match" });
                if (!game) return socket.emit("error", { message: "Game not found" });
                await emitPersonalizedState(io, gid, game);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("raise", async ({ gid, amount }) => {
            if (!socket.user?.id) return socket.emit("error", { message: "Authentication required" });
            try {
                const game = await gameService.placeBet(gid, socket.user.id, { action: "raise", amount });
                if (!game) return socket.emit("error", { message: "Game not found" });
                await emitPersonalizedState(io, gid, game);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("fold", async ({ gid }) => {
            if (!socket.user?.id) return socket.emit("error", { message: "Authentication required" });
            try {
                const game = await gameService.placeBet(gid, socket.user.id, { action: "fold" });
                if (!game) return socket.emit("error", { message: "Game not found" });
                await emitPersonalizedState(io, gid, game);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("leave-before-start", async ({ gid }) => {
            if (!socket.user?.id) return socket.emit("error", { message: "Authentication required" });
            try {
                const game = await gameService.leaveGame(gid, socket.user.id);
                if (!game) return socket.emit("error", { message: "Game not found" });

                socket.leave(gid);

                if (game.deleted) return io.to(gid).emit("game-deleted", { gid });

                await emitPersonalizedState(io, gid, game);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("timeout", async ({ gid }) => {
            try {
                const game = await gameService.handleTimeout(gid);
                if (!game) return socket.emit("error", { message: "Game not found" });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("disconnect", () => {});
    });

    return io;
}

async function emitPersonalizedState(io, gid, game) {
    const sockets = await io.in(gid).fetchSockets();
    for (const s of sockets) {
        s.emit("game-state", sanitizeGameForViewer(game, s.user?.id));
    }
}
