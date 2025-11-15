// import { NextRequest, NextResponse } from 'next/server';
// import { SarvamAIClient } from 'sarvamai';
// import { Readable } from 'stream';

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const audioFile = formData.get('file') as File;

//     if (!audioFile) {
//       return NextResponse.json(
//         { error: 'No audio file provided' },
//         { status: 400 }
//       );
//     }

//     // Initialize Sarvam AI client
//     const client = new SarvamAIClient({
//       apiSubscriptionKey: process.env.SARVAM_API_KEY!,
//     });

//     // Convert File to Buffer
//     const arrayBuffer = await audioFile.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Convert Buffer to Readable stream for Sarvam AI
//     const stream = Readable.from(buffer);

//     // Transcribe audio using Sarvam AI
//     const response = await client.speechToText.transcribe({
//       file: stream as any,
//     });

//     return NextResponse.json({
//       transcript: response.transcript,
//     });

//   } catch (error) {
//     console.error('Sarvam AI transcription error:', error);
//     return NextResponse.json(
//       { error: 'Failed to transcribe audio', details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };


import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Initialize AssemblyAI client
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY!,
    });

    // Save the audio file temporarily
    const timestamp = Date.now();
    tempFilePath = join(tmpdir(), `recording-${timestamp}.webm`);
    
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempFilePath, buffer);

    // Transcribe the audio file
    const params = {
      audio: tempFilePath,
      speech_model: 'universal',
    };

    const transcript = await client.transcripts.transcribe(params as any);

    // Clean up the temporary file
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed');
    }

    return NextResponse.json({
      transcript: transcript.text,
    });

  } catch (error) {
    console.error('AssemblyAI transcription error:', error);
    
    // Clean up on error
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }
    
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: (error as Error).message },
      { status: 500 }
    );
  }
}