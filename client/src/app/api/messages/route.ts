import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase-client';

// AES encryption setup
const algorithm = process.env.ENCRYPTION_ALGORITHM || "aes-256-cbc";
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32); 
const iv = crypto.randomBytes(16); 

// Function to encrypt the message text
function encrypt(text: string) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encrypted, iv: iv.toString('hex') }; // Return both the encrypted text and the IV
}

export async function POST(req: NextRequest) {
    try {
        const { senderId, messageText, chatroomId, sent_at } = await req.json();

        if (!senderId || !messageText || !chatroomId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Encrypt the message text
        const { encrypted, iv } = encrypt(messageText);

        // Insert the encrypted message into the database
        const { data, error } = await supabase
            .from('chatrooms')
            .insert([
                {
                    sender_id: senderId,
                    message_text: encrypted,
                    chatroom_id: chatroomId,
                    sent_at: new Date().toISOString() || sent_at,
                    iv: iv,
                },
            ]);

        if (error) {
            throw error;
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function GET(req: NextRequest) {
    try {
        // Fetch messages from the database (based on chatroom_id or other criteria)
        const { chatroomId }: any = req.nextUrl.searchParams;

        if (!chatroomId) {
            return NextResponse.json({ error: 'Chatroom ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('chatrooms')
            .select('sender_id, message_text, sent_at, iv')
            .eq('chatroom_id', chatroomId);

        if (error) {
            throw error;
        }

        // Function to decrypt the message text
        function decrypt({ encryptedText, iv }: any) {
            const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }

        // Decrypt each message and return the result
        const decryptedMessages = data.map(message => ({
            sender_id: message.sender_id,
            message_text: decrypt({ encryptedText: message.message_text, iv: message.iv }),
            sent_at: message.sent_at,
        }));

        return NextResponse.json(decryptedMessages, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
