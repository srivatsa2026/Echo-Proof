import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import thirdwebAuth from "@/lib/server-client";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { 
            title, 
            startTime, 
            endTime, 
            tokenGated = false, 
            tokenAddress, 
            tokenStandard,
            sessionId 
        } = await req.json();
        // console.log("Received meeting creation request:", { 
        //     title, 
        //     startTime, 
        //     endTime, 
        //     tokenGated, 
        //     tokenAddress, 
        //     tokenStandard,
        //     sessionId 
        // });
        const jwt = cookies().get("jwt")?.value;

        // Validate required fields
        if (!title || !startTime || !sessionId) {
            return NextResponse.json(
                { message: "Missing required fields: title, startTime, or sessionId" },
                { status: 400 }
            );
        }

        // Validate JWT token
        if (!jwt) {
            return NextResponse.json(
                { message: "Unauthorized. Please sign in to create a video meeting." },
                { status: 401 }
            );
        }

        const payload = await thirdwebAuth.verifyJWT({ jwt });
        console.log("JWT Payload:", payload);

        if (!payload.valid) {
            return NextResponse.json({ message: "Invalid JWT" }, { status: 401 });
        }

        const walletAddress = payload.parsedJWT.sub;

        // Find user by wallet address
        const userData = await prisma.user.findUnique({
            where: {
                walletAddress: walletAddress
            }
        });
        console.log("Meeting host:", userData);

        if (!userData) {
            return NextResponse.json(
                { message: "User not found. Please register before creating a meeting." },
                { status: 404 }
            );
        }


        // Validate token-gating fields if enabled
        if (tokenGated && (!tokenAddress || !tokenStandard)) {
            return NextResponse.json(
                { message: "Token address and standard are required for token-gated meetings" },
                { status: 400 }
            );
        }

        // Create the video meeting
        const newMeeting = await prisma.videoMeeting.create({
            data: {
                title,
                hostId: userData.id,
                sessionId,
                startTime: new Date(startTime),
                endTime: endTime ? new Date(endTime) : null,
                tokenGated,
                tokenAddress: tokenGated ? tokenAddress : null,
                tokenStandard: tokenGated ? tokenStandard : null,
                summary: "",
            },
            include: {
                host: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        walletAddress: true
                    }
                }
            }
        });
        return NextResponse.json(
            {
                success: true,
                message: "Video meeting created successfully.",
                meeting: {
                    id: newMeeting.id,
                    title: newMeeting.title,
                    sessionId: newMeeting.sessionId,
                    startTime: newMeeting.startTime,
                    endTime: newMeeting.endTime,
                    tokenGated: newMeeting.tokenGated,
                    tokenAddress: newMeeting.tokenAddress,
                    tokenStandard: newMeeting.tokenStandard,
                    host: newMeeting.host
                }
            },
            { status: 201 }
        );

    } catch (err: any) {
        console.error("Error creating video meeting:", err);
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { meetingId, action, recordingUrl, transcriptUrl, blockchainTx } = await req.json();
        const jwt = cookies().get("jwt")?.value;

        if (!meetingId || !action) {
            return NextResponse.json(
                { message: "Meeting ID and action are required" },
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
        const userData = await prisma.user.findUnique({
            where: { walletAddress: walletAddress }
        });

        if (!userData) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 }
            );
        }

        // Find the meeting and verify host permissions
        const meeting = await prisma.videoMeeting.findUnique({
            where: { id: meetingId },
            include: {
                host: {
                    select: { id: true, walletAddress: true }
                }
            }
        });

        if (!meeting) {
            return NextResponse.json(
                { message: "Meeting not found." },
                { status: 404 }
            );
        }

        // Verify user is the host for certain actions
        if (['end', 'update'].includes(action) && meeting.hostId !== userData.id) {
            return NextResponse.json(
                { message: "Only the meeting host can perform this action." },
                { status: 403 }
            );
        }

        let updateData: any = {};

        switch (action) {
            case 'end':
                updateData.endTime = new Date();
                break;
            case 'update':
                if (recordingUrl) updateData.recordingUrl = recordingUrl;
                if (transcriptUrl) updateData.transcriptUrl = transcriptUrl;
                if (blockchainTx) updateData.blockchainTx = blockchainTx;
                break;
            default:
                return NextResponse.json(
                    { message: "Invalid action" },
                    { status: 400 }
                );
        }

        const updatedMeeting = await prisma.videoMeeting.update({
            where: { id: meetingId },
            data: updateData,
            include: {
                host: {
                    select: {
                        id: true,
                        name: true,
                        walletAddress: true
                    }
                }
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: `Meeting ${action}ed successfully.`,
                meeting: updatedMeeting
            },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Error updating video meeting:", err);
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const meetingId = searchParams.get('meetingId');
        const sessionId = searchParams.get('sessionId');
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

        if (meetingId || sessionId) {
            // Get specific meeting by ID or session ID
            let meeting;
            
            if (meetingId) {
                meeting = await prisma.videoMeeting.findUnique({
                    where: { id: meetingId },
                    include: {
                        host: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true,
                                walletAddress: true
                            }
                        },
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                        walletAddress: true
                                    }
                                }
                            }
                        }
                    }
                });
            } else if (sessionId) {
                meeting = await prisma.videoMeeting.findFirst({
                    where: { sessionId: sessionId },
                    include: {
                        host: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true,
                                walletAddress: true
                            }
                        },
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                        walletAddress: true
                                    }
                                }
                            }
                        }
                    }
                });
            }

            if (!meeting) {
                return NextResponse.json(
                    { message: "Meeting not found." },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, meeting },
                { status: 200 }
            );
        } else {
            // Get user's meetings (hosted or participated)
            const walletAddress = payload.parsedJWT.sub;
            const userData = await prisma.user.findUnique({
                where: { walletAddress: walletAddress }
            });

            if (!userData) {
                return NextResponse.json(
                    { message: "User not found." },
                    { status: 404 }
                );
            }

            const meetings = await prisma.videoMeeting.findMany({
                where: {
                    OR: [
                        { hostId: userData.id },
                        { participants: { some: { userId: userData.id } } }
                    ]
                },
                include: {
                    host: {
                        select: {
                            id: true,
                            name: true,
                            profileImage: true,
                            walletAddress: true
                        }
                    },
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    profileImage: true
                                }
                            }
                        }
                    }
                },
                orderBy: { startTime: 'desc' }
            });

            return NextResponse.json(
                { success: true, meetings },
                { status: 200 }
            );
        }

    } catch (err: any) {
        console.error("Error fetching video meetings:", err);
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}