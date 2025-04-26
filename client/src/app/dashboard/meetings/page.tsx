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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Plus, Search, Users, Clock, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

// Mock data for meetings
const upcomingMeetings = [
  {
    id: "meet-123abc",
    name: "Weekly Team Sync",
    participants: 8,
    scheduledFor: new Date(Date.now() + 86400000), // Tomorrow
    duration: 60,
  },
  {
    id: "meet-456def",
    name: "Product Demo",
    participants: 12,
    scheduledFor: new Date(Date.now() + 172800000), // 2 days from now
    duration: 45,
  },
  {
    id: "meet-789ghi",
    name: "Client Presentation",
    participants: 5,
    scheduledFor: new Date(Date.now() + 259200000), // 3 days from now
    duration: 90,
  },
]

const pastMeetings = [
  {
    id: "meet-101jkl",
    name: "Design Review",
    participants: 4,
    scheduledFor: new Date(Date.now() - 86400000), // Yesterday
    duration: 30,
  },
  {
    id: "meet-202mno",
    name: "Sprint Planning",
    participants: 10,
    scheduledFor: new Date(Date.now() - 172800000), // 2 days ago
    duration: 120,
  },
]

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [meetingName, setMeetingName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const filteredUpcoming = upcomingMeetings.filter((meeting) =>
    meeting.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPast = pastMeetings.filter((meeting) => meeting.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const createMeeting = () => {
    if (!meetingName) return

    setIsCreating(true)

    // Simulate meeting creation
    setTimeout(() => {
      setIsCreating(false)
      setMeetingName("")

      toast({
        title: "Meeting Created",
        description: `"${meetingName}" has been created successfully.`,
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Meetings</h1>
          <p className="text-muted-foreground">Create and manage your video meetings</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Meeting</DialogTitle>
              <DialogDescription>Give your meeting a name to get started.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="meeting-name">Meeting Name</Label>
                <Input
                  id="meeting-name"
                  placeholder="e.g., Team Sync"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createMeeting} disabled={isCreating || !meetingName}>
                {isCreating ? "Creating..." : "Start Meeting"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search meetings..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpcoming.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{meeting.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {meeting.participants} participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(meeting.scheduledFor, "PPP")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {meeting.duration} minutes
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/meeting/${meeting.id}`}>Join Meeting</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredUpcoming.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Upcoming Meetings</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                {searchQuery
                  ? `No meetings match "${searchQuery}". Try a different search term.`
                  : "You don't have any upcoming meetings scheduled. Create a new meeting to get started."}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPast.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{meeting.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {meeting.participants} participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(meeting.scheduledFor, "PPP")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {meeting.duration} minutes
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/dashboard/recordings`}>View Recording</Link>
                      </Button>
                      <Button variant="secondary" className="flex-1" asChild>
                        <Link href={`/dashboard/logs`}>View Summary</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPast.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Past Meetings</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                {searchQuery
                  ? `No meetings match "${searchQuery}". Try a different search term.`
                  : "You don't have any past meetings. Once you complete meetings, they will appear here."}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
