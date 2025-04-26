"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, ArrowLeft, Router } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConnectButton, useActiveWallet } from "thirdweb/react";
import { client } from "../../client";
import { generatePayload, isLoggedIn, login, logout } from "@/actions/auth";
import { defineChain } from "thirdweb";
import { sepolia } from "thirdweb/chains"
import { useRouter } from "next/navigation"
import { useConnectedWallets } from "thirdweb/react"
import axios from "axios"
import Cookies from "js-cookie"

export default function SignInPage() {
  const [user, setUser] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false);
  const { toast } = useToast()
  const router = useRouter()
  const wallets = useConnectedWallets()

  useEffect(() => {
    if (wallets?.length === 2 ) {
      const checkUserExists = async () => {
        try {
          const data = {
            wallet_address: wallets[0]?.getAccount()?.address,
            smart_wallet_address: wallets[1]?.getAccount()?.address
          }

          const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/get_user`, data)

          console.log("response is ", response)

          // Check if the response has user data based on the structure you provided
          const cookie = Cookies.get('jwt')
          if (response.data.user && cookie) {
            // User exists, set state and redirect
            setUser(true)
            router.push("/dashboard")
          } else {
            // User doesn't exist, clear cookies
            Cookies.remove('jwt')

            toast({
              title: "Account not found",
              description: "Please sign up to create an account.",
              variant: "destructive"
            })
            router.push("/signup")
          }
        } catch (error) {
          console.error("Error checking user:", error)
          // Clear cookies on error as well
          Cookies.remove('jwt')

          toast({
            title: "Error",
            description: "Failed to verify account. Please try again.",
            variant: "destructive"
          })
        }
      }

      checkUserExists()
    }
  }, [wallets, router, toast])

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
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Connect your wallet to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ConnectButton
                client={client}
                accountAbstraction={{
                  chain: sepolia,
                  // chain: defineChain(17000),
                  sponsorGas: true,
                }}
                auth={{
                  isLoggedIn: async (address) => {
                    console.log("checking if logged in!", { address });
                    return await isLoggedIn();
                  },
                  doLogin: async (params) => {
                    console.log("logging in!");
                    setLoggedIn(true)
                    await login(params);
                  },
                  getLoginPayload: async ({ address }) => generatePayload({ address, chainId: 11155111 }),
                  doLogout: async () => {
                    console.log("logging out!");
                    await logout();
                    setLoggedIn(false)
                    router.push("/signin")
                  },
                }}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-muted-foreground text-center w-full">
                Please {" "}
                <Link href="/signup" className="underline hover:text-primary">
                  Sign-up
                </Link>{" "}
                if in case you don't have an account
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}