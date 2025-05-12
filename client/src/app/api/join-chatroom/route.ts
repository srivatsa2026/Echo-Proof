import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import thirdwebAuth from "@/lib/server-client";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
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

    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("smart_wallet_address", walletAddress)
        .maybeSingle();

    if (userError || !userData) {
        return NextResponse.json(
            { message: "User not found. Please register before joining a chatroom." },
            { status: 404 }
        );
    }
    console.log("the join room user is ", userData)
    const { data: chatroom, error: chatroomError } = await supabase
        .from("chatrooms")
        .select("active")
        .eq("id", roomId)
        .maybeSingle();

    if (chatroomError || !chatroom) {
        return NextResponse.json(
            { message: "Chatroom not found." },
            { status: 404 }
        );
    }
    console.log("the chatrrom is active or not ", chatroom.active)
    if (chatroom.active) {
        return NextResponse.json(
            { success: true, message: "Chatroom is active." },
            { status: 200 }
        );
    } else {
        return NextResponse.json(
            { success: false, message: "Chatroom is inactive or closed." },
            { status: 403 }
        );
    }
}
