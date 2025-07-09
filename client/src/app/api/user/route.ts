// USER API ROUTES WITH PRISMA
import { prisma } from "@/lib/db";
import thirdwebAuth from "@/lib/server-client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// REGISTER USER 
export async function POST(req: Request) {
    try {
        // Validate input
        const body = await req.json();
        const wallet_address = body.wallet_address;
        const name = body.name || ""; // Default empty name if not provided

        console.log(`address is ${wallet_address}`);

        if (!wallet_address) {
            return new Response(JSON.stringify({ message: "Missing wallet address" }), {
                status: 400,
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                walletAddress: wallet_address
            }
        });

        if (existingUser) {
            console.log("existing user", existingUser);
            return new Response(JSON.stringify({ message: "User already exists", user: existingUser }), {
                status: 200,
            });
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                walletAddress: wallet_address,
                name: name,
                userPlan: "free" // Default plan
            }
        });

        console.log("createdUser", newUser);

        return new Response(JSON.stringify({ message: "User created successfully", user: newUser }), {
            status: 201,
        });
    } catch (err: any) {
        console.error("Error in POST user route:", err);
        return new Response(
            JSON.stringify({ message: "Unexpected error", error: err.message }),
            { status: 500 }
        );
    }
}

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
        console.log("the wallet address of the user is ", walletAddress);

        // Find user by smart wallet address
        const userData = await prisma.user.findUnique({
            where: {
                walletAddress: walletAddress
            },
            include: {
                chatrooms: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        isActive: true
                    }
                },
                videoMeetings: {
                    select: {
                        id: true,
                        title: true,
                        startTime: true,
                        endTime: true
                    }
                },
                subscriptions: {
                    where: {
                        active: true
                    },
                    select: {
                        id: true,
                        plan: true,
                        status: true,
                        startDate: true,
                        endDate: true
                    }
                }
            }
        });

        if (!userData) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 }
            );
        }

        console.log("the user data is ", userData);
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
        const { name, profileImage, userPlan } = body;

        if (!name && !profileImage && !userPlan) {
            return NextResponse.json({ message: "No update fields provided." }, { status: 400 });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: {
                walletAddress: walletAddress
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: {
                walletAddress: walletAddress
            },
            data: {
                ...(name && { name }),
                ...(profileImage && { profileImage }),
                ...(userPlan && { userPlan }),
            }
        });

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

// DELETE USER (Optional - for completeness)
export async function DELETE(req: Request) {
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

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: {
                walletAddress: walletAddress
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Delete user (this will cascade delete related records due to schema constraints)
        await prisma.user.delete({
            where: {
                walletAddress: walletAddress
            }
        });

        return NextResponse.json(
            { message: "User deleted successfully" },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Error in DELETE user route:", err);
        return NextResponse.json(
            { message: "Unexpected error", error: err.message },
            { status: 500 }
        );
    }
}