"use server";
import { cookies } from "next/headers";
import {
	type GenerateLoginPayloadParams,
	type VerifyLoginPayloadParams,
	createAuth,
} from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";
import { createOrVerifyUser } from "./user";



const secretKey: string = process.env.SECRET_KEY || ""
const privateKey: string = process.env.ACCOUNT_PRIVATE_KEY || ""
const client = createThirdwebClient({
	secretKey,
});

const thirdwebAuth = createAuth({
	domain: "localhost:3000",
	client,
	adminAccount: privateKeyToAccount({ client, privateKey }),
	login: {
		statement: "Click Sign only means you have proved this wallet is owned by you.We will use the public wallet address to fetch your NFTs.This request will not trigger any blockchain transaction or cost of any gas fees.",
		version: "1",
		uri: "localhost:3000",
	},
});

export async function generatePayload(payload: GenerateLoginPayloadParams) {
	console.log("the payload in genreate payload", payload)
	return thirdwebAuth.generatePayload(payload);
}


export async function login(payload: VerifyLoginPayloadParams) {

	const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
	console.log("VEROFEEEEEEEEE", verifiedPayload)
	
	
	if (verifiedPayload.valid) {
		
		console.log("VEROFEEEEEEEEE", )
		await createOrVerifyUser(verifiedPayload.payload.address)
		const jwt = await thirdwebAuth.generateJWT({
			payload: verifiedPayload.payload,
		});
		const c = await cookies();
		c.set("jwt", jwt);
	}
}

export async function isLoggedIn() {
	const c = await cookies();
	const jwt = c.get("jwt");
	console.log(jwt);
	if (!jwt?.value) {
		return false;
	}

	const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
	if (!authResult.valid) {
		return false;
	}
	return true;
}

export async function logout() {
	const c = await cookies();
	c.delete("jwt");
}
