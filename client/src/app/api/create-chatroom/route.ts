// File: /app/api/create-chatroom/route.ts
import { supabase } from "@/lib/supabase-client";
import thirdwebAuth from "@/lib/server-client";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const jwt = cookies().get("jwt")?.value;

        if (!jwt) {
            return NextResponse.json(
                { message: "Unauthorized. Please sign in to create a campaign" },
                { status: 401 }
            );
        }

        const payload = await thirdwebAuth.verifyJWT({ jwt });
        console.log("JWT Payload:", payload);

        if (!payload.valid) {
            return NextResponse.json({ message: "Invalid JWT" }, { status: 401 });
        }

        const walletAddress = payload.parsedJWT.iss;

        // Check if user exists in the database using the wallet address
        const { data: userData, error: userError } = await supabase
            .from("users")  // replace with your actual user table name if different
            .select("*")
            .eq("wallet_address", walletAddress)
            .maybeSingle();
        if (userError || !userData) {
            return NextResponse.json(
                { message: "User not found. Please register before creating a chatroom." },
                { status: 404 }
            );
        }

        const { roomName, purpose, creator_id } = await req.json();

        if (!roomName || !purpose || !creator_id) {
            return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
        }


        const { data: chatroomData, error: insertError } = await supabase
            .from("chatrooms")
            .insert([
                {
                    name: roomName,
                    purpose,
                    creator_id,
                },
            ])
            .select("*")
            .single();
        console.log("the creation data is ", chatroomData)
        if (insertError) {
            console.error("Supabase insert error:", insertError);
            return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ chatroom: chatroomData }), { status: 200 });

    } catch (err: any) {
        console.error("Route error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}



