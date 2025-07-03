import { supabase } from "@/lib/supabase-client";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const chatroomId = searchParams.get("chatroomId");
        const limit = parseInt(searchParams.get("limit") || "15", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        if (!chatroomId) {
            return NextResponse.json({ error: "Chatroom ID is required" }, { status: 400 });
        }

        // Calculate range for Supabase
        const from = offset;
        const to = offset + limit - 1;

        // Fetch messages ordered by sent_at, paginated
        const { data: messageRows, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("chatroom_id", chatroomId)
            .order("sent_at", { ascending: true })
            .range(from, to);

        if (messagesError) {
            return NextResponse.json({ error: messagesError.message }, { status: 500 });
        }

        if (!messageRows || messageRows.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        // Normalize sender IDs to string
        const senderIds = [...new Set(messageRows.map(row => String(row.sender_id)))];
        console.log("senderIds:", senderIds, typeof senderIds[0]);

        let userMap = new Map();
        if (senderIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
                .from("users")
                .select("id, name")
                .in("id", senderIds);

            console.log("usersData:", usersData);
            console.log("usersError:", usersError);

            if (!usersError && usersData) {
                usersData.forEach(user => {
                    userMap.set(String(user.id), user.name);
                });
            }
        }
        console.log("userMap:", userMap);

        const messagesWithSender = messageRows.map(message => ({
            ...message,
            sender_name: userMap.get(String(message.sender_id)) || "Unknown User",
        }));

        console.log("messagesWithSender:", messagesWithSender);

        return NextResponse.json(messagesWithSender, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}