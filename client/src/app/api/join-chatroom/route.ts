import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import thirdwebAuth from "@/lib/server-client";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { roomId } = await req.json();
        const jwt = cookies().get("jwt")?.value;

        if (!roomId) {
            return NextResponse.json(
                { message: "Invalid roomId or roomId is missing" },
                { status: 400 }
            );
        }

        if (!jwt) {
            return NextResponse.json(
                { message: "Unauthorized. Please sign in to join the chatroom." },
                { status: 401 }
            );
        }

        const payload = await thirdwebAuth.verifyJWT({ jwt });
        console.log("JWT Payload:", payload);

        if (!payload.valid) {
            return NextResponse.json({ message: "Invalid JWT" }, { status: 401 });
        }

        const walletAddress = payload.parsedJWT.sub;

        // Find user by smart wallet address
        const userData = await prisma.user.findUnique({
            where: {
                smartWalletAddress: walletAddress
            }
        });

        if (!userData) {
            return NextResponse.json(
                { message: "User not found. Please register before joining a chatroom." },
                { status: 404 }
            );
        }

        console.log("the join room user is ", userData);

        // Find chatroom and check if it's active
        const chatroom = await prisma.chatroom.findUnique({
            where: {
                id: roomId
            },
            select: {
                id: true,
                title: true,
                isActive: true,
                tokenGated: true,
                tokenAddress: true,
                tokenStandard: true,
                creatorId: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        smartWalletAddress: true
                    }
                }
            }
        });

        if (!chatroom) {
            return NextResponse.json(
                { message: "Chatroom not found." },
                { status: 404 }
            );
        }

        console.log("the chatroom is active or not ", chatroom.isActive);

        if (!chatroom.isActive) {
            return NextResponse.json(
                { success: false, message: "Chatroom is inactive or closed." },
                { status: 403 }
            );
        }

        // Check if user is already a member
        const existingMember = await prisma.chatroomMember.findUnique({
            where: {
                chatroomId_userId: {
                    chatroomId: roomId,
                    userId: userData.id
                }
            }
        });

        if (existingMember) {
            if (existingMember.isActive) {
                return NextResponse.json(
                    { success: true, message: "User is already a member of this chatroom." },
                    { status: 200 }
                );
            } else {
                // Reactivate membership if user was previously a member
                await prisma.chatroomMember.update({
                    where: {
                        id: existingMember.id
                    },
                    data: {
                        isActive: true,
                        joinedAt: new Date(),
                        leftAt: null
                    }
                });

                return NextResponse.json(
                    { success: true, message: "Successfully rejoined the chatroom." },
                    { status: 200 }
                );
            }
        }

        // Add user as a member of the chatroom
        await prisma.chatroomMember.create({
            data: {
                chatroomId: roomId,
                userId: userData.id,
                role: "member",
                isActive: true
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully joined the chatroom.",
                chatroom: {
                    id: chatroom.id,
                    title: chatroom.title,
                    tokenGated: chatroom.tokenGated,
                    creator: chatroom.creator
                }
            },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Error in join chatroom route:", err);
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}

// GET route to check if user can join a chatroom (without actually joining)
export async function GET(req: NextRequest) {
    try {
        const jwt = cookies().get("jwt")?.value;
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get("roomId");

        if (!roomId) {
            return NextResponse.json(
                { message: "Invalid roomId or roomId is missing" },
                { status: 400 }
            );
        }

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
                smartWalletAddress: walletAddress
            }
        });

        if (!userData) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 }
            );
        }

        // Find chatroom with detailed info
        const chatroom = await prisma.chatroom.findUnique({
            where: {
                id: roomId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
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
                                profileImage: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        members: {
                            where: {
                                isActive: true
                            }
                        }
                    }
                }
            }
        });

        if (!chatroom) {
            return NextResponse.json(
                { message: "Chatroom not found." },
                { status: 404 }
            );
        }

        // Check if user is already a member
        const isMember = chatroom.members.some((member: any) => member.userId === userData.id);

        return NextResponse.json(
            {
                success: true,
                chatroom: {
                    id: chatroom.id,
                    title: chatroom.title,
                    isActive: chatroom.isActive,
                    tokenGated: chatroom.tokenGated,
                    tokenAddress: chatroom.tokenAddress,
                    tokenStandard: chatroom.tokenStandard,
                    creator: chatroom.creator,
                    memberCount: chatroom._count.members,
                    createdAt: chatroom.createdAt
                },
                userStatus: {
                    isMember: isMember,
                    canJoin: chatroom.isActive && !isMember
                }
            },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Error in GET join chatroom route:", err);
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}