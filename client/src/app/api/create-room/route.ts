import { supabase } from "@/lib/supabase-client";



export async function POST(req: Request) {
    const { roomName, description, creator_wallet_address, creator_smart_wallet_address } = await req.json();


    const chatroom = await supabase.from("")


}