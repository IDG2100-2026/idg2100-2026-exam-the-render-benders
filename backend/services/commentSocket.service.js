import WebSocketServer from "ws";

const rooms = new Map();

function getRoomKey({ game, tournament }) {
    if (game) return `game:${game.toString()}`;
    if (tournament) return `tournament:${tournament.toString()}`;
    return null;
}

function joinRoom(ws, roomKey) {
    if (!rooms.has(roomKey)) {
        rooms.set(roomKey, new Set());
    }

    rooms.get(roomKey).add(ws);
    ws.rooms.add(roomKey);
}

function leaveAllRooms(ws){
    for (const roomKey of ws.rooms) {
        const room = rooms.get(roomKey);
        if (!room) continue;

        room.delete(ws);

        if (room.size === 0) {
            rooms.delete(roomKey);
        }
    }

    ws.rooms.clear();
}

function sendJson(ws, payload) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(payload));
    }
}

export function broadcastToCommentRoom(comment, payload) {
    const roomKey = getRoomKey(comment);
    if (!roomKey) return;

    const room = rooms.get(roomKey);
    if(!room) return;

    for (const ws of room) {
        sendJson(ws, payload);
    }
}

export function setupCommentSockets(httpServer) {
    const wss = new WebSocketServer({
        server: httpServer,
        path: "/ws/comments"
    });

    wss.on("connection", (ws) => {
        ws.rooms = new Set();

        ws.on("message", (rawMessage) => {
            let message;

            try {
                message = JSON.parse(rawMessage);
            } catch {
                sendJson(ws, {
                    type: "error",
                    errir: "Invalid JSON message"
                });
                return;
            }

            if (message.type === "join-comment-room") {
                const roomKey = getRoomKey({
                    game: message.game,
                    tournament: message.tournament
                });

                if (!roomKey) {
                    sendJson(ws, {
                        type: "error",
                        error: "Missing game or tournament id"
                    });
                    return;
                }

                joinRoom(ws, roomKey);

                sendJson(ws, {
                    type: "joined-comment-room",
                    room: roomKey
                });
            }

            if (message.type === "leave-comment-rooms") {
                leaveAllRooms(ws);

                sendJson(ws, {
                    type: "left-comment-rooms"
                });
            }
        });

        ws.on("close", () => {
            leaveAllRooms(ws);
        });
    });
}