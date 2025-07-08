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

export default function ConnectionButton({ path }: { path?: string }) {
    const wallets = [createWallet("io.metamask")];
    const router = useRouter();

    return (
        <ConnectButton
            client={client}
            accountAbstraction={{
                chain: sepolia,
                sponsorGas: true,
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
                    await login(params);
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