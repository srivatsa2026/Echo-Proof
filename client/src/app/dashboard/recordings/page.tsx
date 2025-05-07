"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Video, Play, Download, MoreVertical, Trash2, Calendar, Users } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Mock data for recordings
const recordings = [
  {
    id: "rec-123",
    roomName: "Weekly Team Sync",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "58:24",
    createdOn: new Date(Date.now() - 86400000), // 1 day ago
    participants: 8,
    status: "available",
  },
  {
    id: "rec-456",
    roomName: "Product Demo",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "45:12",
    createdOn: new Date(Date.now() - 172800000), // 2 days ago
    participants: 12,
    status: "available",
  },
  {
    id: "rec-789",
    roomName: "Client Presentation",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "62:05",
    createdOn: new Date(Date.now() - 259200000), // 3 days ago
    participants: 5,
    status: "available",
  },
  {
    id: "rec-012",
    roomName: "Design Review",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "30:18",
    createdOn: new Date(Date.now() - 345600000), // 4 days ago
    participants: 4,
    status: "processing",
  },
  {
    id: "rec-345",
    roomName: "Sprint Planning",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "75:40",
    createdOn: new Date(Date.now() - 432000000), // 5 days ago
    participants: 10,
    status: "available",
  },
]

export default function RecordingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecording, setSelectedRecording] = useState<(typeof recordings)[0] | null>(null)
  const { toast } = useToast()

  const filteredRecordings = recordings.filter((recording) =>
    recording.roomName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const deleteRecording = (id: string) => {
    toast({
      title: "Recording Deleted",
      description: "The recording has been deleted successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Recordings</h1>
          <p className="text-muted-foreground">View and manage your meeting recordings</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search recordings..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecordings.map((recording, index) => (
          <motion.div
            key={recording.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="relative">
                <Image
                  src={recording.thumbnail || "/placeholder.svg"}
                  alt={recording.roomName}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setSelectedRecording(recording)}
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{selectedRecording?.roomName}</DialogTitle>
                        <DialogDescription>
                          Recorded on {selectedRecording && format(selectedRecording.createdOn, "PPP")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="aspect-video bg-black rounded-md flex items-center justify-center">
                        <div className="text-muted-foreground">
                          <Video className="h-12 w-12 mx-auto mb-4" />
                          <p>Video player would be here</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge variant={recording.status === "available" ? "default" : "secondary"}>
                    {recording.status === "available" ? "Recording available" : "Processing"}
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {recording.duration}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium truncate mb-1">{recording.roomName}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(recording.createdOn, "MMM d, yyyy")}
                      <span className="mx-2">•</span>
                      <Users className="h-3 w-3 mr-1" />
                      {recording.participants} participants
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer" disabled={recording.status !== "available"}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => deleteRecording(recording.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredRecordings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Recordings Found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            {searchQuery
              ? `No recordings match "${searchQuery}". Try a different search term.`
              : "You don't have any recordings yet. Recordings will appear here after your meetings."}
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
