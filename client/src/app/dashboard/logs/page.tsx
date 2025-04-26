"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageSquare, Video, ChevronDown } from "lucide-react"
import { format } from "date-fns"

// Mock data for logs
const sessionLogs = [
  {
    id: "log-123",
    sessionId: "meet-abc123",
    roomId: "room-456",
    roomName: "Weekly Team Sync",
    createdOn: new Date(Date.now() - 86400000), // 1 day ago
    duration: 58,
    totalPeers: 8,
    type: "meeting",
    summary:
      "Discussed Q2 goals, assigned tasks to team members, and reviewed the product roadmap. Action items include updating the project timeline and scheduling follow-up meetings with stakeholders.",
  },
  {
    id: "log-456",
    sessionId: "chat-def456",
    roomId: "room-789",
    roomName: "Project Alpha Discussion",
    createdOn: new Date(Date.now() - 172800000), // 2 days ago
    duration: 45,
    totalPeers: 5,
    type: "chatroom",
    summary:
      "Brainstormed ideas for the new feature set. Team agreed on prioritizing user authentication improvements and dashboard redesign. Next steps include creating wireframes and technical specifications.",
  },
  {
    id: "log-789",
    sessionId: "meet-ghi789",
    roomId: "room-012",
    roomName: "Client Presentation",
    createdOn: new Date(Date.now() - 259200000), // 3 days ago
    duration: 62,
    totalPeers: 12,
    type: "meeting",
    summary:
      "Presented the quarterly results to the client. Client was satisfied with progress but requested additional analytics features. Team will prepare a proposal for the requested features by next week.",
  },
  {
    id: "log-012",
    sessionId: "chat-jkl012",
    roomId: "room-345",
    roomName: "Marketing Strategy",
    createdOn: new Date(Date.now() - 345600000), // 4 days ago
    duration: 30,
    totalPeers: 4,
    type: "chatroom",
    summary:
      "Discussed upcoming product launch marketing strategy. Decided on a social media campaign focusing on key product benefits. Tasks were assigned to team members with deadlines for the next two weeks.",
  },
  {
    id: "log-345",
    sessionId: "meet-mno345",
    roomId: "room-678",
    roomName: "Design Review",
    createdOn: new Date(Date.now() - 432000000), // 5 days ago
    duration: 75,
    totalPeers: 6,
    type: "meeting",
    summary:
      "Reviewed the latest UI designs for the mobile app. Made several adjustments to improve usability and consistency. Design team will implement changes and prepare for user testing next week.",
  },
]

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLog, setSelectedLog] = useState<(typeof sessionLogs)[0] | null>(null)

  const filteredLogs = sessionLogs.filter(
    (log) =>
      log.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.roomId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Session Logs</h1>
          <p className="text-muted-foreground">View logs and summaries of your past sessions</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search logs by name, session ID, or room ID..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="chatrooms">Chatrooms</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="cursor-pointer hover:bg-secondary/50"
                  >
                    <TableCell className="font-mono text-xs">{log.sessionId}</TableCell>
                    <TableCell className="font-medium">{log.roomName}</TableCell>
                    <TableCell>{format(log.createdOn, "MMM d, yyyy")}</TableCell>
                    <TableCell>{log.duration} min</TableCell>
                    <TableCell>{log.totalPeers}</TableCell>
                    <TableCell>
                      <Badge variant={log.type === "meeting" ? "default" : "secondary"}>
                        {log.type === "meeting" ? (
                          <Video className="h-3 w-3 mr-1" />
                        ) : (
                          <MessageSquare className="h-3 w-3 mr-1" />
                        )}
                        {log.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setSelectedLog(log)}>
                            View
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Session Summary</DialogTitle>
                            <DialogDescription>AI-generated summary of the session</DialogDescription>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Session ID</p>
                                  <p className="text-sm font-mono">{selectedLog.sessionId}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Room Name</p>
                                  <p className="text-sm">{selectedLog.roomName}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Date</p>
                                  <p className="text-sm">{format(selectedLog.createdOn, "PPP")}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Duration</p>
                                  <p className="text-sm">{selectedLog.duration} minutes</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Participants</p>
                                  <p className="text-sm">{selectedLog.totalPeers} participants</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Type</p>
                                  <Badge variant={selectedLog.type === "meeting" ? "default" : "secondary"}>
                                    {selectedLog.type === "meeting" ? (
                                      <Video className="h-3 w-3 mr-1" />
                                    ) : (
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                    )}
                                    {selectedLog.type}
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm font-medium">Summary</p>
                                <div className="rounded-md bg-secondary/50 p-4">
                                  <p className="text-sm">{selectedLog.summary}</p>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Download Transcript</Button>
                                <Button>View Recording</Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </motion.tr>
                ))}

                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs
                  .filter((log) => log.type === "meeting")
                  .map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="cursor-pointer hover:bg-secondary/50"
                    >
                      <TableCell className="font-mono text-xs">{log.sessionId}</TableCell>
                      <TableCell className="font-medium">{log.roomName}</TableCell>
                      <TableCell>{format(log.createdOn, "MMM d, yyyy")}</TableCell>
                      <TableCell>{log.duration} min</TableCell>
                      <TableCell>{log.totalPeers}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setSelectedLog(log)}>
                              View
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Session Summary</DialogTitle>
                              <DialogDescription>AI-generated summary of the session</DialogDescription>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">Session ID</p>
                                    <p className="text-sm font-mono">{selectedLog.sessionId}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Room Name</p>
                                    <p className="text-sm">{selectedLog.roomName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Date</p>
                                    <p className="text-sm">{format(selectedLog.createdOn, "PPP")}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Duration</p>
                                    <p className="text-sm">{selectedLog.duration} minutes</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Participants</p>
                                    <p className="text-sm">{selectedLog.totalPeers} participants</p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Summary</p>
                                  <div className="rounded-md bg-secondary/50 p-4">
                                    <p className="text-sm">{selectedLog.summary}</p>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button variant="outline">Download Transcript</Button>
                                  <Button>View Recording</Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </motion.tr>
                  ))}

                {filteredLogs.filter((log) => log.type === "meeting").length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No meeting logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="chatrooms" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs
                  .filter((log) => log.type === "chatroom")
                  .map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="cursor-pointer hover:bg-secondary/50"
                    >
                      <TableCell className="font-mono text-xs">{log.sessionId}</TableCell>
                      <TableCell className="font-medium">{log.roomName}</TableCell>
                      <TableCell>{format(log.createdOn, "MMM d, yyyy")}</TableCell>
                      <TableCell>{log.duration} min</TableCell>
                      <TableCell>{log.totalPeers}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setSelectedLog(log)}>
                              View
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Session Summary</DialogTitle>
                              <DialogDescription>AI-generated summary of the session</DialogDescription>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">Session ID</p>
                                    <p className="text-sm font-mono">{selectedLog.sessionId}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Room Name</p>
                                    <p className="text-sm">{selectedLog.roomName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Date</p>
                                    <p className="text-sm">{format(selectedLog.createdOn, "PPP")}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Duration</p>
                                    <p className="text-sm">{selectedLog.duration} minutes</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Participants</p>
                                    <p className="text-sm">{selectedLog.totalPeers} participants</p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Summary</p>
                                  <div className="rounded-md bg-secondary/50 p-4">
                                    <p className="text-sm">{selectedLog.summary}</p>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button variant="outline">Download Transcript</Button>
                                  <Button>View Chat History</Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </motion.tr>
                  ))}

                {filteredLogs.filter((log) => log.type === "chatroom").length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No chatroom logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
