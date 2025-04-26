"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus, Search, Users, Clock } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

// Mock data for chatrooms
const chatrooms = [
  {
    id: "chat-123abc",
    name: "Project Alpha Discussion",
    participants: 5,
    lastActive: new Date(Date.now() - 3600000), // 1 hour ago
    messages: 24,
  },
  {
    id: "chat-456def",
    name: "Marketing Team",
    participants: 8,
    lastActive: new Date(Date.now() - 86400000), // 1 day ago
    messages: 128,
  },
  {
    id: "chat-789ghi",
    name: "Design Feedback",
    participants: 3,
    lastActive: new Date(Date.now() - 172800000), // 2 days ago
    messages: 56,
  },
  {
    id: "chat-101jkl",
    name: "Customer Support",
    participants: 12,
    lastActive: new Date(Date.now() - 259200000), // 3 days ago
    messages: 312,
  },
]

export default function ChatroomsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [chatroomName, setChatroomName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const filteredChatrooms = chatrooms.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const createChatroom = () => {
    if (!chatroomName) return

    setIsCreating(true)

    // Simulate chatroom creation
    setTimeout(() => {
      setIsCreating(false)
      setChatroomName("")

      toast({
        title: "Chatroom Created",
        description: `"${chatroomName}" has been created successfully.`,
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Chatrooms</h1>
          <p className="text-muted-foreground">Create and manage your chatrooms</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Chatroom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Chatroom</DialogTitle>
              <DialogDescription>Give your chatroom a name to get started.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="chatroom-name">Chatroom Name</Label>
                <Input
                  id="chatroom-name"
                  placeholder="e.g., Project Discussion"
                  value={chatroomName}
                  onChange={(e) => setChatroomName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createChatroom} disabled={isCreating || !chatroomName}>
                {isCreating ? "Creating..." : "Create Chatroom"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search chatrooms..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChatrooms.map((chatroom, index) => (
          <motion.div
            key={chatroom.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{chatroom.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {chatroom.participants} participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {chatroom.messages} messages
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last active {format(chatroom.lastActive, "PPP")}
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/chatroom/${chatroom.id}`}>Join Chatroom</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredChatrooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Chatrooms Found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            {searchQuery
              ? `No chatrooms match "${searchQuery}". Try a different search term.`
              : "You haven't created any chatrooms yet. Create a new chatroom to get started."}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
