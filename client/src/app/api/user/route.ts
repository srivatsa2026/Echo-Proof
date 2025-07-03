// REGISTER USER 
import { supabase } from "@/lib/supabase-client";
import thirdwebAuth from "@/lib/server-client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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


// GET USER
export async function GET(req: Request) {
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

        const walletAddress = payload.parsedJWT.sub;
        console.log("the wallet address of the user is ", walletAddress)

        // Confirm user exists
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("smart_wallet_address", walletAddress)
            .maybeSingle();

        if (userError || !userData) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 }
            );
        }
        console.log("the user data is ", userData)
        return NextResponse.json(
            {
                userData
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Error in get user GET route:", err);
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}

// UPDATE USER INFO
export async function PATCH(req: Request) {
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

        const walletAddress = payload.parsedJWT.sub;

        const body = await req.json();
        const { name, email } = body;

        if (!name && !email) {
            return NextResponse.json({ message: "No update fields provided." }, { status: 400 });
        }

        // Check if user exists
        const { data: user, error: selectError } = await supabase
            .from("users")
            .select("*")
            .eq("smart_wallet_address", walletAddress)
            .maybeSingle();

        if (selectError || !user) {
            return NextResponse.json(
                { message: "User not found", error: selectError?.message },
                { status: 404 }
            );
        }

        // Update user
        const { data: updatedUser, error: updateError } = await supabase
            .from("users")
            .update({
                ...(name && { name }),
                ...(email && { email }),
            })
            .eq("smart_wallet_address", walletAddress)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { message: "Failed to update user", error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "User updated successfully", user: updatedUser },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Error in PATCH user route:", err);
        return NextResponse.json(
            { message: "Unexpected error", error: err.message },
            { status: 500 }
        );
    }
}
