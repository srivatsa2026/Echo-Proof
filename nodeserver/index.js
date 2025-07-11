const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { ethers, JsonRpcProvider } = require('ethers');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Hardcoded ABIs for common token standards
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
];

const ERC721_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
];

// Configure logging
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

// Create Express app
const app = express();
const server = createServer(app);



const allowedOrigins = [
    "https://echo-proof.vercel.app", // production
    "http://localhost:3000"          // dev
];

// Configure CORS
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
}));

// Add middleware to parse JSON
app.use(express.json());

// Create Socket.IO server with more explicit configuration

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true, // backward compat if needed
    transports: ["websocket", "polling"]
});

// In-memory storage
const rooms = {};
const users = {};
const roomMessages = {};

// Database connection using Neon serverless
const sql = neon(process.env.DATABASE_URL);

// Test database connection
async function testDatabaseConnection() {
    try {
        const result = await sql`SELECT version()`;
        logger.info('Database connected successfully:', result[0].version);
    } catch (error) {
        logger.error('Error connecting to database:', error);
    }
}

// Test the connection on startup
testDatabaseConnection();

// Connect to the Ethereum network using Alchemy Sepolia
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_SEPOLIA_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const provider = new JsonRpcProvider(ALCHEMY_SEPOLIA_URL);



// Helper function to get room participants
function getRoomParticipants(roomId) {
    const participants = [];
    if (rooms[roomId]) {
        for (const uid of rooms[roomId]) {
            if (users[uid]) {
                participants.push({
                    id: uid,
                    name: users[uid].name,
                    status: users[uid].status,
                    isCurrentUser: false
                });
            }
        }
    }
    return participants;
}

// Add connection event logging
io.engine.on("connection_error", (err) => {
    logger.error("Socket.IO connection error:", err.req);
    logger.error("Error code:", err.code);
    logger.error("Error message:", err.message);
    logger.error("Error context:", err.context);
});

