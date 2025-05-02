import { supabase } from "@/lib/supabase-client";

export async function POST(req: Request) {
    try {
        const { wallet_address, smart_wallet_address } = await req.json();

        if (!wallet_address || !smart_wallet_address) {
            return new Response(
                JSON.stringify({ message: "Missing wallet address fields." }),
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("wallet_address", wallet_address)
            .eq("smart_wallet_address", smart_wallet_address)
            .single(); // Assumes one user per wallet combo
        if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows found (which isn't a server error)
            return new Response(
                JSON.stringify({ message: "Database error", error }),
                { status: 500 }
            );
        }

        if (!data) {
            return new Response(
                JSON.stringify({ message: "User not found" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ message: "User found", user: data }),
            { status: 200 }
        );

    } catch (err: any) {
        return new Response(
            JSON.stringify({ message: "Unexpected error", error: err.message }),
            { status: 500 }
        );
    }
}
