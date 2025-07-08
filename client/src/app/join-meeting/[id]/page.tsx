"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, easeInOut } from "framer-motion"
import Head from "next/head"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Video, Users, ArrowRight, Clock, Shield, Calendar, MapPin, Loader2 } from "lucide-react"

interface MeetingDetails {
    id: string
    title: string
    host: string
    scheduledTime: string
    duration: string
    participants: number
    maxParticipants: number
    status: "scheduled" | "live" | "ended"
    isPrivate: boolean
    description: string
    location: string
}

export default function JoinMeetingPage() {
    const [username, setUsername] = useState("")
    const [isJoining, setIsJoining] = useState(false)
    const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const params = useParams()
    const meetingId = params.id as string

    // Fetch meeting details on component mount
    useEffect(() => {
        const fetchMeetingDetails = async () => {
            setIsLoadingDetails(true)
            try {
                // Simulate API call delay
                await new Promise((resolve) => setTimeout(resolve, 1200))

                // Mock API response
                const mockMeetingDetails: MeetingDetails = {
                    id: meetingId,
                    title: "Q4 Strategy Planning Session",
                    host: "Sarah Johnson",
                    scheduledTime: "2024-01-15T14:00:00Z",
                    duration: "60 minutes",
                    participants: 7,
                    maxParticipants: 25,
                    status: "live",
                    isPrivate: true,
                    description:
                        "Quarterly business review and strategic planning for the upcoming quarter. We'll discuss key metrics, goals, and action items.",
                    location: "Conference Room A / Virtual",
                }

                setMeetingDetails(mockMeetingDetails)
            } catch (err) {
                setError("Failed to load meeting details")
            } finally {
                setIsLoadingDetails(false)
            }
        }

        fetchMeetingDetails()
    }, [meetingId])

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim()) return

        setIsJoining(true)
        console.log("Joining meeting:", { meetingId, username, meetingDetails })

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setIsJoining(false)
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: easeInOut,
                staggerChildren: 0.15,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: easeInOut },
        },
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "live":
                return "bg-green-500"
            case "scheduled":
                return "bg-blue-500"
            case "ended":
                return "bg-gray-500"
            default:
                return "bg-gray-500"
        }
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
                <Card className="bg-red-900/20 border-red-800 max-w-md w-full">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-400">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>Join Meeting | EchoProof</title>
                <meta name="description" content="Join your professional meeting room" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-2xl">
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-6 shadow-2xl">
                            <Video className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Professional Meeting</h1>
                        <p className="text-gray-400 text-lg">Secure • Encrypted • Enterprise Grade</p>
                    </motion.div>

                    {/* Meeting Details Card */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <Card className="bg-gray-900/60 border-gray-700 shadow-2xl backdrop-blur-xl">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white text-xl flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-orange-500" />
                                        Meeting Details
                                    </CardTitle>
                                    {isLoadingDetails ? (
                                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                                    ) : (
                                        meetingDetails && (
                                            <Badge className={`${getStatusColor(meetingDetails.status)} text-white border-0`}>
                                                {meetingDetails.status.toUpperCase()}
                                            </Badge>
                                        )
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {isLoadingDetails ? (
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-700 rounded animate-pulse" />
                                        <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
                                        <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
                                    </div>
                                ) : (
                                    meetingDetails && (
                                        <>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">{meetingDetails.title}</h3>
                                                <p className="text-gray-400 text-sm leading-relaxed">{meetingDetails.description}</p>
                                            </div>

                                            <Separator className="bg-gray-700" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-3 text-gray-300">
                                                    <Users className="w-4 h-4 text-orange-500" />
                                                    <span>
                                                        Host: <strong className="text-white">{meetingDetails.host}</strong>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 text-gray-300">
                                                    <Clock className="w-4 h-4 text-orange-500" />
                                                    <span>
                                                        Duration: <strong className="text-white">{meetingDetails.duration}</strong>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 text-gray-300">
                                                    <Users className="w-4 h-4 text-orange-500" />
                                                    <span>
                                                        Participants:{" "}
                                                        <strong className="text-white">
                                                            {meetingDetails.participants}/{meetingDetails.maxParticipants}
                                                        </strong>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 text-gray-300">
                                                    <MapPin className="w-4 h-4 text-orange-500" />
                                                    <span>
                                                        Location: <strong className="text-white">{meetingDetails.location}</strong>
                                                    </span>
                                                </div>
                                            </div>

                                            {meetingDetails.isPrivate && (
                                                <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 p-3 rounded-lg">
                                                    <Shield className="w-4 h-4" />
                                                    <span className="text-sm">This is a private meeting with end-to-end encryption</span>
                                                </div>
                                            )}
                                        </>
                                    )
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Join Form */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-gray-900/60 border-gray-700 shadow-2xl backdrop-blur-xl">
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-white text-xl">Join Meeting</CardTitle>
                                <CardDescription className="text-gray-400">Enter your professional display name</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleJoin} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="username" className="text-white text-sm font-medium">
                                            Display Name *
                                        </Label>
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="e.g., John Smith"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500/20 h-12 rounded-xl text-base"
                                            required
                                            disabled={isJoining || isLoadingDetails}
                                        />
                                        <p className="text-xs text-gray-500">This name will be visible to all meeting participants</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={!username.trim() || isJoining || isLoadingDetails}
                                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold h-12 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                    >
                                        {isJoining ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Joining Meeting...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Video className="w-5 h-5" />
                                                Join Meeting
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} className="text-center mt-6">
                        <p className="text-gray-500 text-sm">
                            Meeting ID: <span className="text-orange-500 font-mono text-base">{meetingId}</span>
                        </p>
                        <p className="text-gray-600 text-xs mt-2">
                            By joining, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </>
    )
}
