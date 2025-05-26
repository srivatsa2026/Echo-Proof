import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function GenerateSummary(content?: any) {
    const prompt = `
    You are given an array of messages, each containing the following:
    - An ID (msg-${Date.now()}-local)
    - A sender object (with an ID and name)
    - A content field (the message text)
    - A timestamp (when the message was sent)

    The array reflects a chronological conversation or sequence of messages. Your task is to analyze the messages in the order of their timestamps and generate a coherent and concise summary of the discussion or content.

    Please ensure the summary:
    - Reflects the correct flow of conversation based on the timestamps.
    - Captures the key points, actions, or insights shared.
    - Omits redundant or repetitive information unless essential for context.
    - Maintains clarity and coherence.

    Example input format:
    [
    {
        "id": "msg-1625292000000-local",
        "sender": {
        "id": "user-1",
        "name": "Alice"
        },
        "content": "Why is the sky blue?",
        "timestamp": "2025-05-26T10:00:00Z"
    },
    {
        "id": "msg-1625292020000-local",
        "sender": {
        "id": "user-2",
        "name": "Bob"
        },
        "content": "It's due to Rayleigh scattering.",
        "timestamp": "2025-05-26T10:02:00Z"
    }
    ]

    Based on the above example, generate a concise summary based on the sequence of messages.

    Content: ${JSON.stringify(content)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
    });

    console.log(response.text);
    return response;
}

export default GenerateSummary;
