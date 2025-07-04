"use client"
// TWEETNACL: https://github.com/tweetnacl/tweetnacl-js FOR ENCRYPTION AND DECRYPTION OF MESSAGES IN THE DATABASE 
import { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Send, User, Users, X, Info, LogOut, Copy,
  Smile, Paperclip, MoreVertical, Sparkles,
  AlertTriangle, Loader2, CheckCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { io, Socket } from "socket.io-client"
import ShowSummary from "@/components/chatroom/showSummary"
import { useActiveWallet } from "thirdweb/react"
import Cookies from "js-cookie"
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import { updateUserProfile, getUserDetails } from "@/store/reducers/userSlice"


// Define types for the app
interface Participant {
  id: string;
  name: string;
  status: string;
  isCurrentUser?: boolean;
}

interface MessageSender {
  id: string;
  wallet_address?: string,
  smart_wallet_address?: string
  name: string;
}

export interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  pending?: boolean;
}

interface SummaryData {
  keyPoints: string[];
  actionItems: string[];
  nextSteps: string;
}

const initialMessages: Message[] = []
const initialParticipants: Participant[] = []



const MESSAGE_LIMIT = 15;

export default function ChatroomPage() {
  const router = useRouter()
  const params = useParams()
  const chatroomId = params.id as string
  // Get chatroom title from Redux state
  const chatroomTitle = useSelector((state: any) => {
    const found = state.chatroom.chatrooms.find((c: any) => c.id === chatroomId);
    return found ? found.title : "Chatroom";
  });
  const smart_wallet_address = useActiveWallet()?.getAccount()?.address
  const wallet_address = useActiveWallet()?.getAdminAccount?.()?.address
  const userId = useSelector((state: any) => state.user.id)


  // State management
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  // const [username, setUsername] = useState(() => {
  //   if (typeof window !== 'undefined') {
  //     return localStorage.getItem('chatUsername') || `User-${Math.floor(Math.random() * 10000)}`
  //   }
  //   return `User-${Math.floor(Math.random() * 10000)}`
  // })
  const randomUsername = `User-${Math.floor(Math.random() * 10000)}`
  const usernameFromState = useSelector((state: any) => state.user.name)
  console.log("the user name from the state is ", usernameFromState)
  const [username, setUsername] = useState(usernameFromState || randomUsername)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [tempUsername, setTempUsername] = useState("")
  const [showError, setShowError] = useState(false)
  const token: any = Cookies.get("jwt")
  console.log("the cookies is ", token)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const dispatch = useDispatch()
  // Function to fetch messages from the API (paginated)
  const fetchMessages = useCallback(async (fetchOffset = 0, append = false) => {
    try {
      setLoadingMore(true);
      const response = await fetch(`/api/messages?chatroomId=${chatroomId}&limit=${MESSAGE_LIMIT}&offset=${fetchOffset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      const formattedMessages = data.map((msg: any) => ({
        id: msg.id || `msg-${msg.sent_at}-${msg.sender_id}`,
        sender: msg.sender || {
          id: msg.sender_id,
          name: msg.sender_name,
          profileImage: msg.sender_profileImage,
          smartWalletAddress: msg.sender_smartWalletAddress
        },
        content: msg.message || msg.message_text,
        timestamp: new Date(msg.sentAt || msg.sent_at)
      }));
      if (append) {
        setMessages(prev => [...formattedMessages, ...prev]);
      } else {
        setMessages(formattedMessages);
      }
      setHasMore(data.length === MESSAGE_LIMIT);
      setOffset(fetchOffset + data.length);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load message history",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  }, [chatroomId, toast]);

  // Initial load
  useEffect(() => {
    setMessages([]);
    setOffset(0);
    setHasMore(true);
    fetchMessages(0, false);
    dispatch<any>(getUserDetails)
  }, [chatroomId, dispatch, fetchMessages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !loadingMore) {
      fetchMessages(offset, true);
    }
  };

  // useEffect(() => {
  //   const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
  //   setUserId(userId || "unknown-user")
  // }, [username])

  // Initialize socket connection
  useEffect(() => {
    const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:5050"
    setConnectionStatus("connecting")

    // Connect to the Socket.IO server
    const newSocket = io(SERVER_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      auth: token || "token"
    },)

    // Set up event listeners
    newSocket.on("connect", () => {
      console.log("Connected to server with ID:", newSocket.id)
      setConnectionStatus("connected")
      setIsLoading(false)

      // Join the chatroom
      newSocket.emit("join", {
        room: chatroomId,
        username: username
      })

      toast({
        title: "Connected",
        description: "You are now connected to the chat server.",
      })
    })

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err)
      setConnectionStatus("disconnected")
      setIsLoading(false)
      setError("Failed to connect to the chat server. Please try again later.")
      setShowError(true)

      toast({
        title: "Connection Error",
        description: "Failed to connect to the chat server. Please try again.",
        variant: "destructive",
      })
    })

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from server, reason:", reason)
      setConnectionStatus("disconnected")

      toast({
        title: "Disconnected",
        description: reason === "io server disconnect"
          ? "You have been disconnected from the server."
          : "Connection lost. Attempting to reconnect...",
        variant: "destructive",
      })
    })

    newSocket.on("reconnect", (attemptNumber: number) => {
      console.log("Reconnected after", attemptNumber, "attempts")
      setConnectionStatus("connected")

      toast({
        title: "Reconnected",
        description: "You have been reconnected to the chat server.",
      })

      // Rejoin the room
      newSocket.emit("join", {
        room: chatroomId,
        username: username
      })
    })

    newSocket.on("reconnect_failed", () => {
      console.error("Failed to reconnect")
      setError("Failed to reconnect to the server. Please refresh the page.")
      setShowError(true)

      toast({
        title: "Reconnection Failed",
        description: "Unable to reconnect to the server. Please refresh the page.",
        variant: "destructive",
      })
    })

    // Socket event handlers
    newSocket.on("connection_status", (data: { userId: string }) => {
      console.log("Connection status:", data)
    })

    newSocket.on("error", (data: { message: string }) => {
      console.error("Server error:", data.message)
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      })
    })

    newSocket.on("join_success", (data: { participants: Participant[], history?: any[] }) => {
      console.log("Join success:", data)

      // Set participants list (mark current user)
      const updatedParticipants = data.participants.map((participant: Participant) => ({
        ...participant,
        isCurrentUser: participant.id === newSocket.id
      }))

      // Add current user if not in the list
      const currentUserExists = updatedParticipants.some(p => p.id === newSocket.id)
      if (!currentUserExists) {
        updatedParticipants.push({
          id: newSocket.id || "unknown-id",
          name: username || "unknown",
          status: "online",
          isCurrentUser: true
        })
      }

      setParticipants(updatedParticipants)

      // Load message history if available
      if (data.history && Array.isArray(data.history)) {
        setMessages(data.history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      }

      toast({
        title: "Joined Room",
        description: `You have joined the chatroom: ${chatroomId}`,
      })
    })

    newSocket.on("user_joined", (data: { username: string, participants: Participant[] }) => {
      console.log("User joined:", data)

      // Update participants list
      if (data.participants) {
        const updatedParticipants = data.participants.map(participant => ({
          ...participant,
          isCurrentUser: participant.id === newSocket.id
        }))

        setParticipants(updatedParticipants)
      }

      toast({
        title: "User Joined",
        description: `${data.username} has joined the room.`,
      })
    })

    newSocket.on("user_left", (data: { username: string, participants: Participant[] }) => {
      console.log("User left:", data)

      // Update participants list
      if (data.participants) {
        const updatedParticipants = data.participants.map(participant => ({
          ...participant,
          isCurrentUser: participant.id === newSocket.id
        }))

        setParticipants(updatedParticipants)
      }

      toast({
        title: "User Left",
        description: `${data.username} has left the room.`,
      })
    })

    newSocket.on("leave_success", (data: any) => {
      console.log("Leave success:", data)
      toast({
        title: "Left Room",
        description: `You have left the chatroom.`,
      })
    })

    newSocket.on("message_received", (message: any) => {
      console.log("Message received:", message)

      // Add received message to messages
      setMessages(prev => [
        ...prev,
        {
          ...message,
          timestamp: new Date(message.timestamp)
        }
      ])
    })

    newSocket.on("message_sent", (message: any) => {
      console.log("Message sent confirmation:", message)
      // The message is already added to the UI, nothing to do here
    })

    newSocket.on("participants_list", (data: { participants: Participant[] }) => {
      console.log("Participants list:", data)

      // Update participants
      if (data.participants) {
        const updatedParticipants = data.participants.map(participant => ({
          ...participant,
          isCurrentUser: participant.id === newSocket.id
        }))

        setParticipants(updatedParticipants)
      }
    })

    newSocket.on("status_updated", (data: { participants: Participant[] }) => {
      console.log("Status updated:", data)

      // Update participants list with new status
      if (data.participants) {
        const updatedParticipants = data.participants.map(participant => ({
          ...participant,
          isCurrentUser: participant.id === newSocket.id
        }))

        setParticipants(updatedParticipants)
      }
    })

    // Save socket instance and clean up on unmount
    setSocket(newSocket)

    return () => {
      if (newSocket) {
        // Leave room before disconnecting
        newSocket.emit("leave", { room: chatroomId })
        newSocket.disconnect()
      }
    }
  }, [chatroomId, toast, username, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async () => {
    if (!message.trim() || !socket || connectionStatus !== "connected") return

    const newMessage: Message = {
      id: `msg-${Date.now()}-local`,
      sender: {
        id: userId || "unknown-id",
        name: username || "unknown",
        smart_wallet_address: smart_wallet_address,
        wallet_address: wallet_address
      },
      content: message,
      timestamp: new Date(),
      pending: true
    }

    // Add to local messages
    setMessages(prev => [...prev, newMessage])

    // Send to server
    socket.emit("message", {
      room: chatroomId,
      userDbId: userId,
      message: message,
      username: username,
      smart_wallet_address: smart_wallet_address
    })

    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(chatroomId)
    toast({
      title: "Copied",
      description: "Chatroom ID copied to clipboard.",
    })
  }

  const leaveRoom = () => {
    setIsLeavingRoom(true)

    if (socket && connectionStatus === "connected") {
      socket.emit("leave", { room: chatroomId })
    }

    toast({
      title: "Leaving Room",
      description: "You are leaving the chatroom...",
    })

    // Redirect after a short delay
    setTimeout(() => {
      setLeaveDialogOpen(false)
      router.push("/dashboard")
    }, 1000)
  }

  const updateUsername = () => {
    if (!tempUsername.trim()) return

    const newUsername = tempUsername.trim()
    setUsername(newUsername)
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatUsername', newUsername)
    }
    dispatch<any>(updateUserProfile({ name: newUsername, email: undefined, toast }))
    setShowUsernameDialog(false)

    toast({
      title: "Username Updated",
      description: `Your username is now: ${newUsername}`,
    })

    // If connected, rejoin to update username
    if (socket && connectionStatus === "connected") {
      socket.emit("leave", { room: chatroomId })
      socket.emit("join", {
        room: chatroomId,
        username: newUsername
      })
    }
  }

  const generateSummary = () => {
    setIsGeneratingSummary(true)
    setTimeout(() => {
      setIsGeneratingSummary(false)
      setShowSummary(true)

      toast({
        title: "Summary Generated",
        description: "AI has generated a summary of the conversation.",
      })
    }, 2000)
  }

  const formatTime = (date: Date | string) => {
    if (!date) return ""
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h2 className="text-lg font-medium">Connecting to chatroom...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we establish a connection.</p>
      </div>
    )
  }

  // Error state
  if (showError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
        <h2 className="text-lg font-medium">Connection Error</h2>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
        <Button variant="outline" className="mt-2" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Username Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
            <DialogDescription>
              Enter a new username that will be visible to others in the chatroom.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Enter new username"
            className="mt-4"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowUsernameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={updateUsername} disabled={!tempUsername.trim()}>
              Update Username
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Confirmation Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Chatroom</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this chatroom? You can rejoin later with the chatroom ID.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={leaveRoom} disabled={isLeavingRoom}>
              {isLeavingRoom ? "Leaving..." : "Leave Chatroom"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="/dashboard">
                <X className="h-5 w-5" />
              </a>
            </Button>

            <div>
              <h1 className="text-lg font-semibold">{chatroomTitle}</h1>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowUsernameDialog(true)}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change Username</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={generateSummary}
                  // disabled={isGeneratingSummary || messages.length < 5}
                  >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLeaveDialogOpen(true)}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Leave Room</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" onScroll={handleScroll}>
            <div className="space-y-4 mb-4">
              {loadingMore && (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary/20 mb-2" />
                  <span className="text-sm text-primary font-medium">Loading more messages...</span>
                  <span className="text-xs text-muted-foreground mt-1">Fetching previous chat history.</span>
                </div>
              )}
              {messages.length > 0 ? (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender?.id === userId ? "justify-end" : "justify-start"}`}
                    >
                      {msg.sender?.id !== userId && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback>
                            {msg.sender?.name
                              ? msg.sender.name.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`flex flex-col max-w-[70%] ${msg.sender?.id === userId ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {msg.sender?.id === userId ? "You" : (msg.sender?.name || "Unknown")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp ? formatTime(msg.timestamp) : ""}
                          </span>
                          {msg.pending && (
                            <span className="text-xs text-muted-foreground italic">
                              sending...
                            </span>
                          )}
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 break-words whitespace-pre-wrap ${msg.sender?.id === userId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"}`}
                        >
                          {msg.content || ""}
                        </div>
                      </div>
                      {msg.sender?.id === userId && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback>
                            {msg.sender?.name
                              ? msg.sender.name.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Info className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium">Welcome to the chatroom!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start chatting or share this room ID with others to invite them.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                disabled={connectionStatus !== "connected"}
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                disabled={connectionStatus !== "connected"}
              >
                <Smile className="h-5 w-5" />
              </Button>

              <Input
                placeholder={
                  connectionStatus === "connected"
                    ? "Type a message..."
                    : "Connecting to server..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={connectionStatus !== "connected"}
                className="flex-1"
              />

              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={sendMessage}
                disabled={!message.trim() || connectionStatus !== "connected"}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {connectionStatus !== "connected" && (
              <div className="flex items-center justify-center mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${connectionStatus === "connecting" ? "bg-amber-400" : "bg-red-400"
                      } opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${connectionStatus === "connecting" ? "bg-amber-500" : "bg-red-500"
                      }`}></span>
                  </span>
                  {connectionStatus === "connecting" ? "Connecting to server..." : "Disconnected"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Participants Sidebar */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-l border-border overflow-hidden bg-background"
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Participants</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowParticipants(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-full p-4">
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {participant.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {participant.name}
                            {participant.isCurrentUser && " (You)"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {participant.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={
                          `h-2 w-2 rounded-full ${participant.status === "online"
                            ? "bg-green-500"
                            : "bg-amber-500"}`
                        } />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Summary Sidebar */}
        <ShowSummary setShowSummary={setShowSummary} showSummary={showSummary} messages={messages} />
      </div>
    </div>
  )
}