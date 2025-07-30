"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, Copy, MessageSquare, Video, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { stateLogin } from "@/store/reducers/userSlice"
import { CreateChatroomCard } from "@/components/chatroom/createChatRoom"
import { useActiveWallet } from "thirdweb/react"
import { useDispatch } from "react-redux"
import UserActivity from "@/components/dashboard/userActivity"
import CreateMeeting from "@/components/meeting/createMeeting"



export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [meetingTitle, setMeetingTitle] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const dispatch = useDispatch()
  const activeWallet = useActiveWallet()
  const { toast } = useToast()





  const createMeeting = () => {
    setIsCreatingMeeting(true)

    // Simulate meeting creation
    setTimeout(() => {
      const id = "meet-" + Math.random().toString(36).substring(2, 8)
      setSessionId(id)
      setIsCreatingMeeting(false)

      toast({
        title: "Meeting Created",
        description: "Your meeting has been created successfully.",
      })
    }, 1000)
  }

  const scheduleMeeting = () => {
    if (!meetingTitle || !date) return

    setIsScheduling(true)

    // Simulate scheduling
    setTimeout(() => {
      setIsScheduling(false)
      setMeetingTitle("")

      toast({
        title: "Meeting Scheduled",
        description: `"${meetingTitle}" has been scheduled for ${format(date, "PPP")}`,
      })
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Session ID copied to clipboard.",
    })
  }

  return (
    <div className="space-y-8">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CreateChatroomCard />
        <CreateMeeting />

        {/* <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Video className="h-5 w-5 mr-2 text-primary" />
              Start Meeting
            </CardTitle>
            <CardDescription>Start an instant video meeting</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createMeeting} disabled={isCreatingMeeting} className="w-full">
              {isCreatingMeeting ? (
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
                  Starting...
                </span>
              ) : (
                <span className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Meeting
                </span>
              )}
            </Button>
          </CardContent>
        </Card> */}


        {/* the below commented card is for the meeting scheduling */}
        {/* <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
              Schedule Meeting
            </CardTitle>
            <CardDescription>Plan a meeting for later</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule a Meeting</DialogTitle>
                  <DialogDescription>Set up a meeting for your team.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="meeting-title">Meeting Title</Label>
                    <Input
                      id="meeting-title"
                      placeholder="Weekly Team Sync"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                    />
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
                  <div className="grid gap-2">
                    <Label>Time</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <Clock className="mr-2 h-4 w-4" />
                            10:00 AM
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="p-4">
                            <p className="text-sm text-muted-foreground">Time selection would go here</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={scheduleMeeting} disabled={isScheduling || !meetingTitle || !date}>
                    {isScheduling ? "Scheduling..." : "Schedule Meeting"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card> */}
      </motion.div>

      {sessionId && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">Session Created Successfully</h3>
                  <p className="text-sm text-muted-foreground">Share this session ID with others to invite them</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input value={sessionId} readOnly className="font-mono text-sm bg-background/50" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(sessionId)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  asChild
                  disabled={isJoining}
                  onClick={async (e) => {
                    setIsJoining(true)
                    // Simulate navigation delay; replace with actual navigation if needed
                    setTimeout(() => {
                      setIsJoining(false)
                    }, 1200)
                  }}
                >
                  <Link href={sessionId.startsWith("chat") ? `/chatroom/${sessionId}` : `/meeting/${sessionId}`}>
                    {isJoining ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Joining...
                      </span>
                    ) : (
                      <span>
                        {sessionId.startsWith("chat") ? "Join Chatroom" : "Join Meeting"}
                      </span>
                    )}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* <UserActivity /> */}
    </div>
  )
}
