// app/api/verify/route.ts

import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase-client";

export async function POST(req: Request) {
    try {
        // Parse the request body as JSON
        const { smart_wallet_address, wallet_address } = await req.json();

        if (!smart_wallet_address || !wallet_address) {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400 }
            );
        }

        // Query the database to check if the user exists
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("smart_wallet_address", smart_wallet_address)
            .eq("wallet_address", wallet_address)
            .maybeSingle();
        console.log("the user is here ", data)
        if (error) {
            console.error("Error fetching user:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        console.log("done with verifiacion")

        // Return the user data if found
        return NextResponse.json({ user: data }, { status: 200 });
    } catch (error) {
        console.error("Error in POST request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
