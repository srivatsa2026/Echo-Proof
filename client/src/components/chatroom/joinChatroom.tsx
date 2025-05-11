'use client'
import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Copy } from 'lucide-react'

export default function JoinChatroom({ roomId }: { roomId?: string }) {
    const { toast } = useToast()
    const router = useRouter()
    const [sessionId, setSessionId] = useState(roomId || '')
    const [isCopying, setIsCopying] = useState(false)

    const handleJoin = async () => {
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
                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleJoin} className="w-full">
                                Join
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    )
}
