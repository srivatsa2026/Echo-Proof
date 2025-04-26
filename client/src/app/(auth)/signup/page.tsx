"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useConnectedWallets } from "thirdweb/react"
import { ConnectButton, useActiveWallet } from "thirdweb/react"
import { client } from "../../client"
import { generatePayload, isLoggedIn, login, logout } from "@/actions/auth"
import { sepolia } from "thirdweb/chains"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignInPage() {
    const [isConnected, setIsConnected] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const router = useRouter()
    const wallets = useConnectedWallets()
    const activeWallet = useActiveWallet()

    console.log("the wallets len is ", wallets?.length)
    // Form state
    const [formData, setFormData] = useState({
        username: "",
        email: ""
    })
    const [formErrors, setFormErrors] = useState({
        username: "",
        email: ""
    })

    // Handle input changes
    const handleChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    /* FORM VALIDATION */
    const validateForm = () => {
        let valid = true
        const errors = {
            username: "",
            email: ""
        }

        // Username validation
        if (!formData.username.trim()) {
            errors.username = "Username is required"
            valid = false
        } else if (formData.username.length < 3) {
            errors.username = "Username must be at least 3 characters"
            valid = false
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = "Email is required"
            valid = false
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Please enter a valid email address"
            valid = false
        }

        setFormErrors(errors)
        return valid
    }

    // Create user function that makes a fake API call
    const createUser = async (userData: any) => {
        setIsSubmitting(true)
        try {
            const data = {
                username: userData.username,
                email: userData.email,
                wallet_address: wallets[0].getAccount()?.address,
                smart_wallet_address: wallets[1].getAccount()?.address
            }

            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/create_user`, data)
            console.log("repsonse", response)


            toast({
                title: "Account created!",
                description: response.data.message
            })

            // Now proceed with wallet login
            return true
        } catch (error) {
            console.error("Error creating user:", error)
            toast({
                variant: "destructive",
                title: "Error creating account",
                description: (error as any).response?.data?.message || "Something went wrong. Please try again.",
            })
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle form submission
    const handleSubmit = async (e: any) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        if (!activeWallet && wallets?.length !== 2) {
            toast({
                variant: "destructive",
                title: "Connect wallet first",
                description: "Please connect your wallet before creating an account.",
            })
            return
        }

        const userCreated = await createUser(formData)

        if (userCreated) {
            // This would be handled by the ConnectButton's auth logic
            // Just redirect to the next page for now
            router.push("/account-creation")
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="container mx-auto px-4 py-6">
                <Link href="/" className="inline-flex items-center text-sm hover:text-primary transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Sign Up</CardTitle>
                            <CardDescription>Create a new account by filling your details and connecting your wallet.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* User details form */}
                            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        placeholder="Enter your username"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                    {formErrors.username && (
                                        <p className="text-sm text-red-500">{formErrors.username}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {formErrors.email && (
                                        <p className="text-sm text-red-500">{formErrors.email}</p>
                                    )}
                                </div>
                                {/* Wallet connection */}
                                <div className="flex flex-col items-center">
                                    <p className="text-sm text-muted-foreground mb-2">Connect your wallet to continue</p>
                                    <ConnectButton

                                        client={client}
                                        accountAbstraction={{
                                            chain: sepolia,
                                            sponsorGas: true,
                                        }}
                                        auth={{
                                            isLoggedIn: async (address) => {
                                                console.log("checking if logged in!", { address });
                                                return await isLoggedIn();
                                            },
                                            doLogin: async (params) => {
                                                console.log("logging in!");
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
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Creating Account..." : "Create Account"}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <p className="text-xs text-muted-foreground text-center w-full">
                                Already have an account? {" "}
                                <Link href="/signin" className="underline hover:text-primary">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}