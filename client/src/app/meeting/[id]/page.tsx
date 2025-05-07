"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  X,
  Copy,
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  ScreenShare,
  MessageSquare,
  Phone,
  Sparkles,
  Send,
  FileText,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Mock data for participants
const mockParticipants = [
  {
    id: "user-1",
    name: "Alice Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "speaking",
    isCurrentUser: true,
    isMuted: false,
    isVideoOn: true,
  },
  {
    id: "user-2",
    name: "Bob Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    isCurrentUser: false,
    isMuted: false,
    isVideoOn: true,
  },
  {
    id: "user-3",
    name: "Charlie Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    isCurrentUser: false,
    isMuted: true,
    isVideoOn: true,
  },
  {
    id: "user-4",
    name: "Diana Miller",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    isCurrentUser: false,
    isMuted: false,
    isVideoOn: false,
  },
  {
    id: "user-5",
    name: "Ethan Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    isCurrentUser: false,
    isMuted: true,
    isVideoOn: false,
  },
]

// Mock data for chat messages
const mockMessages = [
  {
    id: "msg-1",
    sender: {
      id: "user-2",
      name: "Bob Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Hi everyone, can you all hear me?",
    timestamp: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: "msg-2",
    sender: {
      id: "user-3",
      name: "Charlie Davis",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Yes, loud and clear!",
    timestamp: new Date(Date.now() - 3600000 * 1.5),
  },
  {
    id: "msg-3",
    sender: {
      id: "user-4",
      name: "Diana Miller",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "I can hear you too. Let's start discussing the project timeline.",
    timestamp: new Date(Date.now() - 3600000 * 1),
  },
]

// Mock data for notes
const mockNotes = `# Meeting Notes

## Agenda
- Project timeline review
- Resource allocation
- Next steps

## Discussion Points
- Need to finalize the design by next week
- Backend development will start in parallel
- Testing phase scheduled for the end of the month

## Action Items
- [ ] Alice: Share updated wireframes
- [ ] Bob: Prepare resource allocation plan
- [ ] Charlie: Set up development environment
- [ ] Diana: Draft testing strategy
`

// Mock AI summary
const mockSummary = {
  keyPoints: [
    "Team discussed project timeline and resource allocation",
    "Design needs to be finalized by next week",
    "Backend development will start in parallel",
    "Testing phase is scheduled for the end of the month",
  ],
  actionItems: [
    "Alice will share updated wireframes",
    "Bob will prepare resource allocation plan",
    "Charlie will set up the development environment",
    "Diana will draft the testing strategy",
  ],
  nextSteps: "Follow-up meeting scheduled for next week to review progress.",
}

export default function MeetingPage() {
  const params = useParams()
  const meetingId = params.id as string
  const [participants, setParticipants] = useState(mockParticipants)
  const [messages, setMessages] = useState(mockMessages)
  const [message, setMessage] = useState("")
  const [notes, setNotes] = useState(mockNotes)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [isLeavingMeeting, setIsLeavingMeeting] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
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

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId)
    toast({
      title: "Copied!",
      description: "Meeting ID copied to clipboard.",
    })
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)

    // Update current user in participants
    const updatedParticipants = participants.map((p) => (p.isCurrentUser ? { ...p, isMuted: !isMuted } : p))
    setParticipants(updatedParticipants)
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)

    // Update current user in participants
    const updatedParticipants = participants.map((p) => (p.isCurrentUser ? { ...p, isVideoOn: !isVideoOn } : p))
    setParticipants(updatedParticipants)
  }

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)

    toast({
      title: isScreenSharing ? "Screen sharing stopped" : "Screen sharing started",
      description: isScreenSharing ? "You've stopped sharing your screen." : "You're now sharing your screen.",
    })
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)

    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: isRecording ? "Meeting recording has been stopped." : "Meeting is now being recorded.",
    })
  }

  const generateSummary = () => {
    setIsGeneratingSummary(true)

    // Simulate AI summary generation
    setTimeout(() => {
      setIsGeneratingSummary(false)
      setShowSummary(true)
      setActiveTab("summary")

      toast({
        title: "Summary Generated",
        description: "AI has generated a summary of the meeting.",
      })
    }, 2000)
  }

  const leaveMeeting = () => {
    setIsLeavingMeeting(true)

    // Simulate leaving the meeting
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1000)
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
              <h1 className="text-lg font-semibold">Meeting</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="font-mono">{meetingId}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={copyMeetingId}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                Recording
              </Badge>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    className={isRecording ? "text-destructive" : ""}
                  >
                    <div className="relative">
                      <VideoIcon className="h-5 w-5" />
                      {isRecording && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? "Stop Recording" : "Start Recording"}</p>
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

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Phone className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave Meeting</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to leave this meeting? You can rejoin later with the meeting ID.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={leaveMeeting} disabled={isLeavingMeeting}>
                    {isLeavingMeeting ? "Leaving..." : "Leave Meeting"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <main className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.2)" }}
                className="transform transition-all duration-200"
              >
                <div
                  className={`relative rounded-lg overflow-hidden border ${
                    participant.status === "speaking" ? "border-primary" : "border-border"
                  } aspect-video bg-secondary/50`}
                >
                  {participant.isVideoOn ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={participant.avatar || "/placeholder.svg"}
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          <User className="h-10 w-10" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {participant.name}
                        {participant.isCurrentUser && " (You)"}
                      </span>
                      {participant.status === "speaking" && (
                        <span className="flex gap-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-75" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-150" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {participant.isMuted && <MicOff className="h-4 w-4 text-destructive" />}
                      {!participant.isVideoOn && <VideoOff className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {isScreenSharing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="relative rounded-lg overflow-hidden border border-primary aspect-video bg-secondary/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-muted-foreground">
                    <ScreenShare className="h-12 w-12 mx-auto mb-4" />
                    <p>You are sharing your screen</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isGeneratingSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                      <h3 className="font-semibold">Generating AI Summary...</h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-8">
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
        </main>

        <div className="border-t md:border-t-0 md:border-l border-border/40 w-full md:w-80 lg:w-96 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="mx-4 my-2">
              <TabsTrigger value="chat" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {activeTab === "chat" ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
                >
                  <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
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
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                        </div>

                        <Button className="shrink-0" size="icon" onClick={sendMessage} disabled={!message.trim()}>
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </motion.div>
              ) : (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
                >
                  <TabsContent value="summary" className="flex-1 p-4 m-0">
                    {showSummary ? (
                      <Card className="h-full">
                        <CardContent className="p-4 h-full overflow-auto">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">AI Meeting Summary</h3>
                          </div>

                          <div className="space-y-4 text-sm">
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
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Summary Available</h3>
                        <p className="text-muted-foreground max-w-xs mb-6">
                          Generate an AI summary of your meeting to see key points and action items.
                        </p>
                        <Button onClick={generateSummary} disabled={isGeneratingSummary}>
                          {isGeneratingSummary ? (
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
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Generating...
                            </span>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Summary
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </div>

      <div className="border-t border-border/40 p-4">
        <div className="flex justify-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="icon"
                  onClick={toggleMute}
                  className="h-12 w-12 rounded-full"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? "Unmute" : "Mute"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isVideoOn ? "secondary" : "destructive"}
                  size="icon"
                  onClick={toggleVideo}
                  className="h-12 w-12 rounded-full"
                >
                  {isVideoOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isVideoOn ? "Turn Off Camera" : "Turn On Camera"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isScreenSharing ? "default" : "destructive"}
                  size="icon"
                  onClick={toggleScreenShare}
                  className="h-12 w-12 rounded-full"
                >
                  <ScreenShare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isScreenSharing ? "Stop Sharing" : "Share Screen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isRecording ? "destructive" : "secondary"}
                  size="icon"
                  onClick={toggleRecording}
                  className="h-12 w-12 rounded-full"
                >
                  <div className="relative">
                    <VideoIcon className="h-5 w-5" />
                    {isRecording && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    )}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRecording ? "Stop Recording" : "Start Recording"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setIsLeavingMeeting(true)}
                  className="h-12 w-12 rounded-full"
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leave Meeting</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
