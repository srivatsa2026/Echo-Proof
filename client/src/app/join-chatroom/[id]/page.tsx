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
import { MessageCircle, Hash, ArrowRight, Users, Globe, Lock, Activity, Loader2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { checkJoinChatroom, joinChatroom } from "@/store/reducers/chatroomSlice"
import { getUserDetails, updateUserProfile } from "@/store/reducers/userSlice"
import ConnectionButton from "../../(auth)/connection-button"
import Cookies from "js-cookie"
import { getSocket } from "@/lib/socket/chatroom-socket"
import { useToast } from "@/hooks/use-toast"

interface ChatroomDetails {
    id: string
    name: string
    description: string
    category: string
    activeUsers: number
    totalMembers: number
    isPublic: boolean
    createdBy: string
    createdAt: string
    lastActivity: string
    rules: string[]
}

export default function JoinChatroomPage() {
    const [username, setUsername] = useState("")
    const [isJoining, setIsJoining] = useState(false)
    const dispatch = useDispatch()
    const router = useRouter()
    const params = useParams()
    const chatroomId = params.id as string

    // Redux state
    const chatroom = useSelector((state: any) => state.chatroom)
    const user = useSelector((state: any) => state.user)
    const { loading, error, title, active, tokenGated, tokenAddress, tokenStandard, userStatus, members = [] } = chatroom
    const { isAuthenticated } = user

    // Ensure user details are loaded if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            dispatch<any>(getUserDetails())
        }
    }, [isAuthenticated, dispatch])

    // Check for 'jwt' cookie
    const [hasJwt, setHasJwt] = useState(false)
    useEffect(() => {
        setHasJwt(!!Cookies.get("jwt"))
    }, [])

    // Fetch chatroom join eligibility/details on mount
    useEffect(() => {
        if (chatroomId) {
            dispatch<any>(checkJoinChatroom({ roomId: chatroomId }))
        }
    }, [chatroomId, dispatch])

    const [activeParticipants, setActiveParticipants] = useState<number>(members.length)

    // Socket: Listen for participant updates
    useEffect(() => {
        let socket: any = null;
        if (username) {
            socket = getSocket(username);
            const handleConnect = () => {
                // Emit join event after connection
                socket.emit("join", {
                    room: chatroomId,
                    username: username
                });
            };
            const handleConnectError = (err: any) => {
                // Optionally handle connection error (e.g., show toast or set error state)
                console.error("Socket connection error:", err);
            };
            const handleDisconnect = (reason: any) => {
                // Optionally handle disconnect (e.g., show toast or set error state)
                console.warn("Socket disconnected:", reason);
            };
            socket.on("connect", handleConnect);
            socket.on("connect_error", handleConnectError);
            socket.on("disconnect", handleDisconnect);
            // Listen for join_success (initial join)
            socket.on("join_success", (data: { participants: any[] }) => {
                if (data && Array.isArray(data.participants)) {
                    setActiveParticipants(data.participants.length)
                }
            });
            // Listen for participants_list (full update)
            socket.on("participants_list", (data: { participants: any[] }) => {
                if (data && Array.isArray(data.participants)) {
                    setActiveParticipants(data.participants.length)
                }
            });
            // Listen for user_joined (increment)
            socket.on("user_joined", (data: { participants: any[] }) => {
                if (data && Array.isArray(data.participants)) {
                    setActiveParticipants(data.participants.length)
                }
            });
            // Listen for user_left (decrement)
            socket.on("user_left", (data: { participants: any[] }) => {
                if (data && Array.isArray(data.participants)) {
                    setActiveParticipants(data.participants.length)
                }
            });
        }
        return () => {
            if (socket) {
                socket.off("connect")
                socket.off("connect_error")
                socket.off("disconnect")
                socket.off("join_success")
                socket.off("participants_list")
                socket.off("user_joined")
                socket.off("user_left")
            }
        }
    }, [username, chatroomId])

    const { toast } = useToast();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim()) return
        setIsJoining(true)
        try {
            // Update user profile with the chosen username
            await dispatch<any>(updateUserProfile({ name: username, toast })).unwrap()
            // Initiate socket connection with username
            getSocket(username)
            await dispatch<any>(joinChatroom({ roomId: chatroomId })).unwrap()
            // Optionally redirect or show success
            router.push(`/chatroom/${chatroomId}`)
        } catch (err) {
            // Error handled by thunk
        } finally {
            setIsJoining(false)
        }
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
                <title>Join Chatroom | EchoProof</title>
                <meta name="description" content="Join your professional chatroom community" />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Chatroom Details Card */}
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col justify-center">
                        <motion.div variants={itemVariants}>
                            <Card className="bg-gray-900/60 border-gray-700 shadow-2xl backdrop-blur-xl">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white text-xl flex items-center gap-3">
                                            {/* <Hash className="w-5 h-5 text-orange-500" /> */}
                                            Community Details
                                        </CardTitle>
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                                        ) : (
                                            active ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="text-green-400 text-sm font-medium">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                    <span className="text-red-400 text-sm font-medium">Inactive</span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {loading ? (
                                        <div className="space-y-3">
                                            <div className="h-6 bg-gray-700 rounded animate-pulse" />
                                            <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
                                            <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-2xl font-semibold text-white">{title}</h3>
                                                    {tokenGated && (
                                                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                                            Token Gated
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2 text-gray-300 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-orange-400" />
                                                        <span>Participants: {activeParticipants}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-orange-400" />
                                                        <span>Status: {active ? "Active" : "Inactive"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {tokenGated ? <Lock className="w-4 h-4 text-orange-400" /> : <Globe className="w-4 h-4 text-orange-400" />}
                                                        <span>{tokenGated ? "Token Gated" : "Public"}</span>
                                                    </div>
                                                    {tokenGated && (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs text-orange-300">Token Address:</span>
                                                                <span className="break-all">{tokenAddress}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs text-orange-300">Token Type:</span>
                                                                <span>{tokenStandard}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Guidelines/Rules Section */}
                                            <div className="mt-6 p-4 border border-orange-500/40 bg-orange-900/10 rounded-lg">
                                                <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                                                    <MessageCircle className="w-4 h-4" /> Guidelines & Rules
                                                </h4>
                                                <ul className="list-disc list-inside text-sm text-orange-200 space-y-1">
                                                    <li>Be respectful and courteous to all members.</li>
                                                    <li>No spamming, advertising, or self-promotion.</li>
                                                    <li>Keep discussions relevant to the chatroom topic.</li>
                                                    <li>Do not share personal or sensitive information.</li>
                                                    <li>Follow all community and platform policies.</li>
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Right: Connection/Login and Join Form Cards */}
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-8">
                        {/* Connection/Login Card */}
                        <motion.div variants={itemVariants}>
                            <Card className="bg-gray-900/60 border-gray-700 shadow-2xl backdrop-blur-xl">
                                <CardHeader className="text-center pb-4">
                                    <CardTitle className="text-white text-xl">Connect Your Wallet</CardTitle>
                                    <CardDescription className="text-gray-400">Sign in to join the community</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center gap-4">
                                    <ConnectionButton />
                                    {hasJwt ? (
                                        <div className="text-green-400 text-center font-semibold">
                                            You are logged in{user.smart_wallet_address ? (
                                                <> as <span className="font-mono">{user.smart_wallet_address}</span></>
                                            ) : null}.
                                        </div>
                                    ) : (
                                        <div className="text-orange-400 text-center font-semibold">
                                            To join the community, you must log in.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                        {/* Join Form Card */}
                        <motion.div variants={itemVariants}>
                            <Card className="bg-gray-900/60 border-gray-700 shadow-2xl backdrop-blur-xl">
                                <CardHeader className="text-center pb-4">
                                    <CardTitle className="text-white text-xl">Join Community</CardTitle>
                                    <CardDescription className="text-gray-400">Choose your display name for the community</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {userStatus && userStatus.isMember ? (
                                        <div className="text-green-400 text-center font-semibold">You are already a member of this chatroom.</div>
                                    ) : userStatus && !userStatus.canJoin ? (
                                        <div className="text-red-400 text-center font-semibold">You cannot join this chatroom.</div>
                                    ) : (
                                        <form onSubmit={handleJoin} className="space-y-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="username" className="text-white text-sm font-medium">
                                                    Display Name *
                                                </Label>
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    placeholder="e.g., TechEnthusiast"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500/20 h-12 rounded-xl text-base"
                                                    required
                                                    disabled={isJoining || loading || !isAuthenticated}
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Choose a name that represents you professionally in this community
                                                </p>
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={!username.trim() || isJoining || loading || !isAuthenticated}
                                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold h-12 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                            >
                                                {isJoining ? (
                                                    <div className="flex items-center gap-3">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Joining Community...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <Hash className="w-5 h-5" />
                                                        Join Community
                                                        <ArrowRight className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={itemVariants} className="text-center mt-6">
                            <p className="text-gray-500 text-sm">
                                Room ID: <span className="text-orange-500 font-mono text-base">{chatroomId}</span>
                            </p>
                            <p className="text-gray-600 text-xs mt-2">
                                By joining, you agree to follow our Community Guidelines and Terms of Service
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </>
    )
}
