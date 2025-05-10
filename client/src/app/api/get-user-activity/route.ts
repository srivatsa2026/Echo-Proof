import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";
import thirdwebAuth from "@/lib/server-client";

export async function GET(req: NextRequest) {
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

        const walletAddress = payload.parsedJWT.iss;

        // Confirm user exists
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("wallet_address", walletAddress)
            .maybeSingle();

        if (userError || !userData) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 }
            );
        }
        console.log("the user data is ", userData)
        // Fetch chatrooms
        const { data: chatrooms, error: chatroomError } = await supabase
            .from("chatrooms")
            .select("*")
            .eq("creator_id", userData.id)
            .eq("active", true);
        console.log("the chatrooms ", chatrooms)

        if (chatroomError) {
            return NextResponse.json(
                { message: "Failed to fetch chatrooms.", error: chatroomError.message },
                { status: 500 }
            );
        }

        // Fetch video meetings
        const { data: videoMeetings, error: meetingError } = await supabase
            .from("video_meetings")
            .select("*")
            .eq("creator_id", userData.id)
            .eq("active", true);
        console.log("the videomeeting", videoMeetings)
        // if (meetingError) {
        //     return NextResponse.json(
        //         { message: "Failed to fetch video meetings.", error: meetingError.message },
        //         { status: 500 }
        //     );
        // }

        return NextResponse.json(
            {
                chatrooms,
                videoMeetings,
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Error in get-user-activity POST route:", err);
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}
