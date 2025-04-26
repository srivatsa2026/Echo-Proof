"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Send, User, Users, X, Info, LogOut, Copy, Smile, Paperclip, MoreVertical, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for messages
const mockMessages = [
  {
    id: "msg-1",
    sender: {
      id: "user-1",
      name: "Alice Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Hey everyone! Welcome to the chatroom.",
    timestamp: new Date(Date.now() - 3600000 * 5),
  },
  {
    id: "msg-2",
    sender: {
      id: "user-2",
      name: "Bob Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Thanks for setting this up. I think we should discuss the new project requirements.",
    timestamp: new Date(Date.now() - 3600000 * 4),
  },
  {
    id: "msg-3",
    sender: {
      id: "user-3",
      name: "Charlie Davis",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "I agree. The client wants us to implement the new features by next month.",
    timestamp: new Date(Date.now() - 3600000 * 3),
  },
  {
    id: "msg-4",
    sender: {
      id: "user-1",
      name: "Alice Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "That's a tight deadline. Do we have all the resources we need?",
    timestamp: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: "msg-5",
    sender: {
      id: "user-2",
      name: "Bob Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "I think we'll need to bring in another developer to help with the backend work.",
    timestamp: new Date(Date.now() - 3600000 * 1),
  },
]

// Mock data for participants
const mockParticipants = [
  {
    id: "user-1",
    name: "Alice Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    isCurrentUser: true,
  },
  {
    id: "user-2",
    name: "Bob Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    isCurrentUser: false,
  },
  {
    id: "user-3",
    name: "Charlie Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    isCurrentUser: false,
  },
  {
    id: "user-4",
    name: "Diana Miller",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    isCurrentUser: false,
  },
  {
    id: "user-5",
    name: "Ethan Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    isCurrentUser: false,
  },
]

// Mock AI summary
const mockSummary = {
  keyPoints: [
    "Team discussed project requirements and timeline",
    "Client needs new features implemented by next month",
    "Current resources may not be sufficient for the deadline",
    "Additional backend developer needed for the project",
  ],
  actionItems: [
    "Alice to review current resource allocation",
    "Bob to identify potential backend developers to bring on",
    "Charlie to break down features into manageable tasks",
    "Team to meet again next week to finalize the plan",
  ],
  nextSteps: "Schedule a meeting with the client to discuss timeline expectations and resource requirements.",
}

export default function ChatroomPage() {
  const params = useParams()
  const chatroomId = params.id as string
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)
  const [participants, setParticipants] = useState(mockParticipants)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: participants.find((p) => p.isCurrentUser)!,
      content: message,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(chatroomId)
    toast({
      title: "Copied!",
      description: "Chatroom ID copied to clipboard.",
    })
  }

  const leaveRoom = () => {
    setIsLeavingRoom(true)

    // Simulate leaving the room
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1000)
  }

  const generateSummary = () => {
    setIsGeneratingSummary(true)

    // Simulate AI summary generation
    setTimeout(() => {
      setIsGeneratingSummary(false)
      setShowSummary(true)

      toast({
        title: "Summary Generated",
        description: "AI has generated a summary of the chat conversation.",
      })
    }, 2000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="md:hidden">
              <a href="/dashboard">
                <X className="h-5 w-5" />
              </a>
            </Button>

            <div>
              <h1 className="text-lg font-semibold">Chatroom</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="font-mono">{chatroomId}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={copyRoomId}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="relative"
                  >
                    <Users className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {participants.length}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Participants</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={generateSummary} disabled={isGeneratingSummary}>
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate AI Summary</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chatroom Info</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <LogOut className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave Chatroom</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to leave this chatroom? You can rejoin later with the chatroom ID.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={leaveRoom} disabled={isLeavingRoom}>
                    {isLeavingRoom ? "Leaving..." : "Leave Chatroom"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.sender.id === participants.find((p) => p.isCurrentUser)?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${msg.sender.id === participants.find((p) => p.isCurrentUser)?.id ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div
                        className={`flex items-center gap-2 mb-1 ${msg.sender.id === participants.find((p) => p.isCurrentUser)?.id ? "justify-end" : ""}`}
                      >
                        <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                        <span className="text-sm font-medium">{msg.sender.name}</span>
                      </div>

                      <div
                        className={`rounded-lg p-3 ${
                          msg.sender.id === participants.find((p) => p.isCurrentUser)?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {isGeneratingSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mx-4 mb-4"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                      <h3 className="font-semibold">Generating AI Summary...</h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-4">
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150" />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-300" />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {showSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mx-4 mb-4"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">AI Chat Summary</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSummary(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold mb-2">Key Points:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {mockSummary.keyPoints.map((point, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {point}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Action Items:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {mockSummary.actionItems.map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                      <p className="font-semibold mb-2">Next Steps:</p>
                      <p>{mockSummary.nextSteps}</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button>

              <div className="relative flex-1">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-10"
                />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                  <Smile className="h-5 w-5" />
                </Button>
              </div>

              <Button className="shrink-0" size="icon" onClick={sendMessage} disabled={!message.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border/40 h-full overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Participants</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowParticipants(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  {participants.map((participant) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ backgroundColor: "rgba(249, 115, 22, 0.1)" }}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                              participant.status === "online"
                                ? "bg-green-500"
                                : participant.status === "away"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {participant.name}
                            {participant.isCurrentUser && " (You)"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{participant.status}</p>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
