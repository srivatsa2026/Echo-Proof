// 'use client';
// import {
//   ControlBar,
//   GridLayout,
//   ParticipantTile,
//   RoomAudioRenderer,
//   useTracks,
//   RoomContext,
// } from '@livekit/components-react';
// import { Room, Track } from 'livekit-client';
// import '@livekit/components-styles';
// import { useEffect, useState } from 'react';

// interface VideoConferenceProps {
//   roomId: string;
//   username: string;
// }

// export default function VideoConference({ roomId, username }: VideoConferenceProps) {
//   const [token, setToken] = useState('');
//   const [error, setError] = useState('');
//   const [roomInstance] = useState(() => new Room({
//     adaptiveStream: true,
//     dynacast: true,
//   }));

//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         const resp = await fetch(`/api/token?room=${roomId}&username=${username}`);
//         const data = await resp.json();
        
//         if (!mounted) return;
        
//         if (data.token) {
//           setToken(data.token);
//           await roomInstance.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, data.token);
//         } else {
//           setError('Failed to get access token');
//         }
//       } catch (e) {
//         console.error(e);
//         if (mounted) {
//           setError('Failed to connect to room');
//         }
//       }
//     })();

//     return () => {
//       mounted = false;
//       roomInstance.disconnect();
//     };
//   }, [roomInstance, roomId, username]);

//   if (error) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-md">
//           <h2 className="text-xl font-bold text-red-600 mb-2">Connection Error</h2>
//           <p className="text-gray-700">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (token === '') {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-700">Getting token...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <RoomContext.Provider value={roomInstance}>
//       <div data-lk-theme="default" style={{ height: '100dvh' }}>
//         <MyVideoConference />
//         <RoomAudioRenderer />
//         <ControlBar />
//       </div>
//     </RoomContext.Provider>
//   );
// }

// function MyVideoConference() {
//   const tracks = useTracks(
//     [
//       { source: Track.Source.Camera, withPlaceholder: true },
//       { source: Track.Source.ScreenShare, withPlaceholder: false },
//     ],
//     { onlySubscribed: false },
//   );

//   return (
//     <GridLayout 
//       tracks={tracks} 
//       style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}
//     >
//       <ParticipantTile />
//     </GridLayout>
//   );
// }


'use client';
import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  useRoomContext,
} from '@livekit/components-react';
import { Room, Track, RoomEvent, RemoteTrackPublication } from 'livekit-client';
import '@livekit/components-styles';
import { useEffect, useState, useRef } from 'react';

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
        <MyVideoConference roomId={roomId} />
        <RoomAudioRenderer />
        <RecordingControls roomId={roomId} />
      </div>
    </RoomContext.Provider>
  );
}

function MyVideoConference({ roomId }: { roomId: string }) {
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
      style={{ height: 'calc(100vh - var(--lk-control-bar-height) - 60px)' }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}

function RecordingControls({ roomId }: { roomId: string }) {
  const room = useRoomContext();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
console.log("this is the recording controls")
  const startRecording = async () => {
    try {
      // Create audio context to mix all audio tracks
      audioContextRef.current = new AudioContext();
      destinationRef.current = audioContextRef.current.createMediaStreamDestination();

      // Get all remote audio tracks and mix them
      room.remoteParticipants.forEach((participant) => {
        participant.audioTrackPublications.forEach((publication) => {
          if (publication.track) {
            const mediaStream = new MediaStream([publication.track.mediaStreamTrack]);
            const source = audioContextRef.current!.createMediaStreamSource(mediaStream);
            source.connect(destinationRef.current!);
          }
        });
      });

      // Add local audio track
      const localAudioTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone);
      if (localAudioTrack?.track) {
        const localStream = new MediaStream([localAudioTrack.track.mediaStreamTrack]);
        const localSource = audioContextRef.current.createMediaStreamSource(localStream);
        localSource.connect(destinationRef.current);
      }

      // Start recording
      const stream = destinationRef.current.stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);

      // Listen for new participants joining
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === 'audio' && audioContextRef.current && destinationRef.current) {
          const mediaStream = new MediaStream([track.mediaStreamTrack]);
          const source = audioContextRef.current.createMediaStreamSource(mediaStream);
          source.connect(destinationRef.current);
        }
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording');
    }
  };

  const stopRecording = () => {
    return new Promise<Blob>((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          resolve(audioBlob);
        };
        mediaRecorderRef.current.stop();
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      setIsRecording(false);
    });
  };

  const transcribeAndSummarize = async () => {
    setIsTranscribing(true);
    setTranscript('');
    setSummary('');

    try {
      // Stop recording and get audio blob
      const audioBlob = await stopRecording();
      
      // Convert webm to a format Whisper accepts (if needed)
      // For Whisper API, webm/opus works fine
      
      // Step 1: Transcribe with Whisper
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');

      const transcriptionResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcriptionResponse.ok) {
        throw new Error('Transcription failed');
      }

      const { text } = await transcriptionResponse.json();
      setTranscript(text);

      // Step 2: Generate summary with AI
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });

      if (!summaryResponse.ok) {
        throw new Error('Summary generation failed');
      }

      const { summary: generatedSummary } = await summaryResponse.json();
      setSummary(generatedSummary);

    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Failed to transcribe and summarize');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              🔴 Start Recording
            </button>
          ) : (
            <button
              onClick={transcribeAndSummarize}
              disabled={isTranscribing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {isTranscribing ? '⏳ Processing...' : '⏹️ Stop & Transcribe'}
            </button>
          )}
          
          {isRecording && (
            <span className="text-red-500 font-semibold animate-pulse">
              ● Recording...
            </span>
          )}
        </div>

        <ControlBar />
      </div>

      {/* Transcript and Summary Modal */}
      {(transcript || summary) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Meeting Results</h2>
              <button
                onClick={() => {
                  setTranscript('');
                  setSummary('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {summary && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">📋 Summary</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{summary}</p>
                </div>
              </div>
            )}

            {transcript && (
              <div>
                <h3 className="text-xl font-semibold mb-2">📝 Full Transcript</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">{transcript}</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Summary:\n${summary}\n\nTranscript:\n${transcript}`);
                  alert('Copied to clipboard!');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                📋 Copy All
              </button>
              <button
                onClick={() => {
                  const element = document.createElement('a');
                  const file = new Blob([`Summary:\n${summary}\n\nTranscript:\n${transcript}`], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = `meeting-${roomId}-${Date.now()}.txt`;
                  element.click();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                💾 Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}