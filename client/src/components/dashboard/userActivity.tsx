'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent } from '../ui/card'
import { cn } from '@/lib/utils'
import { CalendarIcon, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast' // make sure this is correct for your project

interface Meeting {
    id: string
    created_at: string
    is_private: boolean
    name: string
    purpose: string
    active: boolean
    creator_id: string
}

const CustomLoader = () => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <motion.div
                className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
        </div>
        <p className="mt-4 text-muted-foreground">Loading your sessions...</p>
    </div>
)

export default function UserActivity() {
    const { toast } = useToast()
    const [chatrooms, setChatrooms] = useState<Meeting[]>([])
    const [videoMeetings, setVideoMeetings] = useState<Meeting[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    const hasFetched = useRef(false)

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date)
        } catch {
            return 'Invalid date'
        }
    }

    const fetchUserActivity = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true)
        } else {
            setLoading(true)
        }

        setError(null)

        try {
            const response = await axios.get('/api/get-user-activity', { withCredentials: true })
            const chatroomsData = response.data.chatrooms || []

            const formattedData: Meeting[] = chatroomsData.map((item: any) => ({
                id: item.id || '',
                created_at: item.created_at || '',
                is_private: item.is_private === 'TRUE' || item.is_private === true,
                name: item.name || '',
                purpose: item.purpose || '',
                active: item.active === 'TRUE' || item.active === true,
                creator_id: item.creator_id || '',
            }))

            const chatroomList: Meeting[] = []
            const videoList: Meeting[] = []

            formattedData.forEach((meeting) => {
                if (meeting.purpose.toLowerCase().includes('video')) {
                    videoList.push(meeting)
                } else {
                    chatroomList.push(meeting)
                }
            })

            setChatrooms(chatroomList)
            setVideoMeetings(videoList)
        } catch (err) {
            console.error('Error fetching activity data:', err)
            setError('Failed to load data. Please try again.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true
        fetchUserActivity()
    }, [fetchUserActivity])

    const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id)
        toast({
            title: 'Copied!',
            description: `Activity ID "${id}" copied to clipboard.`,
        })
    }

    const handleRefresh = () => {
        fetchUserActivity(true)
    }

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Sessions Found</h3>
            <p className="text-muted-foreground max-w-sm">
                You don&apos;t have any sessions in this category. Create a new chatroom or meeting to get started.
            </p>
        </div>
    )

    const renderMeetings = (meetings: Meeting[], type: 'chatroom' | 'meeting') =>
        meetings.map((meeting) => {
            const basePath = type === 'chatroom' ? '/chatroom' : '/meetings'
            return (
                <Card key={meeting.id} className="mb-4 p-2">
                    <CardContent className="flex flex-row justify-between items-center">
                        <div className='pt-3'>
                            <h3 className="text-lg font-medium">{meeting.name}</h3>
                            <p className="text-sm text-muted-foreground">{meeting.purpose}</p>
                            <p className="text-xs">{formatDate(meeting.created_at)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4 gap-2">
                            <Button onClick={() => handleCopy(meeting.id)}>Copy ID</Button>
                            <Button variant="secondary">
                                <Link href={`${basePath}/${meeting.id}`} className="text-primary">
                                    Join
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
        })

    if (loading) return <CustomLoader />

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">User Activity</h2>
                    <Button onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>

                <Tabs defaultValue="chatrooms">
                    <TabsList>
                        <TabsTrigger value="chatrooms">Chatrooms</TabsTrigger>
                        <TabsTrigger value="videomeetings">Video Meetings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chatrooms">
                        {chatrooms.length === 0 ? <EmptyState /> : renderMeetings(chatrooms, 'chatroom')}
                    </TabsContent>

                    <TabsContent value="videomeetings">
                        {videoMeetings.length === 0 ? <EmptyState /> : renderMeetings(videoMeetings, 'meeting')}
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    )
}
