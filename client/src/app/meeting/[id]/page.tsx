'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    const params = useParams();
    
    // Get room ID from URL params
    const roomId = params.id as string;
    
    // State for managing token and pre-join
    const [token, setToken] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [isJoining, setIsJoining] = useState(false);

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

    // Auto-join room on component mount (only if token exists)
    useEffect(() => {
        if (roomId && token) {
            console.log('Auto-joining room:', { roomId, token: token.substring(0, 20) + '...' });
            joinRoom({ roomId, token });
        }
    }, [roomId, token, joinRoom]);

    // Function to fetch access token and join meeting
    const handleJoinMeeting = async () => {
        if (!displayName.trim() || !roomId) return;
        
        setIsJoining(true);
        try {
            // Fetch access token from your API
            const response = await fetch(`/api/token?roomId=${roomId}`);
            
            if (!response.ok) {
                throw new Error('Failed to get access token');
            }
            
            // The API returns the token as plain text, not JSON
            const accessToken = await response.text();
            
            // Set the token and it will trigger the useEffect above to join the room
            setToken(accessToken);
            
        } catch (error) {
            console.error('❌ Failed to join meeting:', error);
            setConnectionStatus('failed');
        } finally {
            setIsJoining(false);
        }
    };

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
        const meetingLink = `${window.location.origin}/meeting/${roomId}`;
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

    if (!roomId) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Card className="bg-red-900/20 border-red-800">
                    <CardContent className="p-6 text-center text-red-400">
                        Invalid meeting room. Please check your meeting link.
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show pre-join UI if no token
    if (!token) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Video Preview */}
                    <div className="relative mb-8">
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-orange-900">
                            {isVideoOn && videoStream ? (
                                <Video stream={videoStream} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-black flex items-center justify-center">
                                    <VideoOff size={64} className="text-orange-600" />
                                </div>
                            )}

                            {/* Media Controls */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                                {/* Video Toggle */}
                                <Button
                                    onClick={() => isVideoOn ? disableVideo() : enableVideo()}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOn
                                            ? 'bg-orange-900 hover:bg-orange-800 text-white'
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                        }`}
                                >
                                    {isVideoOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                                </Button>

                                {/* Audio Toggle */}
                                <Button
                                    onClick={() => isAudioOn ? disableAudio() : enableAudio()}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isAudioOn
                                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                        }`}
                                >
                                    {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Display Name Input */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your display name"
                                className="w-full bg-black border border-orange-800 rounded-xl px-6 py-4 pr-12 text-white placeholder-orange-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                disabled={isJoining}
                            />
                            <Settings size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400" />
                        </div>
                    </div>

                    {/* Join Button */}
                    <Button
                        onClick={handleJoinMeeting}
                        disabled={!displayName.trim() || isJoining}
                        className="w-full bg-orange-900 hover:bg-orange-800 disabled:bg-orange-950 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all border border-orange-700"
                    >
                        {isJoining ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Joining...</span>
                            </>
                        ) : (
                            <>
                                <span>Join Meeting</span>
                                <VideoIcon size={20} />
                            </>
                        )}
                    </Button>

                    {/* Error Message */}
                    {connectionStatus === 'failed' && (
                        <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-xl">
                            <p className="text-red-400 text-center">
                                Failed to join the meeting. Please try again.
                            </p>
                        </div>
                    )}
                </div>
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
                                {displayName || 'Anonymous'}
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
                                    <Badge className="bg-orange-500 text-white">{displayName || 'You'}</Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-white font-semibold text-2xl">
                                            {(displayName || 'A').charAt(0).toUpperCase()}
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