import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/server-client";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const jwt = cookies().get("jwt")?.value;
        if (!jwt) {
            return NextResponse.json({ message: "Unauthorized. Please sign in." }, { status: 401 });
        }
        const payload = await thirdwebAuth.verifyJWT({ jwt });
        if (!payload.valid) {
            return NextResponse.json({ message: "Invalid JWT" }, { status: 401 });
        }
        const userWallet = payload.parsedJWT.sub;
        // Find user by wallet address
        const user = await prisma.user.findUnique({ where: { walletAddress: userWallet } });
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }
        const chatroomId = params.id;
        // Find chatroom
        const chatroom = await prisma.chatroom.findUnique({ where: { id: chatroomId } });
        if (!chatroom) {
            return NextResponse.json({ message: "Chatroom not found." }, { status: 404 });
        }
        // Only the creator can close the room
        if (chatroom.creatorId !== user.id) {
            return NextResponse.json({ message: "Forbidden. Only the creator can close this chatroom." }, { status: 403 });
        }
        // Set isActive to false (close the chatroom)
        await prisma.chatroom.update({
            where: { id: chatroomId },
            data: { isActive: false }
        });
        return NextResponse.json({ message: "Chatroom closed successfully." }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
    }
} 