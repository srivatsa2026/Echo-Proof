'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ConnectButton, useAdminWallet } from "thirdweb/react"
import { client } from "../client"
import { generatePayload, isLoggedIn, login, logout } from "@/actions/auth"
import { createWallet } from "thirdweb/wallets"
import { sepolia } from "thirdweb/chains"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

export default function ConnectionButton({ type = 'signin' }) {
    const [loading, setLoading] = useState(false)
    const wallets = [createWallet("io.metamask")]
    const router = useRouter()
    const adminWallet = useAdminWallet()
    const { toast } = useToast()
    
    console.log("admin wallet", adminWallet?.getAccount()?.address)

    const registerUser = async (address) => {
        const wallet_address = adminWallet?.getAccount()?.address
        if (!address) {
            toast({ 
                title: "Wallet not connected", 
                description: "Please connect your wallet to register.", 
                variant: "destructive" 
            })
            return null
        }
        
        setLoading(true)
        try {
            const response = await axios.post("/api/register", {
                smart_wallet_address: address,
                wallet_address: wallet_address
            })
            
            console.log("the response from the registration is ", response.data)
            
            // Check if user was newly created or already existed
            if (response.status === 201) {
                // New user was created
                toast({ 
                    title: "Registration successful", 
                    description: "You can now sign in.", 
                    variant: "default" 
                })
                router.push("/dashboard")
            } else if (response.data?.message === "User already exists") {
                // User already exists
                toast({ 
                    title: "Account already exists", 
                    description: "Please sign in with your wallet.", 
                    variant: "default" 
                })
                router.push("/dashboard")
            }
            
            return response.data
        } catch (error) {
            console.error("Registration failed:", error)
            toast({ 
                title: "Registration failed", 
                description: error.response?.data?.message || "Please try again.", 
                variant: "destructive" 
            })
            return null
        } finally {
            setLoading(false)
        }
    }

    return (
        <ConnectButton
            client={client}
            accountAbstraction={{
                chain: sepolia,
                sponsorGas: true,
            }}
            wallets={wallets}
            auth={{
                isLoggedIn: async (address) => {
                    console.log("checking if logged in!", { address })
                    return await isLoggedIn()
                },
                doLogin: async (params) => {
                    console.log("logging in!", params)
                    
                    // Proceed with login - registration is handled in getLoginPayload for signup flow
                    await login(params)
                    console.log("User successfully logged in!")
                    
                    // Redirect to dashboard after successful login
                    router.push("/dashboard")
                },
                getLoginPayload: async ({ address }) => {
                    // If this is signup flow, register the user before generating the payload
                    if (type === 'signup') {
                        const result = await registerUser(address)
                        
                        // If user already exists, we can still proceed with login
                        // The user has been notified via toast to sign in
                    }
                    return generatePayload({ address, chainId: 11155111 })
                },
                doLogout: async () => {
                    console.log("logging out!")
                    await logout()
                    router.push("/signin")
                },
            }}
        />
    )
}