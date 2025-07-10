"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MessageSquare, Copy } from "lucide-react"
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
import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { createChatroom } from "@/store/reducers/chatroomSlice"
import { useRouter } from "next/navigation"
import Link from "next/link"
import JoinChatroom from "./joinChatroom"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

export enum TokenStandard {
    ERC20 = 'ERC20',
    ERC721 = 'ERC721',
    ERC1155 = 'ERC1155',
}

interface Props {
    onCreated?: (sessionId: string) => void
}

export function CreateChatroomCard({ onCreated }: Props) {
    const { toast } = useToast()
    const router = useRouter()
    const dispatch = useDispatch()

    const [open, setOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState("")
    const [tokenGated, setTokenGated] = useState(false)
    const [tokenAddress, setTokenAddress] = useState("")
    const [tokenStandard, setTokenStandard] = useState("")
    const [sessionId, setSessionId] = useState("")

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied!",
            description: "Session ID copied to clipboard.",
        })
    }

    const handleCreateChatroom = async () => {
        if (!title.trim() || (tokenGated && (!tokenAddress.trim() || !tokenStandard.trim()))) {
            toast({
                title: "Missing Info",
                description: tokenGated ? "Please fill in all required fields for a token-gated room." : "Please fill in the room name.",
                variant: "destructive",
            })
            return
        }

        setIsCreating(true)

        try {
            const result = await dispatch<any>(
                createChatroom({
                    title,
                    tokenGated,
                    tokenAddress: tokenGated ? tokenAddress : null,
                    tokenStandard: tokenGated ? tokenStandard : null,
                    toast,
                    router
                })
            ).unwrap()
            console.log("the result is ", result.chatroom.id)
            if (result?.chatroom?.id) {
                setSessionId(result.chatroom.id)
                onCreated?.(result.chatroom.id)
                router.push(`/join-chatroom/${result.chatroom.id}`)
            }

            setTitle("")
            setTokenGated(false)
            setTokenAddress("")
            setTokenStandard("")
            setOpen(false)

        } catch (error: any) {
            toast({
                title: "Failed",
                description: error.message || "Something went wrong while creating the chatroom.",
                variant: "destructive",
            })
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                        Create Chatroom
                    </CardTitle>
                    <CardDescription>Start a new chatroom for your team</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Chatroom
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create Chatroom</DialogTitle>
                                <DialogDescription>Start a new chatroom for your team</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Room Name</Label>
                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter chatroom name" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="tokenGated" className="text-right flex items-center gap-1">
                                        Token Gated
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span tabIndex={0} className="cursor-pointer flex items-center">
                                                    <Info className="h-4 w-4 text-blue-500" />
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="bg-neutral-800 text-white">
                                                <div className="max-w-xs text-left">
                                                    <strong>Token Gated</strong> chatrooms require users to own a specific blockchain token (e.g., ERC-20, ERC-721) to join. This enables exclusive access for holders of a certain NFT or token. Set the token address and standard to restrict entry. Only users with the required token in their wallet can participate.
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Checkbox id="tokenGated" checked={tokenGated} onCheckedChange={checked => setTokenGated(!!checked)} className="col-span-1" />
                                </div>
                                {tokenGated && (
                                    <>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="tokenAddress" className="text-right">Token Address</Label>
                                            <Input id="tokenAddress" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="0x..." className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="tokenStandard" className="text-right">Token Standard</Label>
                                            <select
                                                id="tokenStandard"
                                                value={tokenStandard}
                                                onChange={e => setTokenStandard(e.target.value)}
                                                className="col-span-3 border rounded px-2 py-1 bg-background text-foreground"
                                            >
                                                <option value="">Select standard</option>
                                                <option value={TokenStandard.ERC20}>ERC-20</option>
                                                <option value={TokenStandard.ERC721}>ERC-721</option>
                                                <option value={TokenStandard.ERC1155}>ERC-1155</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateChatroom} disabled={isCreating} className="w-full">
                                    {isCreating ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Chatroom
                                        </span>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>


        </>
    )
}
