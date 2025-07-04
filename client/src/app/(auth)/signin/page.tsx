'use client'
import { motion } from "framer-motion"
import WalletButton from "../connection-button"
import { BlockchainAnimation } from "@/components/motion-animation/node-animation"
import { Logo } from "@/components/logo/logo"
import { useActiveWallet } from "thirdweb/react"
import { useRouter } from "next/navigation"
import { ArrowBigRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
  const activeWalletAddress = useActiveWallet()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center">
        {/* Left Section - Content */}
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
              <p className="text-[#C4C4C4] text-base mb-6 max-w-md leading-relaxed">
                Secure, private, decentralized meetings — powered by blockchain and encrypted storage.
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <WalletButton />
            </div>
            {
              activeWalletAddress && (
                <Button
                  variant="default"
                  onClick={() => router.push("/dashboard")}
                  className="flex flex-row mt-4 items-center px-4 py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <p className="text-base mb-0 max-w-md leading-relaxed mr-2">
                    Go to dashboard
                  </p>
                  <ArrowBigRight />
                </Button>
              )
            }
          </motion.div>
        </motion.div>

        {/* Right Section - Animation */}
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