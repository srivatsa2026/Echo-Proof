"use client"

import { useEffect, useState } from "react"
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
import { MessageSquare, Plus, Search, Users, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserChatrooms } from "@/store/reducers/chatroomSlice"
import { getUserDetails } from "@/store/reducers/userSlice"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function ChatroomsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [chatroomName, setChatroomName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const userId = useSelector((state: any) => state.user.id);
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState("all")

  const { chatrooms, loading, error } = useSelector((state: any) => state.chatroom)

  useEffect(() => {
    dispatch(fetchUserChatrooms() as any)
    dispatch(getUserDetails as any)
  }, [dispatch])

  // Filtering logic
  const adminChatrooms = chatrooms.filter((room: any) => room.creatorId === userId)
  const memberChatrooms = chatrooms.filter((room: any) => room.creatorId !== userId && room.members?.some((m: any) => m.userId === userId))

  const getFilteredChatrooms = () => {
    if (activeTab === "admin") return adminChatrooms
    if (activeTab === "member") return memberChatrooms
    return chatrooms
  }

  const filteredChatrooms = getFilteredChatrooms().filter((room: any) =>
    room.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="member">Member</TabsTrigger>
        </TabsList>
      </Tabs>

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
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary/20 mb-4" />
            <span className="text-lg font-medium text-primary">Loading your chatrooms...</span>
            <span className="text-muted-foreground text-sm mt-1">Please wait while we fetch your rooms.</span>
          </div>
        ) : error ? (
          <div className="col-span-full text-center text-red-500 py-8">{error}</div>
        ) : filteredChatrooms.map((chatroom: any, index: number) => (
          <motion.div
            key={chatroom.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{chatroom.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {chatroom.members?.length || 1} participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {chatroom._count?.messages ?? 0} messages
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last active {chatroom.messages?.[0]?.sentAt ? format(new Date(chatroom.messages[0].sentAt), "PPP") : "N/A"}
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
