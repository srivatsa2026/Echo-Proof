import { NextRequest, NextResponse } from "next/server";
import thirdwebAuth from "@/lib/server-client";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const chatroomId = searchParams.get("chatroomId");
        const limit = parseInt(searchParams.get("limit") || "15", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        if (!chatroomId) {
            return NextResponse.json({ error: "Chatroom ID is required" }, { status: 400 });
        }

        // Optional: Add authentication check
        const jwt = cookies().get("jwt")?.value;
        if (jwt) {
            const payload = await thirdwebAuth.verifyJWT({ jwt });
            if (payload.valid) {
                const walletAddress = payload.parsedJWT.sub;

                // Check if user is a member of the chatroom
                const user = await prisma.user.findUnique({
                    where: { walletAddress: walletAddress }
                });

                if (user) {
                    const membership = await prisma.chatroomMember.findUnique({
                        where: {
                            chatroomId_userId: {
                                chatroomId: chatroomId,
                                userId: user.id
                            }
                        }
                    });

                    if (!membership || !membership.isActive) {
                        return NextResponse.json({
                            error: "You are not a member of this chatroom"
                        }, { status: 403 });
                    }
                }
            }
        }

        // Fetch messages with sender information using Prisma
        const messages = await prisma.chatMessage.findMany({
            where: {
                chatroomId: chatroomId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        walletAddress: true
                    }
                },
                chatroom: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                sentAt: 'asc'
            },
            skip: offset,
            take: limit
        });

        console.log("🔍 Raw messages from database:", messages);

        if (!messages || messages.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        // Format messages for response
        const formattedMessages = messages.map((message: any) => {
            console.log("🔍 Processing message in API:", message);
            console.log("🔍 Sender object in API:", message.sender);

            return {
                id: message.id,
                message: message.message,
                encryptedSymmetricKey: message.encryptedSymmetricKey, // Include encryption key
                sentAt: message.sentAt,
                chatroomId: message.chatroomId,
                senderId: message.senderId,
                sender: {
                    id: message.sender.id,
                    name: message.sender.name,
                    profileImage: message.sender.profileImage,
                    walletAddress: message.sender.walletAddress
                },
                chatroom: message.chatroom
            };
        });

        console.log("🔍 Final formatted messages from API:", formattedMessages);

        return NextResponse.json(formattedMessages, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST route to send a new message
export async function POST(req: NextRequest) {
    try {
        const jwt = cookies().get("jwt")?.value;

        if (!jwt) {
            return NextResponse.json(
                { message: "Unauthorized. Please sign in to send messages." },
                { status: 401 }
            );
        }

        const payload = await thirdwebAuth.verifyJWT({ jwt });

        if (!payload.valid) {
            return NextResponse.json({ message: "Invalid JWT" }, { status: 401 });
        }

        const walletAddress = payload.parsedJWT.sub;

        // Find user
        const user = await prisma.user.findUnique({
            where: {
                walletAddress: walletAddress
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 }
            );
        }

        const { chatroomId, message, encryptedSymmetricKey } = await req.json();

        if (!chatroomId || !message || message.trim() === "") {
            return NextResponse.json(
                { error: "Chatroom ID and message are required" },
                { status: 400 }
            );
        }

        // Check if user is a member of the chatroom
        const membership = await prisma.chatroomMember.findUnique({
            where: {
                chatroomId_userId: {
                    chatroomId: chatroomId,
                    userId: user.id
                }
            }
        });

        if (!membership || !membership.isActive) {
            return NextResponse.json(
                { error: "You are not a member of this chatroom" },
                { status: 403 }
            );
        }

        // Check if chatroom is active
        const chatroom = await prisma.chatroom.findUnique({
            where: {
                id: chatroomId
            },
            select: {
                isActive: true
            }
        });

        if (!chatroom || !chatroom.isActive) {
            return NextResponse.json(
                { error: "Chatroom is not active" },
                { status: 403 }
            );
        }

        // Create new message
        const newMessage = await prisma.chatMessage.create({
            data: {
                chatroomId: chatroomId,
                senderId: user.id,
                message: message.trim(),
                encryptedSymmetricKey: encryptedSymmetricKey || null
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        walletAddress: true
                    }
                },
                chatroom: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        const formattedMessage = {
            id: newMessage.id,
            message: newMessage.message,
            sentAt: newMessage.sentAt,
            chatroomId: newMessage.chatroomId,
            senderId: newMessage.senderId,
            sender: {
                id: newMessage.sender.id,
                name: newMessage.sender.name,
                profileImage: newMessage.sender.profileImage,
                walletAddress: newMessage.sender.walletAddress
            },
            chatroom: newMessage.chatroom
        };

        return NextResponse.json(
            {
                message: "Message sent successfully",
                data: formattedMessage
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET route to get message count for a chatroom
export async function HEAD(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const chatroomId = searchParams.get("chatroomId");

        if (!chatroomId) {
            return NextResponse.json({ error: "Chatroom ID is required" }, { status: 400 });
        }

        const messageCount = await prisma.chatMessage.count({
            where: {
                chatroomId: chatroomId
            }
        });

        return NextResponse.json(
            { count: messageCount },
            {
                status: 200,
                headers: {
                    'X-Total-Count': messageCount.toString()
                }
            }
        );
    } catch (error: any) {
        console.error("Error getting message count:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}