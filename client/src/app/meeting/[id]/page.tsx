'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRoom } from '@huddle01/react/hooks';
import {
    useLocalVideo,
    useLocalAudio,
    useLocalScreenShare,
    usePeerIds,
    useRemoteVideo,
    useRemoteAudio,
    useRemoteScreenShare
} from "@huddle01/react/hooks";
import { Video, Audio } from '@huddle01/react/components';
import { Role } from "@huddle01/server-sdk/auth";
import { motion } from "framer-motion";
import { 
    Video as VideoIcon, 
    VideoOff, 
    Mic, 
    MicOff, 
    Monitor, 
    MonitorOff,
    Phone,
    Settings,
    Users,

    Square,
    Copy,
    Share,
    Maximize,
    Minimize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RemotePeerProps {
    peerId: string;
    onAudioTrack?: (track: MediaStreamTrack) => void;
    username?: string;
}

const RemotePeer: React.FC<RemotePeerProps> = ({ peerId, onAudioTrack, username }) => {
    const { stream: videoStream } = useRemoteVideo({ peerId });
    const { stream: audioStream } = useRemoteAudio({ peerId });
    const { videoStream: screenVideoStream, audioStream: screenAudioStream } = useRemoteScreenShare({ peerId });

    useEffect(() => {
        if (audioStream) {
            const track = audioStream.getAudioTracks()[0];
            if (track && onAudioTrack) onAudioTrack(track);
        }

        if (screenAudioStream) {
            const track = screenAudioStream.getAudioTracks()[0];
            if (track && onAudioTrack) onAudioTrack(track);
        }
    }, [audioStream, screenAudioStream, onAudioTrack]);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-700"
        >
            {/* Screen share has priority over camera */}
            {screenVideoStream ? (
                <div className="aspect-video">
                    <Video stream={screenVideoStream} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-500 text-white">Screen Share</Badge>
                    </div>
                </div>
            ) : videoStream ? (
                <div className="aspect-video">
                    <Video stream={videoStream} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-800">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xl">
                            {username ? username.charAt(0).toUpperCase() : '?'}
                        </span>
                    </div>
                </div>
            )}

            {/* Participant name */}
            <div className="absolute bottom-2 left-2">
                <Badge className="bg-black/70 text-white border-0">
                    {username || `Participant ${peerId.slice(0, 6)}`}
                </Badge>
            </div>

            {/* Audio indicators */}
            {audioStream && <Audio stream={audioStream} />}
            {screenAudioStream && <Audio stream={screenAudioStream} />}
        </motion.div>
    );
};

interface ShowPeersProps {
    onRemoteAudioTrack?: (track: MediaStreamTrack) => void;
}

const ShowPeers: React.FC<ShowPeersProps> = ({ onRemoteAudioTrack }) => {
    const { peerIds } = usePeerIds({ roles: [Role.HOST, Role.CO_HOST, Role.GUEST] });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {peerIds.map(peerId => (
                <RemotePeer 
                    key={peerId} 
                    peerId={peerId} 
                    onAudioTrack={onRemoteAudioTrack}
                    username={`User ${peerId.slice(0, 6)}`}
                />
            ))}
        </div>
    );
};

