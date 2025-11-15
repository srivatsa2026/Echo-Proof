import { NextRequest, NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";
import { readFile, unlink } from "fs/promises";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic"; // ensure no caching

export async function POST(req: NextRequest) {
  try {
    // Parse incoming form-data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log("Received audio:", file.name, file.size, "bytes");

    // Create a temporary file path
    const tempFilePath = path.join("/tmp", `${Date.now()}-${file.name}`);

    // Convert File → Buffer
    const bytes = Buffer.from(await file.arrayBuffer());

    // Save to /tmp
    await fs.promises.writeFile(tempFilePath, bytes);

    console.log("Saved temp file:", tempFilePath);

    // Initialize AssemblyAI
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY!,
    });

    console.log("Starting transcription...");

    // Pass the temp file to AssemblyAI
    const transcript = await client.transcripts.transcribe({
      audio: tempFilePath,
      speech_model: "universal",
    });

    console.log("Transcription status:", transcript.status);

    // Cleanup temp file
    await unlink(tempFilePath).catch(() => {});

    if (transcript.status === "error") {
      return NextResponse.json(
        { error: transcript.error ?? "Transcription failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transcript: transcript.text,
    });
  } catch (err: any) {
    console.error("AssemblyAI Error:", err);

    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
