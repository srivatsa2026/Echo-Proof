
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null;

export function connectSocket(username: string) {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:5050", {
            transports: ["websocket", "polling"],
            autoConnect: false,
            auth: { username },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
            timeout: 10000,
            forceNew: true,
        });
        socket.connect();
    }
    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}