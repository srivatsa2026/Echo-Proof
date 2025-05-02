import { supabase } from "@/lib/supabase-client";

export async function POST(req: Request) {
    const { name, email, wallet_address, smart_wallet_address } = await req.json();
    console.log(name, email, wallet_address, smart_wallet_address)
    const { data: user, error: selectError } = await supabase
        .from("users")
        .select("*")
        .eq("smart_wallet_address", smart_wallet_address)
        .eq("wallet_address", wallet_address)
        .single();

    if (selectError || !user) {
        return new Response(
            JSON.stringify({ message: "User not found", error: selectError }),
            { status: 404 }
        );
    }

    const { data, error: updateError } = await supabase
        .from("users")
        .update({
            name: name,
            email: email
        })
        .eq("smart_wallet_address", smart_wallet_address)
        .eq("wallet_address", wallet_address)
        .select();

    if (updateError) {
        return new Response(
            JSON.stringify({ message: "Failed to update user", error: updateError }),
            { status: 500 }
        );
    }

    return new Response(JSON.stringify({ message: "User updated", user: data }), {
        status: 200
    });
}
