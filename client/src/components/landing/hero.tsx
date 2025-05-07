"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background -z-10" />

      <motion.div className="container px-4 mx-auto text-center" variants={container} initial="hidden" animate="show">
        <motion.h1
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          variants={item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Decentralized <span className="text-primary">Communication</span> Platform
        </motion.h1>
        <motion.p
          className="max-w-2xl mx-auto text-muted-foreground text-lg mb-8"
          variants={item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Create secure chatrooms, host video meetings, and collaborate in real-time with EchoProof&#39;s decentralized
          platform.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/signin">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(249, 115, 22, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto"
              >
                Get Started
              </Button>
            </motion.div>
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-16 max-w-5xl mx-auto px-4"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden border border-border/50 bg-secondary/20 backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
              </svg>
              <p className="mt-4">Platform Preview</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
