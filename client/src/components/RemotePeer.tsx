"use client";

import { useRemoteVideo, useRemoteAudio, useRemoteScreenShare } from "@huddle01/react/hooks";
import { Video as VideoComponent, Audio as AudioComponent } from "@huddle01/react/components";

interface RemotePeerProps {
  peerId: string;
}

export default function RemotePeer({ peerId }: RemotePeerProps) {
  const { stream: videoStream } = useRemoteVideo({ peerId });
  const { stream: audioStream } = useRemoteAudio({ peerId });
  const { videoStream: screenVideoStream, audioStream: screenAudioStream } = useRemoteScreenShare({ peerId });

  return (
    <>
      <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
        {videoStream ? (
          <VideoComponent stream={videoStream} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              P
            </div>
          </div>
        )}
        {audioStream && <AudioComponent stream={audioStream} />}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
          Participant
        </div>
      </div>

      {screenVideoStream && (
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video col-span-full">
          <VideoComponent stream={screenVideoStream} className="w-full h-full object-cover" />
          {screenAudioStream && <AudioComponent stream={screenAudioStream} />}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
            Screen Share
          </div>
        </div>
      )}
    </>
  );
}