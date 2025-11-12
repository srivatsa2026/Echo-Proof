"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMeeting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreateRoom = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/create-room", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to create room");

      const data = await response.json();
      router.push(`/meeting/${data.data.roomId}`);
    } catch (err) {
      setError("Failed to create meeting. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Create Meeting
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? "Creating..." : "Create Meeting Room"}
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}