// Socket.IO event handlers
io.on('connection', (socket) => {
    const userId = socket.id;
    logger.info(`🔌 Client connected: ${userId}`);
    logger.info(`🔌 Total connected clients: ${io.engine.clientsCount}`);

    // Get username and walletAddress from handshake auth
    const handshakeUsername = socket.handshake.auth && socket.handshake.auth.username;
    const handshakeWalletAddress = socket.handshake.auth && socket.handshake.auth.walletAddress;
    const username = handshakeUsername && typeof handshakeUsername === 'string' && handshakeUsername.trim() !== ''
        ? handshakeUsername.trim()
        : `User-${uuidv4().substring(0, 8)}`;

    // Generate a unique user ID and store user info
    users[userId] = {
        sid: userId,
        name: username,
        rooms: [],
        status: 'online',
        walletAddress: handshakeWalletAddress || null
    };

    // Send connection confirmation
    socket.emit('connection_status', {
        status: 'connected',
        message: 'Connected to the chat server. You can now join a room.',
        userId: userId,
        serverTime: new Date().toISOString()
    });

    logger.info(`✅ User ${userId} registered successfully`);

    // Handle client disconnection
    socket.on('disconnect', (reason) => {
        logger.info(`🔌 Client disconnected: ${userId}, reason: ${reason}`);
        logger.info(`🔌 Total connected clients: ${io.engine.clientsCount}`);

        // Remove user from all rooms they were in
        if (users[userId]) {
            for (const roomId of users[userId].rooms) {
                if (rooms[roomId] && rooms[roomId].includes(userId)) {
                    rooms[roomId] = rooms[roomId].filter(id => id !== userId);

                    // Get updated participants
                    const participants = getRoomParticipants(roomId);

                    // Notify others in the room
                    socket.to(roomId).emit('user_left', {
                        message: `${users[userId].name} has left the room.`,
                        userId: userId,
                        username: users[userId].name,
                        participants: participants
                    });
                }
            }

            // Remove user from users dictionary
            delete users[userId];
        }
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
        logger.error(`Connection error for ${userId}:`, error);
    });

    // Handle ping/pong for connection testing
    socket.on('ping', () => {
        logger.info(`📡 Ping received from ${userId}`);
        socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle joining a room
    socket.on('join', async (data) => {
        logger.info(`📥 Join request received from ${userId}:`, data);

        const roomId = data.room;
        const userName = data.username || users[userId]?.name || 'Unknown User';
        const userWallet = users[userId]?.walletAddress;
        logger.info(`the wallet address (from handshake) is ${userWallet}`);

        if (!roomId) {
            socket.emit('error', { message: 'Room ID is required.' });
            return;
        }

        logger.info(`User ${userId} (${userName}) attempting to join room: ${roomId}`);

        // Fetch room details from the database
        let roomDetails = null;
        try {
            const result = await sql`
                SELECT * FROM chatrooms WHERE id = ${roomId}
            `;
            if (result && result.length > 0) {
                roomDetails = result[0];
            }
        } catch (error) {
            logger.error(`❌ Error fetching room details: ${error.message}`);
            socket.emit('error', { message: 'Error fetching room details.' });
            return;
        }

        if (!roomDetails) {
            socket.emit('error', { message: 'Room does not exist.' });
            return;
        }

        if (!roomDetails.tokenGated) {
            // Not token gated, proceed as before
            // Update user info
            if (users[userId]) {
                users[userId].name = userName;
                users[userId].status = 'online';
                if (!users[userId].rooms.includes(roomId)) {
                    users[userId].rooms.push(roomId);
                }
            }

            // Join the room
            socket.join(roomId);

            // Track the participants in the room
            if (!rooms[roomId]) {
                rooms[roomId] = [];
            }
            if (!rooms[roomId].includes(userId)) {
                rooms[roomId].push(userId);
            }

            // Create room history if it doesn't exist
            if (!roomMessages[roomId]) {
                roomMessages[roomId] = [];
            }

            // Get current participants
            const participants = getRoomParticipants(roomId);

            // Send a join confirmation to the user who joined
            socket.emit('join_success', {
                message: `You have joined the room: ${roomId}`,
                roomId: roomId,
                participants: participants,
                history: roomMessages[roomId] || []
            });

            // Broadcast to other clients in the room
            socket.to(roomId).emit('user_joined', {
                message: `${userName} has joined the room!`,
                username: userName,
                userId: userId,
                participants: participants
            });

            logger.info(`✅ User ${userId} (${userName}) successfully joined room: ${roomId}`);
        } else {
            // Room is token gated - check token ownership
            logger.info(`🔒 Room ${roomId} is token gated. Checking token ownership for user.`);
            const { tokenAddress, tokenStandard } = roomDetails;
            if (!userWallet) {
                socket.emit('error', { message: 'Wallet address is required for token gated rooms.' });
                logger.warn('No wallet address provided for token gated room join attempt.');
                return;
            }

            let abi;
            if (tokenStandard === 'ERC721') {
                abi = ERC721_ABI;
            } else if (tokenStandard === 'ERC20') {
                abi = ERC20_ABI;
            } else {
                logger.warn(`Unknown token standard: ${tokenStandard}`);
                socket.emit('error', { message: 'Unknown token standard for this room.' });
                return;
            }

            let ownsToken = false;
            try {
                const contract = new ethers.Contract(tokenAddress, abi, provider);
                if (tokenStandard === 'ERC721') {
                    // ERC721: Check balanceOf
                    const balance = await contract.balanceOf(userWallet);
                    logger.info("the balance of the token is :", balance)
                    ownsToken = balance && balance > 0n;
                } else if (tokenStandard === 'ERC20') {
                    // ERC20: Check balanceOf
                    const balance = await contract.balanceOf(userWallet);
                    ownsToken = balance && balance > 0n;
                } else {
                    logger.warn(`Unknown token standard: ${tokenStandard}`);
                    socket.emit('error', { message: 'Unknown token standard for this room.' });
                    return;
                }
            } catch (err) {
                logger.error(`Error checking token ownership: ${err.message}`);
                socket.emit('error', { message: 'Error verifying token ownership.' });
                return;
            }

            if (!ownsToken) {
                logger.info(`User ${userWallet} does NOT own required token (${tokenAddress}) for room ${roomId}.`);
                socket.emit('error', { message: 'You do not own the required token to join this room.' });
                return;
            }

            logger.info(`User ${userWallet} owns required token (${tokenAddress}) for room ${roomId}. Proceeding with join.`);
            // Classic join method (same as non-token gated)
            if (users[userId]) {
                users[userId].name = userName;
                users[userId].status = 'online';
                if (!users[userId].rooms.includes(roomId)) {
                    users[userId].rooms.push(roomId);
                }
            }

            socket.join(roomId);

            if (!rooms[roomId]) {
                rooms[roomId] = [];
            }
            if (!rooms[roomId].includes(userId)) {
                rooms[roomId].push(userId);
            }

            if (!roomMessages[roomId]) {
                roomMessages[roomId] = [];
            }

            const participants = getRoomParticipants(roomId);

            socket.emit('join_success', {
                message: `You have joined the room: ${roomId}`,
                roomId: roomId,
                participants: participants,
                history: roomMessages[roomId] || []
            });

            socket.to(roomId).emit('user_joined', {
                message: `${userName} has joined the room!`,
                username: userName,
                userId: userId,
                participants: participants
            });

            logger.info(`✅ User ${userId} (${userName}) successfully joined token gated room: ${roomId}`);
        }
    });

    // Handle leaving a room
    socket.on('leave', (data) => {
        logger.info(`📤 Leave request received from ${userId}:`, data);

        const roomId = data.room;

        if (!roomId) {
            socket.emit('error', { message: 'Room ID is required.' });
            return;
        }

        // Remove room from user's list
        if (users[userId] && users[userId].rooms.includes(roomId)) {
            users[userId].rooms = users[userId].rooms.filter(id => id !== roomId);
        }

        // Remove user from room's participants
        if (rooms[roomId] && rooms[roomId].includes(userId)) {
            rooms[roomId] = rooms[roomId].filter(id => id !== userId);

            // If room is empty, clean up
            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
                if (roomMessages[roomId]) {
                    delete roomMessages[roomId];
                }
            }
        }

        // Leave the socket.io room
        socket.leave(roomId);

        // Get updated participants
        const participants = getRoomParticipants(roomId);

        // Notify the user who left
        socket.emit('leave_success', {
            message: `You have left the room: ${roomId}`,
            roomId: roomId
        });

        // Notify others in the room
        if (users[userId]) {
            socket.to(roomId).emit('user_left', {
                message: `${users[userId].name} has left the room.`,
                userId: userId,
                username: users[userId].name,
                participants: participants
            });
        }

        logger.info(`✅ User ${userId} left room: ${roomId}`);
    });

    // Handle incoming messages
    socket.on('message', async (data) => {
        logger.info(`📩 Message received from ${userId}:`, data);
        logger.info(`📩 Encryption key received:`, data.encryptedSymmetricKey);

        const userDbId = data.userDbId;
        const walletAddress = data.wallet_address;
        const roomId = data.room;
        const messageText = data.message;
        const encryptedSymmetricKey = data.encryptedSymmetricKey; // New field for encryption key
        const userName = data.username || users[userId]?.name || 'Unknown User';
        const timestamp = new Date().toISOString();

        // Get user details from database to ensure consistency
        let userDetails = null;
        try {
            const userResult = await sql`
                SELECT name, "walletAddress"
                FROM users
                WHERE id = ${userDbId}
            `;
            if (userResult && userResult.length > 0) {
                userDetails = userResult[0];
            }
        } catch (error) {
            logger.error(`❌ Error fetching user details: ${error.message}`);
        }

        if (!roomId || !messageText) {
            socket.emit('error', { message: 'Room ID and message are required.' });
            return;
        }

        // Check if room exists
        if (!rooms[roomId]) {
            socket.emit('error', { message: 'Room does not exist or you are not in this room.' });
            return;
        }

        // Check if user is in the room
        if (!rooms[roomId].includes(userId)) {
            socket.emit('error', { message: 'You are not in this room.' });
            return;
        }

        logger.info(`📩 Processing encrypted message in room ${roomId} from ${userName}`);

        // Create message object with encryption data
        const messageObj = {
            id: `msg-${timestamp}-${userDbId}`,
            sender: {
                id: userDbId, // Use database user ID instead of socket ID
                name: userDetails?.name || userName || 'Unknown User',
                wallet_address: userDetails?.walletAddress || walletAddress
            },
            content: messageText, // This is now the encrypted message
            encryptedSymmetricKey: encryptedSymmetricKey, // Include encryption key
            timestamp: timestamp
        };

        // Store message in history
        if (roomMessages[roomId]) {
            roomMessages[roomId].push(messageObj);
        }

        // Broadcast the encrypted message to everyone in the room EXCEPT the sender
        socket.to(roomId).emit('message_received', messageObj);

        // Database insertion with encryption support
        try {
            logger.info('Inserting encrypted message into database...');
            logger.info('Encryption key being inserted:', encryptedSymmetricKey);
            logger.info('Encryption key type:', typeof encryptedSymmetricKey);
            logger.info('Encryption key length:', encryptedSymmetricKey ? encryptedSymmetricKey.length : 'null');

            // Insert the encrypted message using Neon's serverless client
            const messageId = uuidv4();

            // Use the standard template literal syntax with explicit null handling
            const result = await sql`
                INSERT INTO chat_messages (id, "chatroomId", "senderId", message, "encryptedSymmetricKey", "sentAt")
                VALUES (${messageId}, ${roomId}, ${userDbId}, ${messageText}, ${encryptedSymmetricKey || null}, ${timestamp})
            `;

            logger.info(`✅ Encrypted message inserted successfully with key: ${encryptedSymmetricKey ? 'YES' : 'NO'}`);

        } catch (error) {
            logger.error(`❌ Database error: ${error.message}`);
            logger.error(`❌ Error stack: ${error.stack}`);
        }

        // Send confirmation to the sender
        socket.emit('message_sent', messageObj);

        logger.info(`✅ Encrypted message processed successfully`);
    });

    // Get room participants
    socket.on('get_participants', (data) => {
        logger.info(`📋 Participants request from ${userId}:`, data);

        const roomId = data.room;

        if (!roomId) {
            socket.emit('error', { message: 'Room ID is required.' });
            return;
        }

        const participants = getRoomParticipants(roomId);

        socket.emit('participants_list', {
            room: roomId,
            participants: participants
        });
    });

    // Get message history for a room
    socket.on('get_history', async (data) => {
        logger.info(`📚 History request from ${userId}:`, data);

        const roomId = data.room;

        if (!roomId) {
            socket.emit('error', { message: 'Room ID is required.' });
            return;
        }

        let history = [];

        try {
            // Fetch messages with sender information using a JOIN
            const result = await sql`
                SELECT
                    cm.id,
                    cm."senderId",
                    cm.message,
                    cm."encryptedSymmetricKey",
                    cm."sentAt",
                    u.name as sender_name,
                    u."walletAddress" as sender_wallet_address
                FROM chat_messages cm
                LEFT JOIN users u ON cm."senderId" = u.id
                WHERE cm."chatroomId" = ${roomId}
                ORDER BY cm."sentAt" DESC
                LIMIT 20
            `;

            // Reverse to chronological order (oldest first)
            history = result.reverse().map(row => ({
                id: row.id,
                sender: {
                    id: row.senderId,
                    name: row.sender_name || 'Unknown User',
                    wallet_address: row.sender_wallet_address,
                    wallet_address: row.sender_wallet_address
                },
                content: row.message,
                encryptedSymmetricKey: row.encryptedSymmetricKey,
                timestamp: row.sentAt instanceof Date ? row.sentAt.toISOString() : row.sentAt.toString()
            }));

            logger.info(`✅ Retrieved ${history.length} messages for room ${roomId}`);

        } catch (error) {
            logger.error(`❌ Error fetching message history from database: ${error.message}`);
        }

        socket.emit('history', {
            room: roomId,
            messages: history
        });
    });

    // Update user status
    socket.on('update_status', (data) => {
        logger.info(`🔄 Status update from ${userId}:`, data);

        const status = data.status;

        if (!status || !['online', 'away', 'busy'].includes(status)) {
            socket.emit('error', { message: 'Valid status is required (online, away, busy).' });
            return;
        }

        if (users[userId]) {
            const oldStatus = users[userId].status;
            users[userId].status = status;

            // Notify all rooms the user is in
            for (const roomId of users[userId].rooms) {
                const participants = getRoomParticipants(roomId);
                io.to(roomId).emit('status_updated', {
                    userId: userId,
                    username: users[userId].name,
                    oldStatus: oldStatus,
                    newStatus: status,
                    participants: participants
                });
            }

            logger.info(`✅ Status updated for ${userId}: ${oldStatus} -> ${status}`);
        }
    });

    // Handle any other events for debugging
    socket.onAny((event, ...args) => {
        logger.info(`🔍 Event '${event}' received from ${userId}:`, args);
    });
});

// Start the server
const PORT = process.env.PORT || 5050;
server.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Chat server started at http://localhost:${PORT}`);
    logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 CORS enabled for all origins`);
    logger.info(`🔌 Socket.IO transports: websocket, polling`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down server...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    logger.info('Shutting down server...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

// Error handling
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

