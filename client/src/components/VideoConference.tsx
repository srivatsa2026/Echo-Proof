'use client';
import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';

interface VideoConferenceProps {
  roomId: string;
  username: string;
}

export default function VideoConference({ roomId, username }: VideoConferenceProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [roomInstance] = useState(() => new Room({
    adaptiveStream: true,
    dynacast: true,
  }));

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const resp = await fetch(`/api/token?room=${roomId}&username=${username}`);
        const data = await resp.json();
        
        if (!mounted) return;
        
        if (data.token) {
          setToken(data.token);
          await roomInstance.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, data.token);
        } else {
          setError('Failed to get access token');
        }
      } catch (e) {
        console.error(e);
        if (mounted) {
          setError('Failed to connect to room');
        }
      }
    })();

    return () => {
      mounted = false;
      roomInstance.disconnect();
    };
  }, [roomInstance, roomId, username]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Connection Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (token === '') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Getting token...</p>
        </div>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={roomInstance}>
      <div data-lk-theme="default" style={{ height: '100dvh' }}>
        <MyVideoConference />
        <RoomAudioRenderer />
        <ControlBar />
      </div>
    </RoomContext.Provider>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <GridLayout 
      tracks={tracks} 
      style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}