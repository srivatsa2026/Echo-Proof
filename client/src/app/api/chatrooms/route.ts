// File: /app/api/create-chatroom/route.ts
import thirdwebAuth from "@/lib/server-client";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const jwt = cookies().get("jwt")?.value;

        if (!jwt) {
            return NextResponse.json(
                { message: "Unauthorized. Please sign in to create a chatroom" },
                { status: 401 }
            );
        }

        const payload = await thirdwebAuth.verifyJWT({ jwt });
        console.log("JWT Payload:", payload);

        if (!payload.valid) {
            return NextResponse.json({ message: "Invalid JWT" }, { status: 401 });
        }

        const walletAddress = payload.parsedJWT.sub;

        // Check if user exists in the database using the wallet address
        const userData = await prisma.user.findUnique({
            where: {
                walletAddress: walletAddress
            }
        });

        console.log("the user inside the create chatroom is ", userData);

        if (!userData) {
            return NextResponse.json(
                { message: "User not found. Please register before creating a chatroom." },
                { status: 404 }
            );
        }

        const body = await req.json();
        const {
            title,
            tokenGated = false,
            tokenAddress = null,
            tokenStandard = null,
            blockchainTx = null
        } = body;

        const creatorId = userData.id;
        console.log("the room name is ", title);
        console.log("the creator id is ", creatorId);

        if (!title) {
            return new Response(JSON.stringify({ error: "Room title is required" }), { status: 400 });
        }

        // Create chatroom with transaction to ensure atomicity
        const chatroomData = await prisma.$transaction(async (tx: any) => {
            // Create the chatroom
            const newChatroom = await tx.chatroom.create({
                data: {
                    title: title,
                    creatorId: creatorId,
                    tokenGated: tokenGated,
                    tokenAddress: tokenAddress,
                    tokenStandard: tokenStandard,
                    blockchainTx: blockchainTx,
                    isActive: true
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            walletAddress: true,
                            smartWalletAddress: true,
                            profileImage: true
                        }
                    }
                }
            });

            // Add creator as admin member of the chatroom
            await tx.chatroomMember.create({
                data: {
                    chatroomId: newChatroom.id,
                    userId: creatorId,
                    role: "admin",
                    isActive: true
                }
            });

            return newChatroom;
        });

        console.log("the creation data is ", chatroomData);

        return new Response(JSON.stringify({
            message: "Chatroom created successfully",
            chatroom: chatroomData
        }), { status: 201 });

    } catch (err: any) {
        console.error("Route error:", err);
        return new Response(JSON.stringify({
            error: "Internal server error",
            details: err.message
        }), { status: 500 });
    }
}

// GET all chatrooms for a user
export async function GET(req: Request) {
    try {
        const jwt = cookies().get("jwt")?.value;

        if (!jwt) {
            return NextResponse.json(
                { message: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const payload = await thirdwebAuth.verifyJWT({ jwt });

        if (!payload.valid) {
            return NextResponse.json({ message: "Invalid JWT" }, { status: 401 });
        }

        const walletAddress = payload.parsedJWT.sub;

        // Find user
        const userData = await prisma.user.findUnique({
            where: {
                walletAddress: walletAddress
            }
        });

        if (!userData) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 }
            );
        }

        // Get chatrooms where user is a member
        const chatrooms = await prisma.chatroom.findMany({
            where: {
                members: {
                    some: {
                        userId: userData.id,
                        isActive: true
                    }
                },
                isActive: true
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        walletAddress: true,
                        smartWalletAddress: true,
                        profileImage: true
                    }
                },
                members: {
                    where: {
                        isActive: true
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                walletAddress: true,
                                smartWalletAddress: true,
                                profileImage: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        sentAt: 'desc'
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        messages: true,
                        members: {
                            where: {
                                isActive: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(
            {
                message: "Chatrooms retrieved successfully",
                chatrooms: chatrooms
            },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Error in GET chatrooms route:", err);
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}