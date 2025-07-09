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

const secretKey: string = process.env.SECRET_KEY || "";
const privateKey: string = process.env.ACCOUNT_PRIVATE_KEY || "";
const domain: string = process.env.AUTH_DOMAIN || "";
const isProd = process.env.NODE_ENV === "production";
console.log("SECRET_KEY:", process.env.SECRET_KEY);
console.log("ACCOUNT_PRIVATE_KEY:", process.env.ACCOUNT_PRIVATE_KEY);
console.log("AUTH_DOMAIN from enxt :", process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN);
const client = createThirdwebClient({ secretKey });

const thirdwebAuth = createAuth({
	domain: domain,
	client,
	adminAccount: privateKeyToAccount({ client, privateKey }),
});

export async function generatePayload(payload: GenerateLoginPayloadParams) {
	return thirdwebAuth.generatePayload(payload);
}

export async function login(payload: VerifyLoginPayloadParams) {
	const verifiedPayload = await thirdwebAuth.verifyPayload(payload);

	if (!verifiedPayload.valid) {
		throw new Error("Invalid wallet signature. Authentication failed.");
	}

	const walletAddress = verifiedPayload.payload.address;

	try {
		let user = await prisma.user.findUnique({
			where: {
				walletAddress: walletAddress,
			},
		});

		if (!user) {
			user = await prisma.user.create({
				data: {
					walletAddress: walletAddress,
					name: `User ${walletAddress.slice(0, 6)}`,
				},
			});
		}

		const jwt = await thirdwebAuth.generateJWT({
			payload: verifiedPayload.payload,
		});

		const c = cookies();
		c.set("jwt", jwt, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7,
			domain: domain
		});

	} catch (error) {
		console.error("Database error during login:", error);
		throw new Error("Database error during login.");
	}
}

export async function isLoggedIn() {
	const c = cookies();
	const jwt = c.get("jwt");

	if (!jwt?.value) {
		return false;
	}

	try {
		const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
		return authResult.valid;
	} catch (error) {
		console.error("JWT verification error:", error);
		c.delete("jwt");
		return false;
	}
}

export async function logout() {
	const c = cookies();
	c.delete("jwt");
}