"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    Shield,
    Database,
    Globe,
    Lock,
    Zap,
    Users,
    Brain,
    Sparkles,
    Github,
    Twitter,
    Server,
    Layers,
    Key,
    Video,
    MessageCircle,
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

export default function LearnMorePage() {
    const architectureFeatures = [
        {
            icon: Database,
            title: "Hybrid Storage Architecture",
            description:
                "Blockchain stores metadata and access controls while IPFS handles video content for optimal performance and decentralization.",
            color: "text-[#ff6600]",
        },
        {
            icon: Lock,
            title: "End-to-End Encryption",
            description:
                "All communications are encrypted before leaving your device. Only participants with proper keys can decrypt content.",
            color: "text-[#ff8533]",
        },
        {
            icon: Server,
            title: "Distributed Infrastructure",
            description: "No single point of failure. Your data is distributed across multiple nodes ensuring 99.9% uptime.",
            color: "text-[#ff6600]",
        },
        {
            icon: Key,
            title: "Cryptographic Authentication",
            description: "Wallet-based identity verification ensures only authorized users can access your communications.",
            color: "text-[#ff8533]",
        },
    ]

    const techStack = [
        {
            category: "Frontend",
            technologies: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion"],
            icon: Layers,
        },
        {
            category: "Backend",
            technologies: ["Flask WebSocket", "Socket.io", "Python", "Redis"],
            icon: Server,
        },
        {
            category: "Web3",
            technologies: ["Thirdweb SDK", "IPFS", "Ethereum", "MetaMask"],
            icon: Globe,
        },
        {
            category: "Database",
            technologies: ["Supabase", "PostgreSQL", "Blockchain Metadata"],
            icon: Database,
        },
    ]

    const whyDecentralized = [
        {
            icon: Shield,
            title: "Resilience",
            description:
                "No single point of failure means your communications remain available even if individual nodes go down.",
        },
        {
            icon: Lock,
            title: "Privacy",
            description: "Your data isn't stored on corporate servers. You control who has access to your conversations.",
        },
        {
            icon: Users,
            title: "Ownership",
            description: "True data ownership means you can export, migrate, or delete your data at any time.",
        },
        {
            icon: Zap,
            title: "Censorship Resistance",
            description:
                "Decentralized architecture makes it impossible for any single entity to censor your communications.",
        },
    ]

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">
            {/* Navigation */}
            <motion.nav
                className="fixed top-0 w-full z-50 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-[#ff6600]/20"
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
                        <Link href="/learn-more" className="text-sm text-[#ff6600]">
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
                        <Button className="bg-gradient-to-r from-[#ff6600] to-[#ff8533] hover:from-[#ff8533] hover:to-[#ff6600] text-white border-0 text-sm px-4 py-2">
                            Launch App
                        </Button>
                    </motion.div>
                </div>
            </motion.nav>

            {/* Header Section */}
            <section className="pt-20 pb-12 px-4 bg-gradient-to-br from-[#ff6600]/5 via-transparent to-[#ff8533]/5">
                <div className="container mx-auto">
                    <motion.div className="max-w-4xl mx-auto text-center" {...fadeInUp}>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Deep Dive into
                            <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                                EchoProof Technology
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Discover how EchoProof leverages cutting-edge Web3 technology to create the most secure, private, and
                            resilient communication platform ever built.
                        </p>

                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            <Badge className="bg-[#ff6600]/20 text-[#ff6600] border-[#ff6600]/30 text-xs">Blockchain</Badge>
                            <Badge className="bg-[#ff6600]/20 text-[#ff6600] border-[#ff6600]/30 text-xs">IPFS</Badge>
                            <Badge className="bg-[#ff6600]/20 text-[#ff6600] border-[#ff6600]/30 text-xs">
                                End-to-End Encryption
                            </Badge>
                            <Badge className="bg-[#ff6600]/20 text-[#ff6600] border-[#ff6600]/30 text-xs">AI-Powered</Badge>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Architecture Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <motion.div className="text-center mb-12" {...fadeInUp}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Revolutionary
                            <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                                Architecture
                            </span>
                        </h2>
                        <p className="text-base text-gray-300 max-w-2xl mx-auto">
                            EchoProof combines the best of blockchain technology with practical performance considerations to deliver
                            a truly decentralized communication experience.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 gap-6 mb-12"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        {architectureFeatures.map((feature, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card className="bg-gray-900/30 border-gray-800 hover:border-[#ff6600]/50 transition-all duration-300 h-full">
                                    <CardHeader className="pb-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff6600]/20 to-[#ff8533]/20 flex items-center justify-center mb-3">
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

                    <motion.div className="bg-gray-900/20 rounded-xl p-6" {...fadeInUp}>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Database className="w-5 h-5 text-[#ff6600] mr-2" />
                            Hybrid Storage Model
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-base font-semibold text-[#ff6600] mb-2">Blockchain Layer</h4>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• Meeting metadata and access controls</li>
                                    <li>• Participant verification records</li>
                                    <li>• Immutable audit trails</li>
                                    <li>• Smart contract governance</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-base font-semibold text-[#ff6600] mb-2">IPFS Layer</h4>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• Video and audio content storage</li>
                                    <li>• File sharing and attachments</li>
                                    <li>• Distributed content delivery</li>
                                    <li>• Redundant data replication</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Security Model Section */}
            <section className="py-16 px-4 bg-gray-900/20">
                <div className="container mx-auto">
                    <motion.div className="text-center mb-12" {...fadeInUp}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Military-Grade
                            <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                                Security Model
                            </span>
                        </h2>
                        <p className="text-base text-gray-300 max-w-2xl mx-auto">
                            Every aspect of EchoProof is designed with security-first principles, ensuring your communications remain
                            private and tamper-proof.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        <motion.div variants={fadeInUp}>
                            <Card className="bg-gray-900/30 border-gray-800 h-full">
                                <CardHeader className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600]/20 to-[#ff8533]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Lock className="w-6 h-6 text-[#ff6600]" />
                                    </div>
                                    <CardTitle className="text-lg text-white">Encryption</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• Perfect forward secrecy</li>
                                        <li>• Zero-knowledge architecture</li>
                                        <li>• Client-side key generation</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <Card className="bg-gray-900/30 border-gray-800 h-full">
                                <CardHeader className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600]/20 to-[#ff8533]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Key className="w-6 h-6 text-[#ff6600]" />
                                    </div>
                                    <CardTitle className="text-lg text-white">Authentication</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• Wallet-based identity verification</li>
                                        <li>• Multi-signature support</li>
                                        <li>• Hardware wallet compatibility</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <Card className="bg-gray-900/30 border-gray-800 h-full">
                                <CardHeader className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600]/20 to-[#ff8533]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Shield className="w-6 h-6 text-[#ff6600]" />
                                    </div>
                                    <CardTitle className="text-lg text-white">Privacy</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• No personal data collection</li>
                                        <li>• Anonymous participation options</li>
                                        <li>• Metadata minimization</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <motion.div className="text-center mb-12" {...fadeInUp}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Modern
                            <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                                Tech Stack
                            </span>
                        </h2>
                        <p className="text-base text-gray-300 max-w-2xl mx-auto">
                            Built with the latest technologies to ensure performance, scalability, and developer experience.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        {techStack.map((stack, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card className="bg-gray-900/30 border-gray-800 hover:border-[#ff6600]/50 transition-all duration-300 h-full">
                                    <CardHeader className="text-center pb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#ff6600]/20 to-[#ff8533]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <stack.icon className="w-5 h-5 text-[#ff6600]" />
                                        </div>
                                        <CardTitle className="text-lg text-white">{stack.category}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <ul className="text-sm text-gray-300 space-y-1">
                                            {stack.technologies.map((tech, techIndex) => (
                                                <li key={techIndex}>• {tech}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Why Decentralized Section */}
            <section className="py-16 px-4 bg-gray-900/20">
                <div className="container mx-auto">
                    <motion.div className="text-center mb-12" {...fadeInUp}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Why Choose
                            <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                                Decentralized?
                            </span>
                        </h2>
                        <p className="text-base text-gray-300 max-w-2xl mx-auto">
                            Decentralization isn&apos;t just a buzzword—it&apos;s a fundamental shift toward user empowerment and digital
                            sovereignty.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        {whyDecentralized.map((reason, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card className="bg-gray-900/30 border-gray-800 hover:border-[#ff6600]/50 transition-all duration-300 h-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#ff6600]/20 to-[#ff8533]/20 rounded-lg flex items-center justify-center">
                                                <reason.icon className="w-5 h-5 text-[#ff6600]" />
                                            </div>
                                            <CardTitle className="text-lg text-white">{reason.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <CardDescription className="text-gray-300 text-sm">{reason.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Deep Dive */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <motion.div className="text-center mb-12" {...fadeInUp}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Feature
                            <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                                Deep Dive
                            </span>
                        </h2>
                    </motion.div>

                    <motion.div
                        className="space-y-8"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        <motion.div variants={fadeInUp}>
                            <Card className="bg-gray-900/30 border-gray-800">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <Video className="w-6 h-6 text-[#ff6600]" />
                                        <CardTitle className="text-xl text-white">Decentralized Video Meetings</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-base font-semibold text-[#ff6600] mb-2">How it Works</h4>
                                            <p className="text-sm text-gray-300 mb-3">
                                                Video streams are encrypted client-side and stored on IPFS nodes. Meeting metadata, including
                                                participant lists and access controls, are recorded on the blockchain for transparency and
                                                immutability.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-[#ff6600] mb-2">Benefits</h4>
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                <li>• Permanent, tamper-proof meeting records</li>
                                                <li>• No reliance on centralized servers</li>
                                                <li>• Automatic redundancy and backup</li>
                                                <li>• Global accessibility without restrictions</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <Card className="bg-gray-900/30 border-gray-800">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <MessageCircle className="w-6 h-6 text-[#ff6600]" />
                                        <CardTitle className="text-xl text-white">Real-time Chatrooms</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-base font-semibold text-[#ff6600] mb-2">Technology</h4>
                                            <p className="text-sm text-gray-300 mb-3">
                                                Socket.io enables real-time messaging while blockchain technology logs message metadata for
                                                verification and audit purposes. Messages are end-to-end encrypted before transmission.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-[#ff6600] mb-2">Features</h4>
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                <li>• Instant message delivery</li>
                                                <li>• Blockchain-verified message integrity</li>
                                                <li>• File sharing with IPFS storage</li>
                                                <li>• Message history preservation</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <Card className="bg-gray-900/30 border-gray-800">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <Brain className="w-6 h-6 text-[#ff6600]" />
                                        <CardTitle className="text-xl text-white">AI-Generated Meeting Summaries</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-base font-semibold text-[#ff6600] mb-2">AI Processing</h4>
                                            <p className="text-sm text-gray-300 mb-3">
                                                Advanced natural language processing analyzes meeting transcripts to generate comprehensive
                                                summaries, action items, and key insights while maintaining complete privacy.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-[#ff6600] mb-2">Output</h4>
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                <li>• Executive summaries</li>
                                                <li>• Action item extraction</li>
                                                <li>• Key decision highlights</li>
                                                <li>• Participant contribution analysis</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-[#ff6600]/5 via-transparent to-[#ff8533]/5">
                <div className="container mx-auto text-center">
                    <motion.div {...fadeInUp} className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Ready to Experience
                            <span className="block bg-gradient-to-r from-[#ff6600] to-[#ff8533] bg-clip-text text-transparent">
                                True Digital Freedom?
                            </span>
                        </h2>

                        <p className="text-base text-gray-300 mb-8 max-w-xl mx-auto">
                            Join the revolution in decentralized communication. Take control of your data, protect your privacy, and
                            experience the future of digital collaboration.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <motion.div {...scaleOnHover}>
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-[#ff6600] to-[#ff8533] hover:from-[#ff8533] hover:to-[#ff6600] text-white border-0 px-8 py-4 text-base"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Start Your Journey
                                </Button>
                            </motion.div>

                            <motion.div {...scaleOnHover}>
                                <Link href="/">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-[#ff6600]/50 text-[#ff6600] hover:bg-[#ff6600]/10 px-8 py-4 text-base bg-transparent"
                                    >
                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                        Back to Home
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
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
                            <h3 className="text-white font-semibold mb-3 text-base">Technology</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li>
                                    <a href="#" className="hover:text-[#ff6600] transition-colors">
                                        Architecture
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-[#ff6600] transition-colors">
                                        Security
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-[#ff6600] transition-colors">
                                        Documentation
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
