// 'use client'
// import React, { useState } from 'react'
// import { Card, CardContent } from '../ui/card'
// import { Input } from '../ui/input'
// import { motion } from 'framer-motion'
// import { Button } from '../ui/button'
// import { useToast } from '@/hooks/use-toast'
// import { useRouter } from 'next/navigation'
// import axios from 'axios'
// import { Copy } from 'lucide-react'

// export default function JoinChatroom({ roomId }: { roomId?: string }) {
//     const { toast } = useToast()
//     const router = useRouter()
//     const [sessionId, setSessionId] = useState(roomId || '')
//     const [isCopying, setIsCopying] = useState(false)

//     const handleJoin = async () => {
//         const room = sessionId.trim() || roomId?.trim()

//         if (!room) {
//             toast({
//                 title: "Missing Session ID",
//                 description: "Please enter a valid session ID to join the meeting.",
//                 variant: "destructive",
//             })
//             return
//         }

//         try {
//             const response = await axios.post('/api/join-chatroom', { roomId: room }, { withCredentials: true })
//             console.log("the response from the join room is ", response)
//             if (response.data.success) {
//                 toast({
//                     title: "Joining...",
//                     description: "Redirecting to the chatroom.",
//                 })
//                 router.push(`/chatroom/${room}`)
//             } else {
//                 toast({
//                     title: "Inactive Room",
//                     description: response.data.message || "The session might be terminated or inactive.",
//                     variant: "destructive",
//                 })
//             }
//         } catch (err: any) {
//             console.error("Error checking room status:", err)
//             toast({
//                 title: "Error",
//                 description: err.response?.data?.message || "Something went wrong while checking the room status.",
//                 variant: "destructive",
//             })
//         }
//     }

//     const handleCopy = async () => {
//         if (!sessionId.trim()) return
//         try {
//             setIsCopying(true)
//             await navigator.clipboard.writeText(sessionId)
//             toast({
//                 title: "Copied!",
//                 description: "Session ID has been copied to clipboard.",
//             })
//         } catch (err) {
//             toast({
//                 title: "Copy Failed",
//                 description: "Unable to copy to clipboard.",
//                 variant: "destructive",
//             })
//         } finally {
//             setIsCopying(false)
//         }
//     }

//     return (
//         <main>
//             <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: 'auto' }}
//                 exit={{ opacity: 0, height: 0 }}
//                 transition={{ duration: 0.3 }}
//             >
//                 <Card className="border-secondary/20 bg-primary/5">
//                     <CardContent className="pt-6">
//                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                             <div>
//                                 <h3 className="text-lg font-medium mb-1">Join the meeting</h3>
//                                 <p className="text-sm text-muted-foreground">
//                                     Enter the session ID to join the meeting
//                                 </p>
//                             </div>
//                             <div className="flex items-center gap-2 w-full sm:w-auto">
//                                 <Input
//                                     value={sessionId || roomId}
//                                     onChange={(e) => setSessionId(e.target.value)}
//                                     placeholder="Enter session ID"
//                                     className="font-mono text-sm bg-background/50"
//                                     aria-label="Session ID"
//                                 />
//                                 {sessionId.trim() !== '' && (
//                                     <Button
//                                         size="icon"
//                                         variant="secondary"
//                                         onClick={handleCopy}
//                                         disabled={isCopying}
//                                         className="shrink-0"
//                                         title="Copy Session ID"
//                                     >
//                                         <Copy className="w-4 h-4" />
//                                     </Button>
//                                 )}
//                             </div>
//                         </div>
//                         <div className="mt-4 flex justify-end">
//                             <Button onClick={handleJoin} className="w-full">
//                                 Join
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </motion.div>
//         </main>
//     )
// }

'use client'
import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Copy, Users, Calendar, Lock, Globe, Coins, Crown } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

interface MeetingDetails {
    id: string
    title: string
    description?: string
    host: {
        name: string
        address: string
    }
    createdAt: string
    participants: number
    maxParticipants?: number
    isActive: boolean
    accessType: 'public' | 'private' | 'token-gated'
    tokenGated?: {
        enabled: boolean
        contractAddress: string
        tokenType: 'ERC20' | 'ERC721' | 'ERC1155'
        minimumBalance: number
        tokenSymbol?: string
    }
}

