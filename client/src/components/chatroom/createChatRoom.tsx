"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MessageSquare, Copy } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import Link from "next/link"

interface Props {
    onCreated?: (sessionId: string) => void
}

export function CreateChatroomCard({ onCreated }: Props) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [roomName, setRoomName] = useState("")
    const [purpose, setPurpose] = useState("")
    const [sessionId, setSessionId] = useState("")

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied!",
            description: "Session ID copied to clipboard.",
        })
    }

    const createChatroom = async () => {
        if (!roomName.trim() || !purpose.trim()) {
            toast({
                title: "Missing Info",
                description: "Please fill in both the room name and purpose.",
                variant: "destructive",
            })
            return
        }

        setIsCreating(true)

        try {
            const response = await new Promise<{ sessionId: string }>((resolve) =>
                setTimeout(() => resolve({ sessionId: "chat-" + Math.random().toString(36).substring(2, 8) }), 1000)
            )

            toast({
                title: "Chatroom Created",
                description: `Room "${roomName}" created for "${purpose}".`,
            })

            setSessionId(response.sessionId)
            onCreated?.(response.sessionId)

            // Reset form fields
            setRoomName("")
            setPurpose("")
            setOpen(false) // closes the modal

        } catch (error) {
            toast({
                title: "Failed",
                description: "Something went wrong while creating the chatroom.",
                variant: "destructive",
            })
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                        Create Chatroom
                    </CardTitle>
                    <CardDescription>Start a new chatroom for your team</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={open} onOpenChange={setOpen}>

                        <DialogTrigger asChild>
                            <Button className="w-full">
                                <span className="flex items-center">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Chatroom
                                </span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create Chatroom</DialogTitle>
                                <DialogDescription>Start a new chatroom for your team</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="roomName" className="text-right">
                                        Room Name
                                    </Label>
                                    <Input
                                        id="roomName"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        placeholder="Enter chatroom name"
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="purpose" className="text-right">
                                        Purpose
                                    </Label>
                                    <Input
                                        id="purpose"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        placeholder="E.g. Team discussion"
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={createChatroom} disabled={isCreating} className="w-full">
                                    {isCreating ? (
                                        <span className="flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Creating...
                                            
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Chatroom
                                        </span>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {sessionId && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="border-primary/20 bg-primary/5 mt-4">
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-1">Chatroom Created Successfully</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Share this session ID with others to invite them
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Input value={sessionId} readOnly className="font-mono text-sm bg-background/50" />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(sessionId)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button asChild>
                                    <Link href={sessionId.startsWith("chat") ? `/chatroom/${sessionId}` : `/meeting/${sessionId}`}>
                                        {sessionId.startsWith("chat") ? "Join Chatroom" : "Join Meeting"}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </>
    )
}