export default function MeetingRoom() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Get params from URL
    const roomId = searchParams.get('roomId');
    const token = searchParams.get('token');
    const username = searchParams.get('username') || 'Anonymous';

    // Room state
    const { joinRoom, leaveRoom, room, state } = useRoom({
        onJoin: () => {
            console.log('✅ Joined the room');
            setConnectionStatus('connected');
        },
        onLeave: () => {
            console.log('👋 Left the room');
            setConnectionStatus('disconnected');
        },
        onFailed: (error) => {
            console.error('❌ Failed to join room:', error);
            setConnectionStatus('failed');
        }
    });

    // Media controls
    const { stream: videoStream, enableVideo, disableVideo, isVideoOn } = useLocalVideo();
    const { stream: audioStream, enableAudio, disableAudio, isAudioOn } = useLocalAudio();
    const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();

    // Recording
    const mixedStreamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const [chunks, setChunks] = useState<Blob[]>([]);
    const [isRecording, setIsRecording] = useState(false);

    // UI State
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>('connecting');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Auto-join room on component mount
    useEffect(() => {
        if (roomId && token) {
            console.log('Auto-joining room:', { roomId, token: token.substring(0, 20) + '...' });
            joinRoom({ roomId, token });
        } else {
            console.error('Missing roomId or token');
            setConnectionStatus('failed');
        }
    }, [roomId, token, joinRoom]);

    // Mix local audio for recording
    useEffect(() => {
        if (audioStream) {
            const micTrack = audioStream.getAudioTracks()[0];
            if (micTrack) {
                if (!mixedStreamRef.current) mixedStreamRef.current = new MediaStream();
                mixedStreamRef.current.addTrack(micTrack);
            }
        }
    }, [audioStream]);

    // Handle remote audio for recording
    const handleRemoteAudioTrack = (track: MediaStreamTrack) => {
        if (!mixedStreamRef.current) {
            mixedStreamRef.current = new MediaStream();
        }

        const existingTracks = mixedStreamRef.current.getAudioTracks();
        const alreadyAdded = existingTracks.find(t => t.id === track.id);
        if (!alreadyAdded) {
            mixedStreamRef.current.addTrack(track);
        }
    };

    // Recording functions
    const startRecording = () => {
        if (!mixedStreamRef.current) {
            console.warn("❌ No audio to record.");
            return;
        }

        const recorder = new MediaRecorder(mixedStreamRef.current);
        recorderRef.current = recorder;
        const tempChunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) tempChunks.push(e.data);
        };

        recorder.onstop = () => {
            setChunks(tempChunks);
            const audioBlob = new Blob(tempChunks, { type: 'audio/webm' });

            // Download blob
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meeting-${roomId}-${new Date().toISOString()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
        };

        recorder.start();
        setIsRecording(true);
        console.log("🎥 Recording started");
    };

    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stop();
            setIsRecording(false);
            console.log("📼 Recording stopped");
        }
    };

    // Leave meeting
    const handleLeaveMeeting = () => {
        if (isRecording) {
            stopRecording();
        }
        leaveRoom();
        router.push('/');
    };

    // Copy meeting link
    const copyMeetingLink = () => {
        const meetingLink = `${window.location.origin}/join/${roomId}`;
        navigator.clipboard.writeText(meetingLink);
        // You could add a toast notification here
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (!roomId || !token) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Card className="bg-red-900/20 border-red-800">
                    <CardContent className="p-6 text-center text-red-400">
                        Missing room ID or access token. Please join through the proper meeting link.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-gray-900 flex flex-col">
                {/* Header */}
                <div className="bg-gray-800 border-b border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    connectionStatus === 'connected' ? 'bg-green-500' : 
                                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                }`} />
                                <span className="text-white font-medium">
                                    Meeting Room
                                </span>
                            </div>
                            <Badge variant="outline" className="text-gray-300">
                                {username}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyMeetingLink}
                                className="text-gray-300 border-gray-600"
                            >
                                <Share className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleFullscreen}
                                className="text-gray-300 border-gray-600"
                            >
                                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col p-4 gap-4">
                    {/* Local Video */}
                    <div className="relative">
                        {videoStream ? (
                            <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                                <Video stream={videoStream} className="w-full h-full object-cover" />
                                <div className="absolute bottom-4 left-4">
                                    <Badge className="bg-orange-500 text-white">You</Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-white font-semibold text-2xl">
                                            {username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-gray-400">Camera is off</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Remote Participants */}
                    <div className="flex-1">
                        <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Participants
                        </h3>
                        <ShowPeers onRemoteAudioTrack={handleRemoteAudioTrack} />
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-gray-800 border-t border-gray-700 p-4">
                    <div className="flex items-center justify-center gap-4">
                        {/* Audio Control */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isAudioOn ? "default" : "destructive"}
                                    onClick={() => isAudioOn ? disableAudio() : enableAudio()}
                                    className="rounded-full w-12 h-12 p-0"
                                >
                                    {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isAudioOn ? 'Mute' : 'Unmute'}
                            </TooltipContent>
                        </Tooltip>

                        {/* Video Control */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isVideoOn ? "default" : "destructive"}
                                    onClick={() => isVideoOn ? disableVideo() : enableVideo()}
                                    className="rounded-full w-12 h-12 p-0"
                                >
                                    {isVideoOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                            </TooltipContent>
                        </Tooltip>

                        {/* Screen Share */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={shareStream ? "default" : "outline"}
                                    onClick={() => shareStream ? stopScreenShare() : startScreenShare()}
                                    className="rounded-full w-12 h-12 p-0"
                                >
                                    {shareStream ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {shareStream ? 'Stop sharing' : 'Share screen'}
                            </TooltipContent>
                        </Tooltip>

                        {/* Recording */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isRecording ? "destructive" : "outline"}
                                    onClick={() => isRecording ? stopRecording() : startRecording()}
                                    className="rounded-full w-12 h-12 p-0"
                                >
                                    {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isRecording ? 'Stop recording' : 'Start recording'}
                            </TooltipContent>
                        </Tooltip>

                        {/* Leave Meeting */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="destructive"
                                    onClick={handleLeaveMeeting}
                                    className="rounded-full w-12 h-12 p-0 ml-4"
                                >
                                    <Phone className="w-5 h-5 rotate-180" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Leave meeting
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Recording Status */}
                    {isRecording && (
                        <div className="flex items-center justify-center mt-4">
                            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 rounded-full px-4 py-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-red-400 text-sm font-medium">Recording</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}