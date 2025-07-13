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
import { closeChatroom } from "@/store/reducers/chatroomSlice"
// import { encryptMessage, decryptMessage } from "@/lib/lit-encryption"
import { encryptMessage, decryptMessage, testEncryption } from "@/lib/simple-encryption"
import { getSocket } from "@/lib/socket/chatroom-socket"

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
  const wallet = useActiveWallet()
  const userId = useSelector((state: any) => state.user.id)
  const walletAddress = useSelector((state: any) => state.user.wallet_address)
  console.log("the wallet address of the user in the chatroom id is ", walletAddress)

  // State management
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")

  const usernameFromState = useSelector((state: any) => state.user.name)
  const isUserLoading = useSelector((state: any) => state.user.loading)
  console.log("the user name from the state is ", usernameFromState)
  console.log("is user loading:", isUserLoading)

  // Use username directly from Redux state
  const username = usernameFromState && usernameFromState !== "Echo-Client" ? usernameFromState : "User"
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const token: any = Cookies.get("jwt")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

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

      // Debug: Log the raw data from API
      console.log("🔍 Raw API response data:", data);

      // Decrypt messages if they're encrypted
      const formattedMessages = await Promise.all(data.map(async (msg: any) => {
        console.log("🔍 Processing message:", msg);

        let decryptedContent = msg.message;

        // Check if message is encrypted
        if (msg.encryptedSymmetricKey) {
          try {
            const wa = walletAddress || "unknown";
            decryptedContent = await decryptMessage(
              msg.message,
              msg.encryptedSymmetricKey,
              chatroomId,
              wallet,
              wa
            );
          } catch (error) {
            console.error('Error decrypting message:', error);
            decryptedContent = "[Encrypted message - unable to decrypt]";
          }
        }

        // Ensure sender object is properly structured
        const sender = msg.sender ? {
          id: msg.sender.id,
          name: msg.sender.name || "Unknown User",
          smart_wallet_address: msg.sender.smart_wallet_address,
          wallet_address: msg.sender.wallet_address
        } : {
          id: msg.senderId || "unknown",
          name: "Unknown User",
          smart_wallet_address: undefined,
          wallet_address: undefined
        };

        console.log("🔍 Processed sender object:", sender);

        return {
          id: msg.id,
          sender: sender,
          content: decryptedContent,
          timestamp: new Date(msg.sentAt)
        };
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
  }, [chatroomId, toast, wallet, walletAddress]);

  // Initial load
  useEffect(() => {
    setMessages([]);
    setOffset(0);
    setHasMore(true);
    fetchMessages(0, false);
    dispatch<any>(getUserDetails());

    // Set a timeout to stop waiting for username after 3 seconds
    const usernameTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(usernameTimeout);
  }, [chatroomId, dispatch, fetchMessages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !loadingMore) {
      fetchMessages(offset, true);
    }
  };

  // Update username loading state when Redux state changes
  useEffect(() => {
    if (usernameFromState && usernameFromState !== "Echo-Client") {
      console.log("🔄 Username loaded from Redux state:", usernameFromState);
      // setIsUsernameLoading(false); // Removed
    }
  }, [usernameFromState]);

  // Rejoin room when username changes (if already connected)
  useEffect(() => {
    if (socket && connectionStatus === "connected" && username && username !== "User") {
      console.log("🔄 Username changed, rejoining room as:", username);
      socket.emit("leave", { room: chatroomId });
      setTimeout(() => {
        socket.emit("join", {
          room: chatroomId,
          username: username
        });
      }, 200);
    }
  }, [username, socket, connectionStatus, chatroomId]);

  // --- NEW SOCKET CONNECTION LOGIC ---
  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;

    const tryConnect = () => {
      const chatSocket = getSocket(username, walletAddress);
      if (!chatSocket) {
        if (retryCount < MAX_RETRIES) {
          retryTimeout = setTimeout(() => {
            if (isMounted) setRetryCount((c) => c + 1);
          }, 1000);
        } else {
          setError("No socket connection found. Please join the chatroom again.");
          setIsLoading(false);
        }
        return;
      }
      setSocket(chatSocket);
      setConnectionStatus(chatSocket.connected ? "connected" : "connecting");

      const handleConnect = () => {
        setConnectionStatus("connected");
        setIsLoading(false);
        // Join the room
        const joinPayload: any = {
          room: chatroomId,
          username: username
        };
        if (walletAddress) {
          joinPayload.walletAddress = walletAddress;
        }
        chatSocket.emit("join", joinPayload);
        // Request message history
        chatSocket.emit("get_history", {
          room: chatroomId
        });
        toast({
          title: "Connected",
          description: "You are now connected to the chat server.",
        });
      };
      const handleConnectError = (err: unknown) => {
        setConnectionStatus("disconnected");
        setIsLoading(false);
        setError("Failed to connect to the chat server. Please try again later.");
        toast({
          title: "Connection Error",
          description: `Failed to connect: ${err && typeof err === 'object' && 'message' in err ? (err as any).message : 'Unknown error'}`,
          variant: "destructive",
        });
      };
      const handleDisconnect = (reason: unknown) => {
        setConnectionStatus("disconnected");
        toast({
          title: "Disconnected",
          description: reason === "io server disconnect"
            ? "You have been disconnected from the server."
            : "Connection lost. Attempting to reconnect...",
          variant: "destructive",
        });
      };
      chatSocket.on("connect", handleConnect);
      chatSocket.on("connect_error", handleConnectError);
      chatSocket.on("disconnect", handleDisconnect);

      chatSocket.on("reconnect", (attemptNumber: number) => {
        console.log("🔄 Reconnected after", attemptNumber, "attempts")
        setConnectionStatus("connected")
        toast({
          title: "Reconnected",
          description: "You have been reconnected to the chat server.",
        })
        // Rejoin the room
        const rejoinPayload: any = {
          room: chatroomId,
          username: username
        };
        if (walletAddress) {
          rejoinPayload.walletAddress = walletAddress;
        }
        chatSocket.emit("join", rejoinPayload);
      })

      chatSocket.on("reconnect_failed", () => {
        console.error("❌ Failed to reconnect")
        setError("Failed to reconnect to the server. Please refresh the page.")
        toast({
          title: "Reconnection Failed",
          description: "Unable to reconnect to the server. Please refresh the page.",
          variant: "destructive",
        })
      })

      // Socket event handlers
      chatSocket.on("connection_status", (data: { userId: string; status: string; message: string }) => {
        console.log("📡 Connection status:", data)

        // Additional confirmation that we're connected
        if (data.status === 'connected') {
          setConnectionStatus("connected")
        }
      })

      chatSocket.on("error", (data: { message: string }) => {
        console.error("⚠️ Server error:", data.message)
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        })
      })

      chatSocket.on("join_success", async (data: { participants: Participant[], history?: any[], roomId: string }) => {
        console.log("✅ Join success:", data)

        // Set participants list (mark current user)
        const updatedParticipants = data.participants.map((participant: Participant) => ({
          ...participant,
          isCurrentUser: participant.id === chatSocket.id
        }))

        // Add current user if not in the list
        const currentUserExists = updatedParticipants.some(p => p.id === chatSocket.id)
        if (!currentUserExists) {
          updatedParticipants.push({
            id: chatSocket.id || "unknown-id",
            name: username || "unknown",
            status: "online",
            isCurrentUser: true
          })
        }

        setParticipants(updatedParticipants)

        // Load message history if available
        if (data.history && Array.isArray(data.history)) {
          const historyMessages = await Promise.all(data.history.map(async (msg: any) => {
            let decryptedContent = msg.content || msg.message;

            // Check if message is encrypted
            if (msg.encryptedSymmetricKey) {
              try {
                const wa = walletAddress || "unknown";
                decryptedContent = await decryptMessage(
                  msg.content || msg.message,
                  msg.encryptedSymmetricKey,
                  chatroomId,
                  wallet,
                  wa
                );
              } catch (error) {
                console.error('Error decrypting history message:', error);
                decryptedContent = "[Encrypted message - unable to decrypt]";
              }
            }

            // Handle both old and new sender formats
            let sender = msg.sender;
            if (!sender && msg.sender_id) {
              // Old format: convert sender_id to sender object
              sender = {
                id: msg.sender_id,
                name: "Unknown User",
                smart_wallet_address: undefined,
                wallet_address: undefined
              };
            }

            // Ensure sender object has all required fields
            if (sender) {
              sender = {
                id: sender.id,
                name: sender.name || "Unknown User",
                smart_wallet_address: sender.smart_wallet_address,
                wallet_address: sender.wallet_address
              };
            }

            return {
              id: msg.id || `msg-${Date.now()}-${msg.sender_id || 'unknown'}`,
              sender: sender,
              content: decryptedContent,
              timestamp: new Date(msg.timestamp)
            };
          }));
          console.log("📚 Loading", historyMessages.length, "messages from history")
          setMessages(historyMessages)
        }

        toast({
          title: "Joined Room",
          description: `You have joined the chatroom: ${chatroomId}`,
        })
      })

      chatSocket.on("user_joined", (data: { username: string, participants: Participant[] }) => {
        console.log("👤 User joined:", data)

        // Update participants list
        if (data.participants) {
          const updatedParticipants = data.participants.map(participant => ({
            ...participant,
            isCurrentUser: participant.id === chatSocket.id
          }))

          setParticipants(updatedParticipants)
        }

        toast({
          title: "User Joined",
          description: `${data.username} has joined the room.`,
        })
      })

      chatSocket.on("user_left", (data: { username: string, participants: Participant[] }) => {
        console.log("👤 User left:", data)

        // Update participants list
        if (data.participants) {
          const updatedParticipants = data.participants.map(participant => ({
            ...participant,
            isCurrentUser: participant.id === chatSocket.id
          }))

          setParticipants(updatedParticipants)
        }

        toast({
          title: "User Left",
          description: `${data.username} has left the room.`,
        })
      })

      chatSocket.on("leave_success", (data: any) => {
        console.log("🚪 Leave success:", data)
        toast({
          title: "Left Room",
          description: `You have left the chatroom.`,
        })
      })

      chatSocket.on("message_received", async (message: any) => {
        console.log("📨 Message received:", message)

        try {
          // Decrypt the message if it's encrypted
          let decryptedContent = message.content
          if (message.encryptedSymmetricKey) {
            const wa = walletAddress || "unknown"

            decryptedContent = await decryptMessage(
              message.content,
              message.encryptedSymmetricKey,
              chatroomId,
              wallet,
              wa
            )
          }

          // Check if this is our own message to prevent duplicates
          const isOwnMessage = message.sender?.id === userId ||
            (message.sender?.smart_wallet_address && message.sender.smart_wallet_address === walletAddress) ||
            (message.sender?.wallet_address && message.sender.wallet_address === walletAddress);

          console.log("📨 Message ownership check:", {
            messageId: message.id,
            senderId: message.sender?.id,
            userId: userId,
            isOwnMessage: isOwnMessage
          });

          // Add received message to messages with decrypted content
          setMessages(prev => {
            // Check if this is our own message and we have a pending local message
            const isOwnMessage = message.sender?.id === userId ||
              (message.sender?.smart_wallet_address && message.sender.smart_wallet_address === walletAddress) ||
              (message.sender?.wallet_address && message.sender.wallet_address === walletAddress);

            if (isOwnMessage) {
              // Replace pending local message with server-confirmed message
              const hasPendingMessage = prev.some(msg => msg.pending && msg.content === decryptedContent);
              if (hasPendingMessage) {
                console.log("📨 Replacing pending message with server confirmation:", message.id);
                return prev.map(msg =>
                  msg.pending && msg.content === decryptedContent
                    ? {
                      id: message.id,
                      sender: message.sender,
                      content: decryptedContent,
                      timestamp: new Date(message.timestamp),
                      pending: false
                    }
                    : msg
                );
              }
            }

            // Check if message already exists (to prevent duplicates)
            const messageExists = prev.some(existingMsg =>
              existingMsg.id === message.id ||
              (existingMsg.sender?.id === message.sender?.id &&
                existingMsg.content === decryptedContent &&
                Math.abs(existingMsg.timestamp.getTime() - new Date(message.timestamp).getTime()) < 1000) // Within 1 second
            );

            if (messageExists) {
              console.log("📨 Skipping duplicate message:", message.id);
              return prev;
            }

            return [
              ...prev,
              {
                id: message.id,
                sender: message.sender,
                content: decryptedContent,
                timestamp: new Date(message.timestamp)
              }
            ];
          });
        } catch (error) {
          console.error("❌ Error decrypting message:", error)
          // Add message with encrypted content if decryption fails
          setMessages(prev => [
            ...prev,
            {
              id: message.id,
              sender: message.sender,
              content: "[Encrypted message - unable to decrypt]",
              timestamp: new Date(message.timestamp)
            }
          ])
        }
      })

      chatSocket.on("history", async (data: { room: string, messages: any[] }) => {
        console.log("📚 History received:", data)

        if (data.messages && Array.isArray(data.messages)) {
          const historyMessages = await Promise.all(data.messages.map(async (msg: any) => {
            let decryptedContent = msg.content || msg.message;

            // Check if message is encrypted
            if (msg.encryptedSymmetricKey) {
              try {
                const wa = walletAddress || "unknown";
                decryptedContent = await decryptMessage(
                  msg.content || msg.message,
                  msg.encryptedSymmetricKey,
                  chatroomId,
                  wallet,
                  wa
                );
              } catch (error) {
                console.error('Error decrypting history message:', error);
                decryptedContent = "[Encrypted message - unable to decrypt]";
              }
            }

            // Handle both old and new sender formats
            let sender = msg.sender;
            if (!sender && msg.sender_id) {
              // Old format: convert sender_id to sender object
              sender = {
                id: msg.sender_id,
                name: "Unknown User",
                smart_wallet_address: undefined,
                wallet_address: undefined
              };
            }

            // Ensure sender object has all required fields
            if (sender) {
              sender = {
                id: sender.id,
                name: sender.name || "Unknown User",
                smart_wallet_address: sender.smart_wallet_address,
                wallet_address: sender.wallet_address
              };
            }

            return {
              id: msg.id || `msg-${Date.now()}-${msg.sender_id || 'unknown'}`,
              sender: sender,
              content: decryptedContent,
              timestamp: new Date(msg.timestamp)
            };
          }));

          console.log("📚 Loaded", historyMessages.length, "messages from history")
          setMessages(historyMessages)
        }
      })

      chatSocket.on("participants_list", (data: { participants: Participant[] }) => {
        console.log("👥 Participants list:", data)

        // Update participants
        if (data.participants) {
          const updatedParticipants = data.participants.map(participant => ({
            ...participant,
            isCurrentUser: participant.id === chatSocket.id
          }))

          setParticipants(updatedParticipants)
        }
      })

      chatSocket.on("status_updated", (data: { participants: Participant[] }) => {
        console.log("🔄 Status updated:", data)

        // Update participants list with new status
        if (data.participants) {
          const updatedParticipants = data.participants.map(participant => ({
            ...participant,
            isCurrentUser: participant.id === chatSocket.id
          }))

          setParticipants(updatedParticipants)
        }
      })

      // Debug: Log all events
      chatSocket.onAny((event, ...args) => {
        console.log(`🔍 Event '${event}' received:`, args)
      })

      // On mount, if already connected, join the room
      if (chatSocket.connected) {
        handleConnect();
      }

      // Cleanup
      return () => {
        chatSocket.off("connect", handleConnect);
        chatSocket.off("connect_error", handleConnectError);
        chatSocket.off("disconnect", handleDisconnect);
        chatSocket.off("reconnect");
        chatSocket.off("reconnect_failed");
        chatSocket.off("connection_status");
        chatSocket.off("error");
        chatSocket.off("join_success");
        chatSocket.off("user_joined");
        chatSocket.off("user_left");
        chatSocket.off("leave_success");
        chatSocket.off("message_received");
        chatSocket.off("history");
        chatSocket.off("participants_list");
        chatSocket.off("status_updated");
        chatSocket.offAny();
        if (retryTimeout) clearTimeout(retryTimeout);
        isMounted = false;
      };
    };

    tryConnect();
    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [retryCount, chatroomId, username, walletAddress, wallet]);
  // --- END NEW SOCKET CONNECTION LOGIC ---

  const sendMessage = async () => {
    if (!message.trim() || !socket || connectionStatus !== "connected") {
      console.log("❌ Cannot send message:", {
        hasMessage: !!message.trim(),
        hasSocket: !!socket,
        connectionStatus,
        socketConnected: socket?.connected
      })
      return
    }

    console.log("📤 Sending message:", message)

    // Use wallet from component level
    const wa = walletAddress || "unknown"

    try {
      // Encrypt the message before sending
      console.log('🔐 Starting encryption process...');
      console.log('🔐 Input parameters:', {
        message: message.substring(0, 50) + '...',
        chatroomId,
        hasWallet: !!wallet,
        walletAddress: wa
      });

      const encryptionResult = await encryptMessage(
        message,
        chatroomId,
        wallet,
        wa
      );

      console.log('🔐 Encryption result received:', encryptionResult);

      const { encryptedMessage, encryptedSymmetricKey } = encryptionResult;

      console.log('🔐 Destructured values:', {
        hasEncryptedMessage: !!encryptedMessage,
        hasEncryptedSymmetricKey: !!encryptedSymmetricKey,
        encryptedSymmetricKey: encryptedSymmetricKey
      });

      // Validate encryption result
      if (!encryptedMessage || !encryptedSymmetricKey) {
        throw new Error('Encryption failed: missing encrypted message or key');
      }

      const timestamp = new Date()
      const localMessageId = `local-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`
      const newMessage: Message = {
        id: localMessageId,
        sender: {
          id: userId || "unknown-id",
          name: username || "unknown",
          smart_wallet_address: undefined,
          wallet_address: wa
        },
        content: message, // Show original message locally
        timestamp: timestamp,
        pending: true
      }

      console.log("📤 Creating local message:", {
        userId: userId,
        username: username,
        smart_wallet_address: undefined,
        wallet_address: wa
      });

      // Add to local messages
      setMessages(prev => [...prev, newMessage])

      // Send encrypted message to server
      console.log("📤 Sending to socket server:", {
        room: chatroomId,
        userDbId: userId,
        message: encryptedMessage,
        encryptedSymmetricKey: encryptedSymmetricKey,
        username: username,
        wallet_address: wa
      })

      socket.emit("message", {
        room: chatroomId,
        userDbId: userId,
        message: encryptedMessage, // Send encrypted message
        encryptedSymmetricKey: encryptedSymmetricKey, // Send encryption key
        username: username,
        wallet_address: wa
      })

      setMessage("")
    } catch (error) {
      console.error("❌ Error encrypting message:", error)
      console.error("Error details:", {
        message: message,
        chatroomId: chatroomId,
        walletAddress: wa,
        hasWallet: !!wallet,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      })

      toast({
        title: "Encryption Error",
        description: error instanceof Error ? error.message : "Failed to encrypt message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const leaveRoom = () => {
    setIsLeavingRoom(true)

    if (socket && connectionStatus === "connected") {
      console.log("🚪 Leaving room:", chatroomId)
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

  // Get chatroom creatorId from Redux state
  const chatroomCreatorId = useSelector((state: any) => {
    const found = state.chatroom.chatrooms.find((c: any) => c.id === chatroomId);
    if (!found) return null;
    // If creator is an object, use its id; if it's a string, use it directly; fallback to creatorId
    if (typeof found.creator === "object" && found.creator !== null) {
      return found.creator.id;
    }
    return found.creator || found.creatorId || null;
  });

  // Listen for room_closed event and redirect all users
  useEffect(() => {
    if (!socket) return;
    const handleRoomClosed = (data: any) => {
      toast({ title: "Room Closed", description: data.message });
      router.push("/dashboard/chatrooms");
    };
    socket.on("room_closed", handleRoomClosed);
    return () => {
      socket.off("room_closed", handleRoomClosed);
    };
  }, [socket, router, toast]);

  // Handler for admin to close the room (with confirmation)
  const confirmCloseRoom = async () => {
    setCloseDialogOpen(false);
    if (!chatroomId || !socket) return;
    try {
      socket.emit("close_room", { roomId: chatroomId, adminId: userId });
      await dispatch<any>(closeChatroom({ roomId: chatroomId, toast })).unwrap();
      // No need to redirect here, handled by socket event
    } catch (err) {
      // Error handled by thunk
    }
  };


  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyRoomId = () => {
    const joinUrl = `${window.location.origin}/join-chatroom/${chatroomId}`
    navigator.clipboard.writeText(joinUrl)
    toast({
      title: "Copied",
      description: "Join link copied to clipboard.",
    })
  }

  const generateSummary = () => {
    if (messages.length === 0) {
      toast({
        title: "No Messages",
        description: "There are no messages to summarize.",
        variant: "destructive",
      })
      return
    }

    setShowSummary(true)
    toast({
      title: "Generating Summary",
      description: "AI is analyzing the conversation...",
    })
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
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
        <h2 className="text-lg font-medium">Connection Error</h2>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => {
          setRetryCount(0);
          setIsLoading(true);
          setError(null);
        }}>
          Retry Connection
        </Button>
        <Button variant="outline" className="mt-2" onClick={() => router.push(`/join-chatroom/${chatroomId}`)}>Return to Joining page</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Encryption Test - Remove this in production */}


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
                <span className="font-mono text-muted">copy room link</span>
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

            {/* Admin Close Room Button */}
            {userId === chatroomCreatorId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setCloseDialogOpen(true)}
                    >
                      <AlertTriangle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close Room (Admin Only)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {/* Close Room Confirmation Dialog */}
            <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Close Room</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to permanently close this room? All participants will be removed and the room will be deactivated.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmCloseRoom}>
                    Yes, Close Room
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  {messages.map((msg) => {
                    // Check if current user is the sender using exact ID match first, then wallet addresses
                    const isCurrentUser = msg.sender?.id === userId ||
                      (msg.sender?.smart_wallet_address && msg.sender.smart_wallet_address === walletAddress) ||
                      (msg.sender?.wallet_address && msg.sender.wallet_address === walletAddress);

                    console.log("🔍 Rendering message:", {
                      messageId: msg.id,
                      senderId: msg.sender?.id,
                      senderName: msg.sender?.name,
                      senderSmartWallet: msg.sender?.smart_wallet_address,
                      senderWallet: msg.sender?.wallet_address,
                      userId: userId,
                      smart_wallet_address: undefined,
                      wallet_address: walletAddress,
                      isCurrentUser: isCurrentUser,
                      pending: msg.pending,
                      senderObject: msg.sender
                    });

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback>
                              {msg.sender?.name
                                ? msg.sender.name.charAt(0).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`flex flex-col max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {isCurrentUser ? "You" : (msg.sender?.name || "Unknown")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {msg.timestamp ? formatTime(msg.timestamp) : ""}
                            </span>
                          </div>
                          <div
                            className={`rounded-lg px-4 py-2 break-words whitespace-pre-wrap ${isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"}`}
                          >
                            {msg.content || ""}
                          </div>
                        </div>
                        {isCurrentUser && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback>
                              {msg.sender?.name
                                ? msg.sender.name.charAt(0).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
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
        <ShowSummary setShowSummary={setShowSummary} showSummary={showSummary} messages={messages.filter(m => !m.pending && m.content && m.content.trim() !== "")} />
      </div>
    </div>
  )
}