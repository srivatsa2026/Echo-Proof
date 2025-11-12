"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MeetingRoom from "@/components/MeetingRoom";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await fetch(`/api/get-access-token?roomId=${roomId}`);
        
        if (!response.ok) throw new Error("Failed to get access token");

        const data = await response.json();
        setAccessToken(data.token);
      } catch (err) {
        setError("Failed to join meeting. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      getAccessToken();
    }
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading meeting...</div>
      </div>
    );
  }

  if (error || !accessToken) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-md">
          <p className="mb-4">{error || "Failed to load meeting"}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return <MeetingRoom roomId={roomId} accessToken={accessToken} />;
}
