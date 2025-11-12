"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinMeeting() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      router.push(`/meeting/${roomId.trim()}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Join Meeting
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Meeting ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="w-full bg-white/20 border border-white/30 text-white placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={!roomId.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Join Meeting
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
