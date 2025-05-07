"use client"

import { useState } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock, Plus, Video, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Mock data for scheduled meetings
const scheduledMeetings = [
  {
    id: "meet-123",
    title: "Weekly Team Sync",
    date: new Date(Date.now() + 86400000), // Tomorrow
    time: "10:00 AM",
    duration: 60,
    participants: 8,
    type: "meeting",
  },
  {
    id: "meet-456",
    title: "Product Demo",
    date: new Date(Date.now() + 172800000), // 2 days from now
    time: "2:00 PM",
    duration: 45,
    participants: 12,
    type: "meeting",
  },
  {
    id: "meet-789",
    title: "Client Presentation",
    date: new Date(Date.now() + 259200000), // 3 days from now
    time: "11:30 AM",
    duration: 90,
    participants: 5,
    type: "meeting",
  },
  {
    id: "chat-101",
    title: "Design Team Discussion",
    date: new Date(Date.now() + 345600000), // 4 days from now
    time: "3:00 PM",
    duration: 30,
    participants: 4,
    type: "chatroom",
  },
]

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingType, setMeetingType] = useState("meeting")
  const [meetingDuration, setMeetingDuration] = useState("60")
  const [isScheduling, setIsScheduling] = useState(false)
  const { toast } = useToast()

  const meetingsOnSelectedDate = scheduledMeetings.filter(
    (meeting) =>
      selectedDate &&
      meeting.date.getDate() === selectedDate.getDate() &&
      meeting.date.getMonth() === selectedDate.getMonth() &&
      meeting.date.getFullYear() === selectedDate.getFullYear(),
  )

  const scheduleMeeting = () => {
    if (!meetingTitle || !date) return

    setIsScheduling(true)

    // Simulate scheduling
    setTimeout(() => {
      setIsScheduling(false)
      setMeetingTitle("")

      toast({
        title: "Meeting Scheduled",
        description: `&quot;${meetingTitle}&quot; has been scheduled for ${format(date, "PPP")} at 10:00 AM.`,
      })

    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Schedule</h1>
          <p className="text-muted-foreground">Manage your upcoming meetings and sessions</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a Session</DialogTitle>
              <DialogDescription>Plan a meeting or chatroom for your team.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="session-title">Session Title</Label>
                <Input
                  id="session-title"
                  placeholder="e.g., Weekly Team Sync"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="session-type">Session Type</Label>
                <Select defaultValue={meetingType} onValueChange={setMeetingType}>
                  <SelectTrigger id="session-type">
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Video Meeting</SelectItem>
                    <SelectItem value="chatroom">Chatroom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Time</Label>
                  <Select defaultValue="10:00">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="09:30">9:30 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="10:30">10:30 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="11:30">11:30 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Duration</Label>
                  <Select defaultValue={meetingDuration} onValueChange={setMeetingDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={scheduleMeeting} disabled={isScheduling || !meetingTitle || !date}>
                {isScheduling ? "Scheduling..." : "Schedule Session"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? `Sessions for ${format(selectedDate, "MMMM d, yyyy")}` : "Scheduled Sessions"}
            </CardTitle>
            <CardDescription>{meetingsOnSelectedDate.length} sessions scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meetingsOnSelectedDate.length > 0 ? (
                meetingsOnSelectedDate.map((meeting, index) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-0">
                        <div className="flex items-center p-4 gap-4">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center",
                              meeting.type === "meeting" ? "bg-primary/20" : "bg-secondary",
                            )}
                          >
                            {meeting.type === "meeting" ? (
                              <Video className="h-5 w-5 text-primary" />
                            ) : (
                              <Users className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{meeting.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>
                                {meeting.time} • {meeting.duration} min
                              </span>
                              <span className="mx-2">•</span>
                              <span>{meeting.participants} participants</span>
                            </div>
                          </div>
                          <Button size="sm">{meeting.type === "meeting" ? "Join Meeting" : "Join Chat"}</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Sessions Scheduled</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    There are no sessions scheduled for this date. Use the &quot;Schedule Session&quot; button to create a new session.
                  </p>

                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
