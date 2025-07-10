
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null;

export function getSocket(username: string, walletAddress?: string) {
    // If no socket or socket is disconnected, create a new one
    if (!socket || socket.disconnected) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:5050", {
            transports: ["websocket", "polling"],
            autoConnect: true,
            auth: { username, walletAddress },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
            timeout: 10000,
            forceNew: true,
        });
    }
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}