'use client';
import React, { useState } from 'react';
import {
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    Monitor,
    Settings,
    Edit3,
    ArrowRight
} from 'lucide-react';

import {
    useLocalVideo,
    useLocalAudio,
    useLocalScreenShare,
} from '@huddle01/react/hooks';

import { Video } from '@huddle01/react/components';

const HuddlePreJoinUI = () => {
    const [displayName, setDisplayName] = useState('');

    const {
        stream: videoStream,
        enableVideo,
        disableVideo,
        isVideoOn,
    } = useLocalVideo();

    const {
        stream: audioStream,
        enableAudio,
        disableAudio,
        isAudioOn,
    } = useLocalAudio();

    const joinMeeting = () => {
        if (displayName.trim()) {
            console.log('Joining meeting with name:', displayName);
            // TODO: Actually trigger the join logic here
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Video Preview */}
                <div className="relative mb-8">
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-blue-900">
                        {isVideoOn && videoStream ? (
                            <Video stream={videoStream} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                                <VideoOff size={64} className="text-blue-600" />
                            </div>
                        )}

                        {/* Media Controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                            {/* Video Toggle */}
                            <button
                                onClick={() => {
                                    isVideoOn ? disableVideo() : enableVideo();
                                }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOn
                                        ? 'bg-blue-900 hover:bg-blue-800 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                            >
                                {isVideoOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                            </button>

                            {/* Audio Toggle */}
                            <button
                                onClick={() => {
                                    isAudioOn ? disableAudio() : enableAudio();
                                }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isAudioOn
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                            >
                                {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
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
                            className="w-full bg-black border border-blue-800 rounded-xl px-6 py-4 pr-12 text-white placeholder-blue-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                        <Edit3 size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400" />
                    </div>
                </div>

                {/* Join Button */}
                <button
                    onClick={joinMeeting}
                    disabled={!displayName.trim()}
                    className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-950 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all border border-blue-700"
                >
                    <span>Join Meeting</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default HuddlePreJoinUI;
