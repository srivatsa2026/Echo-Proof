// File: /app/api/create-chatroom/route.ts
import { supabase } from "@/lib/supabase-client";

export async function POST(req: Request) {
    try {
        const { roomName, purpose, creator_id } = await req.json();

        console.log(roomName, purpose, creator_id)
        if (!roomName || !purpose || !creator_id) {
            return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
        }
        const session_id = `chat-${Math.random().toString(36).substring(2, 8)}`;

        const { data, error } = await supabase
            .from("chatrooms")
            .insert([
                {
                    name: roomName,
                    purpose,
                    creator_id,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ chatroom: data }), { status: 200 });
    } catch (err: any) {
        console.error("Route error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
