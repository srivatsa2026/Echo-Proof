'use server';

import { cookies } from "next/headers";
import {
	type GenerateLoginPayloadParams,
	type VerifyLoginPayloadParams,
	createAuth,
} from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";

import { prisma } from "@/lib/db";

// 1. Setup thirdweb client and auth
const secretKey: string = process.env.SECRET_KEY || "";
const privateKey: string = process.env.ACCOUNT_PRIVATE_KEY || "";

const client = createThirdwebClient({ secretKey });

const thirdwebAuth = createAuth({
	domain: "localhost",
	client,
	adminAccount: privateKeyToAccount({ client, privateKey }),
	login: {
		statement: "Click Sign only means you have proved this wallet is owned by you. We will use the public wallet address to fetch your NFTs. This request will not trigger any blockchain transaction or cost any gas fees.",
		version: "1",
		uri: "localhost:3000",
	},
});

// 2. Generate Login Payload
export async function generatePayload(payload: GenerateLoginPayloadParams) {
	console.log("Generating payload:", payload);
	return thirdwebAuth.generatePayload(payload);
}

// 3. Login - Check if user exists, if not create one
export async function login(payload: VerifyLoginPayloadParams) {
	const verifiedPayload = await thirdwebAuth.verifyPayload(payload);

	if (!verifiedPayload.valid) {
		throw new Error("Invalid wallet signature. Authentication failed.");
	}

	const walletAddress = verifiedPayload.payload.address;

	try {
		// Check if user exists
		let user = await prisma.user.findUnique({
			where: {
				walletAddress: walletAddress,
			},
		});

		// If user doesn't exist, create one
		if (!user) {
			user = await prisma.user.create({
				data: {
					walletAddress: walletAddress,
					name: `User ${walletAddress.slice(0, 6)}`,
				},
			});
		}

		// Generate JWT
		const jwt = await thirdwebAuth.generateJWT({
			payload: verifiedPayload.payload,
		});

		// Store JWT in cookie
		const c = cookies();
		c.set("jwt", jwt);
		console.log("JWT issued and saved in cookie.");

	} catch (error) {
		console.error("Database error during login:", error);
		throw new Error("Database error during login.");
	}
}

// 4. Check if logged in
export async function isLoggedIn() {
	const c = cookies();
	const jwt = c.get("jwt");

	if (!jwt?.value) {
		return false;
	}

	const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
	return authResult.valid;
}

// 5. Logout
export async function logout() {
	const c = cookies();
	c.delete("jwt");
	console.log("JWT cookie cleared. User logged out.");
}