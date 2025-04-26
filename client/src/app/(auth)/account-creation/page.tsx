"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function WaitingPage() {
    const [progress, setProgress] = useState(0)
    const router = useRouter()
    // Simulate progress
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 1
            })
        }, 150)

        return () => {
            router.push("/dashboard")
            clearInterval(interval)
        }
    }, [])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <motion.div
                    className="bg-transparent backdrop-blur-lg rounded-xl p-6 shadow-xl border border-zinc-700"
                    animate={{
                        boxShadow: [
                            "0px 0px 0px rgba(249, 115, 22, 0)",
                            "0px 0px 15px rgba(249, 115, 22, 0.3)",
                            "0px 0px 0px rgba(249, 115, 22, 0)",
                        ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                    <div className="flex flex-col items-center text-center space-y-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                            <Loader2 className="h-12 w-12 text-orange-500" />
                        </motion.div>

                        <div className="w-full bg-zinc-700 h-2 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-orange-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.2 }}
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-medium text-white">Creating Your Account</h2>

                            <motion.p
                                className="text-zinc-300"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                Please wait a moment, we are creating a record of you in our database.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="mt-4 p-3 bg-zinc-900/50 border border-orange-500/20 rounded-lg"
                            >
                                <p className="text-orange-400 text-sm font-medium">
                                    Important: Please use this same wallet address if you login again instead of signup.
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="mt-4 p-3 bg-zinc-900/50 border border-orange-500/20 rounded-lg"
                            >
                                <p className="text-orange-400 text-sm font-medium">
                                    Important: ⚠️ A smart wallet is created for your account and mapped to your connected wallet. Stick to the same wallet for seamless access.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
