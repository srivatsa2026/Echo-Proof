"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import WalletButton from "../connection-button"
import { BlockchainAnimation } from "@/components/motion-animation/node-animation"
import { Logo } from "@/components/logo/logo"
import { useActiveWallet } from "thirdweb/react"
import axiosInstance from "@/lib/axios"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast" // <- useToast hook
import Cookies from "js-cookie" // at the top
import axios from "axios"

export default function SignInPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const activeWalletAddress = useActiveWallet()
  const router = useRouter()
  const { toast } = useToast() // <- instantiate toast


  const verifyUser = async () => {
    const address = activeWalletAddress?.getAccount()?.address
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet before verifying.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("/api/verify", {
        smart_wallet_address: address,
      })

      const verifiedUser = response.data.user
      console.log("the verified user", verifiedUser)
      if (!verifiedUser) {
        // Delete the jwt cookie using js-cookie
        Cookies.remove("jwt")

        toast({
          title: "Access Denied",
          description: "You are not a verified user. Redirecting to home.",
          variant: "destructive",
        })

        setTimeout(() => {
          router.push("/")
        }, 2000)
        return
      }

      setUser(verifiedUser)
      toast({
        title: "Verification successful",
        description: "Redirecting to your dashboard...",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      console.error("User verification failed:", error)
      toast({
        title: "Verification failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center">
        <motion.div
          className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-8"
          >
            <Logo />

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-[#F0F0F0] mb-2 leading-tight">
                Welcome to <span className="text-[#FF6600]">Echo Proff</span>
              </h1>

              <p className="text-[#C4C4C4] text-base mb-2 max-w-md leading-relaxed">
                Secure, private, decentralized meetings — powered by blockchain and encrypted storage.
              </p>

              <p className="text-[#C4C4C4] text-base mb-6 max-w-md leading-relaxed">
                Own your conversations. Break free from centralized systems with Echo Proff.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <WalletButton />
              <button
                onClick={verifyUser}
                disabled={loading}
                className="bg-[#FF6600] hover:bg-[#FF5500] transition text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Wallet"}
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 p-8 md:p-16 flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <BlockchainAnimation />
        </motion.div>
      </main>
    </div>
  )
}