export default function JoinChatroom({ roomId }: { roomId?: string }) {
    const { toast } = useToast()
    const router = useRouter()
    const [sessionId, setSessionId] = useState(roomId || '')
    const [isCopying, setIsCopying] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogSessionId, setDialogSessionId] = useState('')
    const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [isJoining, setIsJoining] = useState(false)

    const handleCopy = async () => {
        if (!sessionId.trim()) return
        try {
            setIsCopying(true)
            await navigator.clipboard.writeText(sessionId)
            toast({
                title: "Copied!",
                description: "Session ID has been copied to clipboard.",
            })
        } catch (err) {
            toast({
                title: "Copy Failed",
                description: "Unable to copy to clipboard.",
                variant: "destructive",
            })
        } finally {
            setIsCopying(false)
        }
    }

    const fetchMeetingDetails = async (roomId: string) => {
        if (!roomId.trim()) {
            toast({
                title: "Missing Session ID",
                description: "Please enter a valid session ID.",
                variant: "destructive",
            })
            return
        }

        setIsLoadingDetails(true)
        try {
            const response = await axios.get(`/api/meeting-details/${roomId}`, { withCredentials: true })

            if (response.data.success) {
                setMeetingDetails(response.data.data)
            } else {
                toast({
                    title: "Meeting Not Found",
                    description: response.data.message || "Unable to fetch meeting details.",
                    variant: "destructive",
                })
                setMeetingDetails(null)
            }
        } catch (err: any) {
            console.error("Error fetching meeting details:", err)
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to fetch meeting details.",
                variant: "destructive",
            })
            setMeetingDetails(null)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const handleJoinFromDialog = async () => {
        if (!meetingDetails) return

        setIsJoining(true)
        try {
            const response = await axios.post('/api/join-chatroom', {
                roomId: meetingDetails.id
            }, { withCredentials: true })

            console.log("the response from the join room is ", response)

            if (response.data.success) {
                toast({
                    title: "Joining...",
                    description: "Redirecting to the chatroom.",
                })
                setIsDialogOpen(false)
                router.push(`/chatroom/${meetingDetails.id}`)
            } else {
                toast({
                    title: "Unable to Join",
                    description: response.data.message || "Failed to join the meeting.",
                    variant: "destructive",
                })
            }
        } catch (err: any) {
            console.error("Error joining room:", err)
            toast({
                title: "Error",
                description: err.response?.data?.message || "Something went wrong while joining the room.",
                variant: "destructive",
            })
        } finally {
            setIsJoining(false)
        }
    }

    const handleQuickJoin = async () => {
        const room = sessionId.trim() || roomId?.trim()

        if (!room) {
            toast({
                title: "Missing Session ID",
                description: "Please enter a valid session ID to join the meeting.",
                variant: "destructive",
            })
            return
        }

        try {
            const response = await axios.post('/api/join-chatroom', { roomId: room }, { withCredentials: true })
            console.log("the response from the join room is ", response)
            if (response.data.success) {
                toast({
                    title: "Joining...",
                    description: "Redirecting to the chatroom.",
                })
                router.push(`/chatroom/${room}`)
            } else {
                toast({
                    title: "Inactive Room",
                    description: response.data.message || "The session might be terminated or inactive.",
                    variant: "destructive",
                })
            }
        } catch (err: any) {
            console.error("Error checking room status:", err)
            toast({
                title: "Error",
                description: err.response?.data?.message || "Something went wrong while checking the room status.",
                variant: "destructive",
            })
        }
    }

    const handleDialogSessionIdChange = (value: string) => {
        setDialogSessionId(value)
        setMeetingDetails(null)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getAccessIcon = (accessType: string) => {
        switch (accessType) {
            case 'public':
                return <Globe className="w-4 h-4" />
            case 'private':
                return <Lock className="w-4 h-4" />
            case 'token-gated':
                return <Coins className="w-4 h-4" />
            default:
                return <Globe className="w-4 h-4" />
        }
    }

    const getAccessColor = (accessType: string) => {
        switch (accessType) {
            case 'public':
                return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'private':
                return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            case 'token-gated':
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    return (
        <main>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="border-secondary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-medium mb-1">Join the meeting</h3>
                                <p className="text-sm text-muted-foreground">
                                    Enter the session ID to join the meeting
                                </p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Input
                                    value={sessionId || roomId}
                                    onChange={(e) => setSessionId(e.target.value)}
                                    placeholder="Enter session ID"
                                    className="font-mono text-sm bg-background/50"
                                    aria-label="Session ID"
                                />
                                {sessionId.trim() !== '' && (
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        onClick={handleCopy}
                                        disabled={isCopying}
                                        className="shrink-0"
                                        title="Copy Session ID"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleQuickJoin} variant="outline" className="flex-1">
                                Quick Join
                            </Button>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex-1">Join with Preview</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Join Meeting</DialogTitle>
                                        <DialogDescription>
                                            Enter the meeting ID to view details and join
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                value={dialogSessionId}
                                                onChange={(e) => handleDialogSessionIdChange(e.target.value)}
                                                placeholder="Enter meeting ID"
                                                className="font-mono"
                                            />
                                            <Button
                                                onClick={() => fetchMeetingDetails(dialogSessionId)}
                                                disabled={isLoadingDetails || !dialogSessionId.trim()}
                                                variant="outline"
                                            >
                                                {isLoadingDetails ? 'Loading...' : 'Preview'}
                                            </Button>
                                        </div>

                                        {isLoadingDetails && (
                                            <div className="space-y-3">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                        )}

                                        {meetingDetails && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="border rounded-lg p-4 space-y-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{meetingDetails.title}</h4>
                                                        {meetingDetails.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {meetingDetails.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge
                                                        variant={meetingDetails.isActive ? "default" : "secondary"}
                                                        className={meetingDetails.isActive ? "bg-green-500" : ""}
                                                    >
                                                        {meetingDetails.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>

                                                <Separator />

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Crown className="w-4 h-4 text-yellow-500" />
                                                        <div>
                                                            <p className="font-medium">Host</p>
                                                            <p className="text-muted-foreground">{meetingDetails.host.name}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-blue-500" />
                                                        <div>
                                                            <p className="font-medium">Participants</p>
                                                            <p className="text-muted-foreground">
                                                                {meetingDetails.participants}
                                                                {meetingDetails.maxParticipants && ` / ${meetingDetails.maxParticipants}`}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-purple-500" />
                                                        <div>
                                                            <p className="font-medium">Created</p>
                                                            <p className="text-muted-foreground">
                                                                {formatDate(meetingDetails.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {getAccessIcon(meetingDetails.accessType)}
                                                        <div>
                                                            <p className="font-medium">Access</p>
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs ${getAccessColor(meetingDetails.accessType)}`}
                                                            >
                                                                {meetingDetails.accessType.charAt(0).toUpperCase() + meetingDetails.accessType.slice(1)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                {meetingDetails.tokenGated?.enabled && (
                                                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Coins className="w-4 h-4 text-purple-500" />
                                                            <span className="font-medium text-sm">Token Gated</span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground space-y-1">
                                                            <p>
                                                                <span className="font-medium">Token:</span> {meetingDetails.tokenGated.tokenSymbol || 'Unknown'}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium">Minimum Balance:</span> {meetingDetails.tokenGated.minimumBalance}
                                                            </p>
                                                            <p className="font-mono text-xs bg-background/50 p-1 rounded">
                                                                {meetingDetails.tokenGated.contractAddress}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsDialogOpen(false)}
                                                        className="flex-1"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleJoinFromDialog}
                                                        disabled={isJoining || !meetingDetails.isActive}
                                                        className="flex-1"
                                                    >
                                                        {isJoining ? 'Joining...' : 'Join Meeting'}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    )
}