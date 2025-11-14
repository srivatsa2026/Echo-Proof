'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import VideoConference from '@/components/VideoConference';
import { Video, User, ArrowRight, Hash } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = () => {
    if (username.trim()) {
      setHasJoined(true);
    }
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-1000 via-black to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,165,0,0.1)_0%,_transparent_50%)]"></div>
        
        <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
              <Video className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Meeting
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Hash className="h-4 w-4" />
              <span className="text-sm">Room ID:</span>
              <span className="font-mono font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                {roomId}
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <User className="h-4 w-4" />
                Your Display Name
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                  autoFocus
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={!username.trim()}
              className="group w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200  disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
            >
              <span>Join Conference</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By joining, you agree to our{' '}
                <span className="text-orange-600 hover:text-orange-700 cursor-pointer">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-orange-600 hover:text-orange-700 cursor-pointer">
                  Privacy Policy
                </span>
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full opacity-20"></div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-orange-400 rounded-full opacity-10"></div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-400 rounded-full opacity-5 blur-3xl"></div>
      </div>
    );
  }

  return <VideoConference roomId={roomId} username={username} />;
}