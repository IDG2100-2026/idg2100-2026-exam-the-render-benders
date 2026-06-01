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

// allows game.service.js to emit events without a circular import
export function getIO() { return _io; }

export function initializeGameSocket(httpServer) {
    // attaching Socket.IO to the existing Express server
    const io = new Server(httpServer, {
        cors: {
            // allowing connections from the frontend dev server
            origin: FRONTEND_URL,
            // allowing cookies to be sent with the connection
            credentials: true
        }
    });
    _io = io;

    // middleware that runs before every socket connection is established
    // authenticating the user the same way auth.middleware.js does for HTTP
    io.use((socket, next) => {
        // cookies are sent as a single string, so we split and find the accessToken
        const token = socket.handshake.headers.cookie
            // splitting the accessToken from the refreshToken (separated by ;)
            ?.split("; ")
            .find(cookie => cookie.startsWith("accessToken"))
            // getting the token value (after =)
            ?.split("=")[1];
        
        if (!token) {
            socket.user = { type: "anonymous", id: null };
            return next();
        }

        try {
            const payload = jwt.verify(token, JWT_ACCESS_SECRET);
            // attaching the decoded user info to the socket so all event handlers below can access 
                // it via socket.user
            socket.user = {
                id: payload.id,
                username: payload.username,
                type: payload.type,
                isAdmin: payload.isAdmin 
            };
        } catch {
            // if the token is invalid/old then set the user as anonymous
            socket.user = { type: "anonymous", id: null };
        }
        next();
    });

    // runs once for every client that connects
    io.on("connection", (socket) => {

        socket.on("join-room", async ({ gid }) => {
            try {
                const game = await Game.findById(gid);
                // if the game does not exist, send an error back to the client
                if (!game) return socket.emit("error", { message: "Game not found" });

                // adding this socket to the game room - all players and spectators in the same room
                socket.join(gid);

                // sending the current game state only to this client 
                socket.emit("game-state", sanitizeGameForViewer(game, socket.user?.id));
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        // player places a bet
        socket.on("bet", async ({ gid, amount }) => {
            if (!socket.user?.id) return socket.emit("error", { message: "Authentication required" });
            try {
                const game = await gameService.placeBet(gid, socket.user.id,{ action: "bet", amount});
                if (!game) return socket.emit("error", { message: "Game not found" });
                // emitting the updated state to everyone in the room
                await emitPersonalizedState(io, gid, game);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        // player matches the current bet
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

        // player raises the bet
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

        // player folds
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

        // player leaves the game before it has started
        socket.on("leave-before-start", async ({ gid }) => {
            if (!socket.user?.id) return socket.emit("error", { message: "Authentication required" });
            try {
                const game = await gameService.leaveGame(gid, socket.user.id);
                if (!game) return socket.emit("error", { message: "Game not found" });

                // removing the socket from the room
                socket.leave(gid);

                // if the last player left, the game is deleted & notifying the room
                if (game.deleted) return io.to(gid).emit("game-deleted", { gid });

                await emitPersonalizedState(io, gid, game);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        // Player timeout
        socket.on("timeout", async ({ gid }) => {
            try {
                const game = await gameService.handleTimeout(gid);
                if (!game) return socket.emit("error", { message: "Game not found" });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        // fires when a client disconnects (closes tab, looses connection etc.)
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
