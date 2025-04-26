"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ConnectButton, useConnectedWallets } from "thirdweb/react"
import { client } from "../../client"
import { generatePayload, isLoggedIn, login, logout } from "@/actions/auth"
import { sepolia } from "thirdweb/chains"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"

export default function SignInPage() {
  const [user, setUser] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [verified, setVerified] = useState(false) // NEW: To track manual verification
  const { toast } = useToast()
  const router = useRouter()
  const wallets = useConnectedWallets()

  // Check login status initially
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isUserLoggedIn = await isLoggedIn()
        setLoggedIn(isUserLoggedIn)
        
        if (isUserLoggedIn && user && verified) {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error checking login status:", error)
      }
    }

    checkLoginStatus()
  }, [user, verified, router])

  // Manual trigger for verifying wallets
  const handleCheckWallet = async () => {
    if (wallets?.length !== 2) {
      toast({
        title: "Connect both wallets",
        description: "Please make sure both your personal wallet and smart wallet are connected.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsChecking(true)

      const data = {
        wallet_address: wallets[0]?.getAccount()?.address,
        smart_wallet_address: wallets[1]?.getAccount()?.address
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/get_user`, data)

      const cookie = Cookies.get('jwt')

      if (response.data.user && cookie) {
        setUser(true)
        setVerified(true) // Important!
        toast({
          title: "Verified",
          description: "Account verified successfully.",
          variant: "default"
        })
        router.push("/dashboard")
      } else {
        Cookies.remove('jwt')
        setUser(false)
        setVerified(false)
        toast({
          title: "Account not found",
          description: "Please sign up to create an account.",
          variant: "destructive"
        })
        router.push("/signup")
      }
    } catch (error) {
      console.error("Error checking user:", error)
      Cookies.remove('jwt')
      setUser(false)
      setVerified(false)
      toast({
        title: "Error",
        description: "Verification failed. No account found, or please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsChecking(false)
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
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Connect your wallet to access your account.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <ConnectButton
                  client={client}
                  accountAbstraction={{
                    chain: sepolia,
                    sponsorGas: true,
                  }}
                  auth={{
                    isLoggedIn: async (address) => {
                      console.log("checking if logged in!", { address })
                      return await isLoggedIn()
                    },
                    doLogin: async (params) => {
                      console.log("logging in!")
                      await login(params)
                      setLoggedIn(true)
                    },
                    getLoginPayload: async ({ address }) => generatePayload({ address, chainId: 11155111 }),
                    doLogout: async () => {
                      console.log("logging out!")
                      await logout()
                      setLoggedIn(false)
                      router.push("/signin")
                    },
                  }}
                />
              </div>

              {wallets?.length > 0 && (
                <div className="text-center text-sm">
                  {wallets.length === 1 && (
                    <p className="text-amber-500 mb-2">Please complete the wallet connection process.</p>
                  )}
                  {wallets.length === 2 && (
                    <p className="text-green-500 mb-2">Both wallets connected successfully!</p>
                  )}

                  <Button
                    onClick={handleCheckWallet}
                    disabled={isChecking || wallets.length !== 2}
                    className="mt-2"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Account"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <p className="text-xs text-muted-foreground text-center w-full">
                Please {" "}
                <Link href="/signup" className="underline hover:text-primary">
                  Sign-up
                </Link>{" "}
                if you don't have an account
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
