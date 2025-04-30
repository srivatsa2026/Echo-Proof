import { supabase } from "@/lib/supabase-client";

export async function POST(req: Request) {
    try {
        // Validate input
        const body = await req.json();
        const wallet_address = body.wallet_address;
        const smart_wallet_address = body.smart_wallet_address;
        console.log(`address is ${wallet_address} smart wallet address is ${smart_wallet_address}`)
        if (!smart_wallet_address || !wallet_address) {
            return new Response(JSON.stringify({ message: "Missing smart_wallet_address" }), {
                status: 400,
            });
        }


        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("smart_wallet_address", smart_wallet_address)
            .eq("wallet_address", wallet_address)
            .maybeSingle();

        if (fetchError) {
            return new Response(
                JSON.stringify({ message: "Error checking user", error: fetchError.message }),
                { status: 500 }
            );
        }

        if (existingUser) {
            console.log("existing user", existingUser)
            return new Response(JSON.stringify({ message: "User already exists", user: existingUser }), {
                status: 200,
            });
        }

        // Create new user with only smart_wallet_address
        const { data: newUser, error: insertError } = await (supabase
            .from("users")
            .insert([
                {
                    smart_wallet_address,
                    wallet_address
                },
            ])
            .select("*")
            .single());
        console.log("createdUser", newUser)
        if (insertError) {
            return new Response(
                JSON.stringify({ message: "Error creating user", error: insertError.message }),
                { status: 500 }
            );
        }

        return new Response(JSON.stringify({ message: "User created successfully", user: newUser }), {
            status: 201,
        });
    } catch (err: any) {
        return new Response(
            JSON.stringify({ message: "Unexpected error", error: err.message }),
            { status: 500 }
        );
    }
};
