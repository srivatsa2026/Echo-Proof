import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { message: "sessionId is required" },
                { status: 400 }
            );
        }

        // Get meeting details by session ID without authentication
        const meeting = await prisma.videoMeeting.findFirst({
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

        if (!meeting) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Meeting not found" 
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            meeting: {
                id: meeting.id,
                title: meeting.title,
                sessionId: meeting.sessionId,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                tokenGated: meeting.tokenGated,
                tokenAddress: meeting.tokenAddress,
                tokenStandard: meeting.tokenStandard,
                host: meeting.host,
                participants: meeting.participants,
                createdAt: meeting.createdAt
            }
        });

    } catch (error) {
        console.error("Error fetching meeting details:", error);
        return NextResponse.json(
            { 
                success: false,
                message: "Internal server error" 
            },
            { status: 500 }
        );
    }
}
