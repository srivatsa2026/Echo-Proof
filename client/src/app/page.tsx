"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Video,
  MessageCircle,
  Wallet,
  Brain,
  Check,
  Star,
  Github,
  Twitter,
  ChevronRight,
  Play,
  Sparkles,
  ArrowRight,
  Users,
  Lock,
  Zap,
} from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
}

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: Video,
      title: "Decentralized Video Meetings",
      description: "Host secure video conferences with permanent IPFS storage and zero central authority control.",
      color: "text-[#ff6600]",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chatrooms",
      description: "Socket.io powered messaging with immutable blockchain metadata logging for transparency.",
      color: "text-[#ff8533]",
    },
    {
      icon: Wallet,
      title: "Wallet Authentication",
      description: "Seamless Web3 login with MetaMask and other wallets. No passwords, just your keys.",
      color: "text-[#ff6600]",
    },
    {
      icon: Brain,
      title: "AI Meeting Summaries",
      description: "Automatically generated intelligent summaries and insights from your conversations.",
      color: "text-[#ff8533]",
    },
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Connect Wallet",
      description: "Link your MetaMask or preferred Web3 wallet for secure authentication.",
      icon: Wallet,
    },
    {
      step: "02",
      title: "Create Room",
      description: "Start video meetings or join chatrooms with verified participants.",
      icon: Users,
    },
    {
      step: "03",
      title: "Communicate",
      description: "All data encrypted and stored on IPFS with blockchain metadata.",
      icon: Lock,
    },
    {
      step: "04",
      title: "Get Insights",
      description: "Receive AI-powered summaries and analytics automatically.",
      icon: Zap,
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Blockchain Developer",
      content: "EchoProof revolutionized how our DAO conducts meetings. Complete data ownership is game-changing.",
      avatar: "/placeholder.svg?height=48&width=48",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Crypto Startup Founder",
      content: "The AI summaries are incredibly accurate. We've saved hours and never miss important decisions.",
      avatar: "/placeholder.svg?height=48&width=48",
      rating: 5,
    },
    {
      name: "Elena Volkov",
      role: "DeFi Protocol Lead",
      content: "Finally, a communication platform that aligns with Web3 principles. No more centralized platforms.",
      avatar: "/placeholder.svg?height=48&width=48",
      rating: 5,
    },
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for individuals and small teams",
      features: [
        "Up to 5 participants per meeting",
        "Basic chat functionality",
        "1GB IPFS storage",
        "Standard AI summaries",
        "Community support",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "29",
      description: "Advanced features for growing organizations",
      features: [
        "Unlimited participants",
        "Advanced chat with file sharing",
        "100GB IPFS storage",
        "Premium AI insights & analytics",
        "Priority support",
        "Custom branding",
        "Advanced security features",
      ],
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-hidden">
      {/* Animated Background */}
      <motion.div className="fixed inset-0 opacity-10" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6600]/5 via-transparent to-[#ff6600]/3" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#ff6600]/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#ff6600]/3 rounded-full blur-3xl" />
      </motion.div>

      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[#0d0d0d]/90 backdrop-blur-md border-b border-[#ff6600]/20" : "bg-transparent"
          }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-[#ff6600] to-[#ff8533] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
              EchoProof
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm hover:text-[#ff6600] transition-colors">
              Home
            </Link>
            <Link href="/learn-more" className="text-sm hover:text-[#ff6600] transition-colors">
              Learn More
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-[#ff6600] transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-[#ff6600] transition-colors"
            >
              Twitter
            </a>
          </div>

          <motion.div {...scaleOnHover}>
            <Link
              href="/signin"
              className="bg-gradient-to-r from-[#ff6600] to-[#ff8533] hover:from-[#ff8533] hover:to-[#ff6600] text-white border-0 text-sm px-4 py-2">
              Launch App
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 bg-[#ff6600]/20 text-[#ff6600] border-[#ff6600]/30 text-xs">
              🚀 Now in Beta - Join the Revolution
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Decentralized
              <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                Communication
              </span>
              Reimagined
            </h1>

            <p className="text-base md:text-lg text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
              Experience the future of digital communication with blockchain-secured meetings, IPFS storage, and
              AI-powered insights. Own your data, control your conversations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <motion.div {...scaleOnHover}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#ff6600] to-[#ff8533] hover:from-[#ff8533] hover:to-[#ff6600] text-white border-0 px-6 py-3 text-base"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </motion.div>

              <motion.div {...scaleOnHover}>
                <Link href="/learn-more">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#ff6600]/50 text-[#ff6600] hover:bg-[#ff6600]/10 px-6 py-3 text-base bg-transparent"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-8 w-16 h-16 border border-[#ff6600]/20 rounded-full"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 3, repeat: Number.POSITIVE_INFINITY },
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-8 w-12 h-12 bg-[#ff6600]/10 rounded-lg"
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for the
              <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                Decentralized Era
              </span>
            </h2>
            <p className="text-base text-gray-300 max-w-xl mx-auto">
              Built on cutting-edge Web3 technology to give you complete control over your communications
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-gray-900/30 border-gray-800 hover:border-[#ff6600]/50 transition-all duration-300 h-full group">
                  <CardHeader className="pb-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff6600]/20 to-[#ff8533]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-300 text-sm">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-900/20">
        <div className="container mx-auto">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How EchoProof
              <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-base text-gray-300 max-w-xl mx-auto">
              Get started in minutes with our simple, secure process
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {howItWorks.map((step, index) => (
              <motion.div key={index} variants={fadeInUp} className="relative">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600] to-[#ff8533] rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {step.step}
                  </div>
                  <div className="w-8 h-8 bg-[#ff6600]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-4 h-4 text-[#ff6600]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
                  <p className="text-sm text-gray-300">{step.description}</p>
                </div>

                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full">
                    <ChevronRight className="w-5 h-5 text-[#ff6600] mx-auto" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent
              <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-base text-gray-300 max-w-xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card
                  className={`relative h-full ${plan.popular
                    ? "bg-gradient-to-br from-[#ff6600]/10 to-[#ff8533]/5 border-[#ff6600]/50"
                    : "bg-gray-900/30 border-gray-800"
                    } hover:border-[#ff6600]/50 transition-all duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white text-xs">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                    <div className="mt-3">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-gray-400 text-sm">/month</span>
                    </div>
                    <CardDescription className="text-gray-300 mt-2 text-sm">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-300 text-sm">
                          <Check className="w-4 h-4 text-[#ff6600] mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <motion.div {...scaleOnHover}>
                      <Button
                        className={`w-full ${plan.popular
                          ? "bg-gradient-to-r from-[#ff6600] to-[#ff8533] hover:from-[#ff8533] hover:to-[#ff6600] text-white"
                          : "bg-gray-800 hover:bg-gray-700 text-white"
                          } text-sm`}
                        size="lg"
                      >
                        {plan.name === "Free" ? "Get Started" : "Start Free Trial"}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-900/20">
        <div className="container mx-auto">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by
              <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                Web3 Leaders
              </span>
            </h2>
            <p className="text-base text-gray-300 max-w-xl mx-auto">
              See what industry pioneers are saying about EchoProof
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-gray-900/30 border-gray-800 hover:border-[#ff6600]/50 transition-all duration-300 h-full">
                  <CardContent className="p-5">
                    <div className="flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#ff6600] fill-current" />
                      ))}
                    </div>

                    <p className="text-gray-300 mb-4 italic text-sm">"{testimonial.content}"</p>

                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
                        <p className="text-[#ff6600] text-xs">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/30 border-t border-gray-800 py-10 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-[#ff6600] to-[#ff8533] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                  EchoProof
                </span>
              </Link>
              <p className="text-gray-400 mb-3 text-sm">
                The future of decentralized communication is here. Own your data, control your conversations.
              </p>
              <div className="flex space-x-3">
                <motion.a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...scaleOnHover}
                  className="text-gray-400 hover:text-[#ff6600]"
                >
                  <Github className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...scaleOnHover}
                  className="text-gray-400 hover:text-[#ff6600]"
                >
                  <Twitter className="w-4 h-4" />
                </motion.a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-base">Navigation</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/" className="hover:text-[#ff6600] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/learn-more" className="hover:text-[#ff6600] transition-colors">
                    Learn More
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-base">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-[#ff6600] transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ff6600] transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ff6600] transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-base">Community</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#ff6600] transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#ff6600] transition-colors"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs">© 2024 EchoProof. All rights reserved.</p>
            <div className="flex space-x-4 text-xs text-gray-400 mt-3 md:mt-0">
              <a href="#" className="hover:text-[#ff6600] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#ff6600] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
