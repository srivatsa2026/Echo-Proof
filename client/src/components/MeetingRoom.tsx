"use client";

import { useRoom, useLocalVideo, useLocalAudio, useLocalScreenShare, usePeerIds } from "@huddle01/react/hooks";
import { Video as VideoComponent, Audio as AudioComponent } from "@huddle01/react/components";
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, PhoneOff, Users, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import RemotePeer from "./RemotePeer";
import { Role } from "@huddle01/server-sdk/auth";
import { useToast } from "@/hooks/use-toast";

interface MeetingRoomProps {
  roomId: string;
  accessToken: string;
}

export default function MeetingRoom({ roomId, accessToken }: MeetingRoomProps) {
  const router = useRouter();
  const [showParticipants, setShowParticipants] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const { toast } = useToast();
  const previousPeerCount = useRef(0);

  const { joinRoom, leaveRoom } = useRoom({
    onJoin: () => {
      console.log("Joined the room");
      setIsJoined(true);
      toast({
        title: "✅ Connected",
        description: "You've joined the meeting successfully",
        duration: 3000,
      });
    },
    onLeave: () => {
      console.log("Left the room");
      setIsJoined(false);
      router.push("/");
    },
  });

  const { stream: videoStream, enableVideo, disableVideo, isVideoOn } = useLocalVideo();
  const { stream: audioStream, enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();
  const { peerIds } = usePeerIds({ roles: [Role.HOST, Role.CO_HOST] });
  console.log("Current Peer IDs:", peerIds);

  // Monitor peer changes
  useEffect(() => {
    if (peerIds.length > previousPeerCount.current) {
      // New participant joined
      toast({
        title: "👋 Participant Joined",
        description: `A new participant has joined the meeting`,
        duration: 3000,
      });
    } else if (peerIds.length < previousPeerCount.current) {
      // Participant left
      toast({
        title: "👋 Participant Left",
        description: `A participant has left the meeting`,
        duration: 3000,
      });
    }
    previousPeerCount.current = peerIds.length;
  }, [peerIds.length, toast]);

  useEffect(() => {
    joinRoom({
      roomId,
      token: accessToken,
    });

    return () => {
      if (isJoined) {
        leaveRoom();
      }
    };
  }, [roomId, accessToken, isJoined, joinRoom, leaveRoom]);

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold text-lg">Huddle01 Meeting</h1>
          <button
            onClick={copyRoomId}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-sm text-gray-300 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? "Copied!" : roomId.slice(0, 8)}...</span>
          </button>
        </div>
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors"
        >
          <Users className="w-5 h-5" />
          <span className="hidden sm:inline">{peerIds.length + 1}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className={`grid gap-4 h-full ${peerIds.length === 0 ? 'grid-cols-1' : peerIds.length === 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
              {videoStream ? (
                <VideoComponent stream={videoStream} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    You
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                You {!isAudioOn && <span className="text-red-400">(Muted)</span>}
              </div>
            </div>

            {/* Remote Peers */}
            {peerIds.map((peerId) => (
              <RemotePeer key={peerId} peerId={peerId} />
            ))}
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <h2 className="text-white font-semibold text-lg mb-4">
              Participants ({peerIds.length + 1})
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  Y
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">You</div>
                  <div className="text-gray-400 text-sm">Host</div>
                </div>
              </div>
              {peerIds.map((peerId, index) => (
                <div key={peerId} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Participant {index + 1}</div>
                    <div className="text-gray-400 text-sm">Guest</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls Footer */}
      <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => (isAudioOn ? disableAudio() : enableAudio())}
            className={`p-4 rounded-full transition-colors ${
              isAudioOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => (isVideoOn ? disableVideo() : enableVideo())}
            className={`p-4 rounded-full transition-colors ${
              isVideoOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => (shareStream ? stopScreenShare() : startScreenShare())}
            className={`p-4 rounded-full transition-colors ${
              shareStream
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {shareStream ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </button>

          <button
            onClick={handleLeaveRoom}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
