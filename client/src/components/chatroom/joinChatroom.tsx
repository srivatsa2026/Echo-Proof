'use client'
import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Copy } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useSelector } from 'react-redux'

export default function JoinChatroom({ roomId }: { roomId?: string }) {
    const { toast } = useToast()

    const [sessionId, setSessionId] = useState("")
    const room = useSelector((state: any) => state?.chatroom?.id)
    console.log("the session id from the join room is ", room)

    const handleJoin = () => {
        if (!sessionId.trim()) {
            toast({
                title: "Missing Session ID",
                description: "Please enter a valid session ID to join the meeting.",
                variant: "destructive",
            })
            return
        }

        // Check if the session ID is valid (you can replace this with a real check)
        if (sessionId === "valid_session_id") {
            // Redirect or handle valid session join logic
            toast({
                title: "Joining...",
                description: "You are being redirected to the chatroom.",
            })
        } else {
            toast({
                title: "Invalid Session ID",
                description: "The session ID entered is invalid.",
                variant: "destructive",
            })
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
                                    value={sessionId || room}
                                    onChange={(e) => setSessionId(e.target.value)}
                                    placeholder="Enter session ID"
                                    className="font-mono text-sm bg-background/50"
                                    aria-label="Session ID"
                                />
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
