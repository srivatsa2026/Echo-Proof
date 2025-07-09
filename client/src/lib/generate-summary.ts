import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function GenerateSummary(content?: any) {
  const prompt = `
You are provided with an array of messages representing a chronological conversation. Each message object includes:

- An ID (e.g., msg-<timestamp>-local)
- A sender object containing:
  - id
  - name
  - wallet_address
- A content field (text message)
- A timestamp (ISO string)

Your task is to:
1. **List all unique users** involved in the conversation along with their name and wallet address.
2. **Generate a concise and coherent summary** of the conversation based on the chronological order of messages.

**Instructions:**
- Only list each user once.
- Show wallet addresses even if they're the same.
- The summary should:
  - Follow the correct time sequence.
  - Highlight key points or discussion flow.
  - Avoid repetition unless crucial.
  - Be easy to understand and reflect actual conversation context.

Format your response exactly like this (DO NOT include any JSON formatting or code blocks):
PARTICIPANTS:
[List each participant with their details, one per line]

---
CONVERSATION SUMMARY:
[Your summary of the conversation in plain text]

Here is the message array you need to process:
${JSON.stringify(content, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  // Safely extract the text content from the response
  const output = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated.';
  console.log("the summary is ", output)
  return output;
}

export default GenerateSummary;
