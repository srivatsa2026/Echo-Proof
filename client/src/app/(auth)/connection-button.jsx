'use client'
import { useRouter } from "next/navigation"
import { ConnectButton } from "thirdweb/react";
import { client } from "../client";
import { generatePayload, isLoggedIn, login, logout } from "@/actions/auth";
import { createWallet } from "thirdweb/wallets";
import { sepolia } from "thirdweb/chains";


export default function ConnectionButton() {
    const wallets = [createWallet("io.metamask")];
    const router = useRouter()

    

    return (
        <ConnectButton
            client={client}
            accountAbstraction={{
                chain: sepolia,
                // chain: defineChain(17000),
                sponsorGas: true,
            }}
            wallets={wallets}
            auth={{
                isLoggedIn: async (address) => {
                    console.log("checking if logged in!", { address });
                    return await isLoggedIn();
                },
                doLogin: async (params) => {
                    console.log("logging in!",params);
                    await login(params);
                },
                getLoginPayload: async ({ address }) => generatePayload({ address, chainId: 11155111 }),
                doLogout: async () => {
                    console.log("logging out!");
                    await logout();
                    router.push("/signin")
                },
            }}
        />
    )
}