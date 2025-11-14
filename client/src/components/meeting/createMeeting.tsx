"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Plus, Hash, FileText, Users, Tag } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { getUserDetails } from '@/store/reducers/userSlice'
import { useRouter } from 'next/navigation'

// Smart contract implementation
import { prepareContractCall, sendTransaction, waitForReceipt } from "thirdweb"
import { getEchoContract } from '@/lib/getContract'
import { createWallet } from "thirdweb/wallets"
import { useActiveWallet } from 'thirdweb/react'

function CreateMeeting() {
    const [isCreatingMeeting, setIsCreatingMeeting] = useState(false)
    const [roomId, setRoomId] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)

    // Meeting form fields
    const [meetingForm, setMeetingForm] = useState({
        title: "",
        description: "",
        isRecorded: false,
        isPublic: true,
        meetingType: "general",
        tags: [] as string[]
    })
    const [currentTag, setCurrentTag] = useState("")

    const dispatch = useDispatch();
    const userId = useSelector((state: any) => state.user.id)
    const router = useRouter()

    // Smart contract setup
    const activeWallet = useActiveWallet()
    const contract = getEchoContract()

    useEffect(() => {
        dispatch<any>(getUserDetails())
    }, [])

    const generateRandomId = () => {
        const randomId = Math.random().toString(36).substring(2, 15);
        setRoomId(randomId);
    };

    const handleJoinRoom = () => {
        if (roomId.trim()) {
            setIsJoinDialogOpen(false)
            setRoomId("")
            router.push(`/meeting/${roomId}`);
        }
    };

    const handleAddTag = () => {
        if (currentTag.trim() && !meetingForm.tags.includes(currentTag.trim())) {
            setMeetingForm(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag.trim()]
            }))
            setCurrentTag("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setMeetingForm(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    const handleCreateMeeting = async () => {
        if (!meetingForm.title.trim()) {
            return
        }

        setIsCreatingMeeting(true)
        try {
            if (activeWallet && contract) {
                // Call smart contract function
                // const transaction = prepareContractCall({
                //     contract,
                //     method: "createMeeting",
                //     params: [
                //         meetingForm.title,
                //         meetingForm.description,
                //         "", // agenda (empty for now)
                //         0n, // scheduledDuration (0 for now)
                //         meetingForm.isRecorded,
                //         meetingForm.isPublic,
                //         meetingForm.meetingType,
                //         meetingForm.tags
                //     ]
                // })

                // const result = await sendTransaction({
                //     transaction,
                //     account: activeWallet.account!
                // })

                // const receipt = await waitForReceipt(result)
                // console.log("Meeting created on blockchain:", receipt)

                const preparedTx = prepareContractCall({
                    contract,
                    method: "function createMeeting(string memory title,string memory description,string memory agenda,uint256 scheduledDuration,bool isRecorded,bool isPublic,string memory meetingType,string[] memory tags) external returns (uint256)",
                    params: [
                        meetingForm.title,
                        meetingForm.description,
                        "", // agenda (empty for now)
                        0n, // scheduledDuration (0 for now)
                        meetingForm.isRecorded,
                        meetingForm.isPublic,
                        meetingForm.meetingType,
                        meetingForm.tags
                    ]
                });
                console.log("✅ Prepared Transaction:", preparedTx);

                // 👇 Send the transaction using Thirdweb's sendTransaction helper
                const txResult = await sendTransaction({
                    transaction: preparedTx,
                    account: activeWallet?.getAccount() as any,
                });

                console.log("📤 Transaction sent! Hash:", txResult.transactionHash);

                // 👇 Wait for confirmation
                const receipt = await waitForReceipt({
                    client: preparedTx.client,
                    chain: preparedTx.chain,
                    transactionHash: txResult.transactionHash,
                });

                console.log("🎉 Transaction Confirmed! Receipt:", receipt);




                // Generate room ID for video conference
                const sessionId = Math.random().toString(36).substring(2, 15);

                // Also save to your backend if needed
                const response = await axios.post("/api/meetings", {
                    title: meetingForm.title,
                    description: meetingForm.description,
                    startTime: new Date().toISOString(),
                    sessionId: sessionId,
                    isRecorded: meetingForm.isRecorded,
                    isPublic: meetingForm.isPublic,
                    meetingType: meetingForm.meetingType,
                    tags: meetingForm.tags,
                    // blockchainTxHash: receipt.transactionHash
                }, { withCredentials: true })

                if (response.data.success) {
                    console.log("Meeting created successfully:", response.data.meeting)
                    setIsDialogOpen(false)
                    setMeetingForm({
                        title: "",
                        description: "",
                        isRecorded: false,
                        isPublic: true,
                        meetingType: "general",
                        tags: []
                    })
                    router.push(`/meeting/${sessionId}`)
                } else {
                    console.error("Failed to create meeting:", response.data.message)
                }
            } else {
                console.error("Wallet not connected or contract not available")
            }
        } catch (error) {
            console.error("Error creating meeting:", error)
        } finally {
            setIsCreatingMeeting(false)
        }
    }

    const handleCreateInstantRoom = () => {
        const randomId = Math.random().toString(36).substring(2, 15);
        router.push(`/meeting/${randomId}`);
    };

    return (
        <div className="space-y-4">
            {/* Create Meeting Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <Video className="h-5 w-5 mr-2 text-primary" />
                        Start Meeting
                    </CardTitle>
                    <CardDescription>Create a new video meeting with custom settings</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Start Meeting
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Meeting</DialogTitle>
                                <DialogDescription>
                                    Set up your meeting with custom settings and preferences.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {/* Meeting Title */}
                                <div className="grid gap-2">
                                    <Label htmlFor="title" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Meeting Title *
                                    </Label>
                                    <Input
                                        id="title"
                                        value={meetingForm.title}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enter meeting title..."
                                    />
                                </div>

                                {/* Description */}
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={meetingForm.description}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description of the meeting..."
                                        className="min-h-[80px]"
                                    />
                                </div>

                                {/* Meeting Type */}
                                <div className="grid gap-2">
                                    <Label>Meeting Type</Label>
                                    <Select
                                        value={meetingForm.meetingType}
                                        onValueChange={(value) => setMeetingForm(prev => ({ ...prev, meetingType: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General Meeting</SelectItem>
                                            <SelectItem value="standup">Daily Standup</SelectItem>
                                            <SelectItem value="planning">Planning Session</SelectItem>
                                            <SelectItem value="review">Review Meeting</SelectItem>
                                            <SelectItem value="retrospective">Retrospective</SelectItem>
                                            <SelectItem value="interview">Interview</SelectItem>
                                            <SelectItem value="presentation">Presentation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tags */}
                                <div className="grid gap-2">
                                    <Label className="flex items-center gap-2">
                                        <Tag className="h-4 w-4" />
                                        Tags
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={currentTag}
                                            onChange={(e) => setCurrentTag(e.target.value)}
                                            placeholder="Add a tag..."
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddTag}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    {meetingForm.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {meetingForm.tags.map((tag, index) => (
                                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                    {tag}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer"
                                                        onClick={() => handleRemoveTag(tag)}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Settings */}
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Record Meeting</Label>
                                            <p className="text-sm text-muted-foreground">Save the meeting for later review</p>
                                        </div>
                                        <Switch
                                            checked={meetingForm.isRecorded}
                                            onCheckedChange={(checked) => setMeetingForm(prev => ({ ...prev, isRecorded: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Public Meeting
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Allow anyone to join with the room ID</p>
                                        </div>
                                        <Switch
                                            checked={meetingForm.isPublic}
                                            onCheckedChange={(checked) => setMeetingForm(prev => ({ ...prev, isPublic: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleCreateMeeting}
                                    disabled={isCreatingMeeting || !meetingForm.title.trim()}
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

            {/* Join Meeting Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <Hash className="h-5 w-5 mr-2 text-primary" />
                        Join Meeting
                    </CardTitle>
                    <CardDescription>Join an existing meeting with room ID</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Hash className="mr-2 h-4 w-4" />
                                Join Meeting
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Join Meeting</DialogTitle>
                                <DialogDescription>
                                    Enter the room ID to join an existing meeting.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="roomId" className="text-right">
                                        Room ID
                                    </Label>
                                    <div className="col-span-3 flex gap-2">
                                        <Input
                                            id="roomId"
                                            value={roomId}
                                            onChange={(e) => setRoomId(e.target.value)}
                                            placeholder="Enter room ID..."
                                            className="flex-1"
                                            onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={generateRandomId}
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={!roomId.trim()}
                                    className="w-full"
                                >
                                    Join Room
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Quick Create Room Card */}
            {/* <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <Plus className="h-5 w-5 mr-2 text-primary" />
                        Quick Meeting
                    </CardTitle>
                    <CardDescription>Create and join a meeting instantly</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        onClick={handleCreateInstantRoom}
                        variant="secondary" 
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Instant Room
                    </Button>
                </CardContent>
            </Card> */}
        </div>
    )
}

export default CreateMeeting



