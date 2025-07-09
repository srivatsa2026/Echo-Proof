"use client";

import { useRouter } from "next/navigation";
import { ConnectButton } from "thirdweb/react";
import { client } from "../client";
import {
    generatePayload,
    isLoggedIn,
    login,
    logout,
} from "@/actions/auth";
import { createWallet } from "thirdweb/wallets";
import { sepolia } from "thirdweb/chains";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { getUserDetails } from "@/store/reducers/userSlice";

export default function ConnectionButton({ path }: { path?: string }) {
    const wallets = [createWallet("io.metamask")];
    const router = useRouter();
    const dispatch = useDispatch();

    return (
        <ConnectButton
            client={client}
            // accountAbstraction={{
            //     chain: sepolia,
            //     sponsorGas: true,
            // }}

            appMetadata={{
                name: "EchoProof",
                url: "https://echoproof.xyz",
                description: "A decentralized, secure platform for AI-powered meetings and chatrooms.",
                logoUrl: "https://echoproof.xyz/logo.svg",
            }}

            wallets={wallets}
            auth={{
                isLoggedIn: async () => {
                    return await isLoggedIn();
                },
                getLoginPayload: async ({ address }) => {
                    return generatePayload({ address, chainId: 11155111 });
                },
                doLogin: async (params) => {
                    console.log("the login params in the connection button is ", params)
                    await login(params);

                    await dispatch<any>(getUserDetails());
                    if (path) {
                        router.push(`/${path}`);
                    }
                },
                doLogout: async () => {
                    await logout();
                    // Clear specific items
                    localStorage.removeItem("userId");
                    // localStorage.clear();

                    router.push("/signin");
                },
            }}
        />
    );
}