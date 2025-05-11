"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton, useAdminWallet } from "thirdweb/react";
import { client } from "../client";
import {
    generatePayload,
    isLoggedIn,
    login,
    logout,
} from "@/actions/auth";
import { createWallet } from "thirdweb/wallets";
import { sepolia } from "thirdweb/chains";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { registerUser } from "@/store/reducers/userSlice";

export default function ConnectionButton({ type = "signin" }) {
    const dispatch = useDispatch();
    const wallets = [createWallet("io.metamask")];
    const router = useRouter();
    const adminWallet = useAdminWallet();
    const { toast } = useToast();

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
                    if (type === "signup") {
                        dispatch(
                            registerUser({
                                smartWalletAddress: address,
                                walletAddress: adminWallet?.getAccount()?.address,
                                toast,
                                router,
                            })
                        );
                    }

                    return generatePayload({ address, chainId: 11155111 });
                },
                doLogin: async (params) => {
                    await login(params);
                    router.push("/dashboard");
                },
                doLogout: async () => {
                    await logout();
                    router.push("/signin");
                },
            }}
        />
    );
}
