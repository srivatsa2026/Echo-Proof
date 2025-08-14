"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRoom } from '@/lib/create-room'
import axios from 'axios'
import { useDispatch, UseDispatch, useSelector } from 'react-redux'
import { getUserDetails } from '@/store/reducers/userSlice'
import { useRouter } from 'next/navigation'
function CreateMeeting() {
    const [isCreatingMeeting, setIsCreatingMeeting] = useState(false)
    const [roomName, setRoomName] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const dispatch = useDispatch();
    const userId = useSelector((state: any) => state.user.id)
    const router = useRouter()
    
    useEffect(() => {
        dispatch<any>(getUserDetails())
    }, [])

    const handleCreateMeeting = async () => {
        if (!roomName.trim()) {
            return
        }

        setIsCreatingMeeting(true)
        try {
            const sessionId = await createRoom(roomName)
            if (sessionId && roomName) {
                const response = await axios.post("/api/meetings", {
                    title: roomName,
                    startTime: new Date().toISOString(),
                    sessionId: sessionId,
                    tokenGated: false
                },{withCredentials:true})
                
                if (response.data.success) {
                    console.log("Meeting created successfully:", response.data.meeting)
                    // Close dialog first
                    setIsDialogOpen(false)
                    setRoomName("")
                    router.push(`/meeting/${sessionId}`)
                    // router.push(`/join-meeting/${sessionId}`)
                } else {
                    console.error("Failed to create meeting:", response.data.message)
                }
            }
        } catch (error) {
            console.error("Error creating meeting:", error)
        } finally {
            setIsCreatingMeeting(false)
        }
    }
    return (
        <div>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <Video className="h-5 w-5 mr-2 text-primary" />
                        Start Meeting
                    </CardTitle>
                    <CardDescription>Start an instant video meeting</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Start Meeting
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Meeting</DialogTitle>
                                <DialogDescription>
                                    Enter a name for your meeting room to get started.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="roomName" className="text-right">
                                        Room Name
                                    </Label>
                                    <Input
                                        id="roomName"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        placeholder="Enter room name..."
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleCreateMeeting}
                                    disabled={isCreatingMeeting || !roomName.trim()}
                                    className="w-full"
                                >
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
                                            Creating Meeting...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Video className="mr-2 h-4 w-4" />
                                            Create Meeting
                                        </span>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateMeeting
