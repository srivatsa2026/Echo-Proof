// import { createClient } from '@supabase/supabase-js';
// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase-client';

import { supabase } from "@/lib/supabase-client";
import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//     try {
//         // Check if Supabase environment variables are set
//         if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
//             console.error('Missing Supabase environment variables');
//             return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
//         }

//         // Fetch messages from the database (based on chatroom_id or other criteria)
//         const searchParams = req.nextUrl.searchParams;
//         const chatroomId = searchParams.get('chatroomId');

//         console.log('Received chatroomId:', chatroomId);
//         console.log('All search params:', Object.fromEntries(searchParams.entries()));

//         if (!chatroomId) {
//             console.error('Chatroom ID is missing from request');
//             return NextResponse.json({ error: 'Chatroom ID is required' }, { status: 400 });
//         }

//         console.log('Fetching messages for chatroom:', chatroomId);

//         // Get all data from the chatrooms table for this chatroom
//         console.log('Executing Supabase query...');
//         const { data: allChatroomData, error: allDataError } = await supabase
//             .from('messages')
//             .select('*')
//             .eq('chatroom_id', chatroomId);

//         console.log('All chatroom data:', allChatroomData);
//         console.log('All data error:', allDataError);

//         if (allDataError) {
//             console.error('Error fetching all chatroom data:', allDataError);
//             return NextResponse.json({ error: allDataError.message }, { status: 500 });
//         }

//         // Filter out rows that don't have message data
//         const messageRows = allChatroomData.filter(row =>
//             row.message_text && row.sender_id && row.sent_at
//         );

//         console.log('Message rows found:', messageRows.length);

//         if (messageRows.length === 0) {
//             console.log('No messages found for this chatroom');
//             return NextResponse.json([], { status: 200 });
//         }

//         // Get user information for each sender
//         const senderIds = [...new Set(messageRows.map(row => row.sender_id))];
//         console.log('Unique sender IDs:', senderIds);

//         if (senderIds.length > 0) {
//             console.log('Fetching user data for sender IDs:', senderIds);
//             const { data: usersData, error: usersError } = await supabase
//                 .from('users')
//                 .select('id, username')
//                 .in('id', senderIds);

//             console.log('Users data:', usersData);
//             console.log('Users error:', usersError);

//             if (usersError) {
//                 console.error('Error fetching users:', usersError);
//                 // Continue without user data rather than failing completely
//             }

//             // Create a map of user IDs to usernames
//             const userMap = new Map();
//             if (usersData) {
//                 usersData.forEach(user => {
//                     userMap.set(user.id, user.username);
//                 });
//             }

//             // Return messages with sender names (no decryption needed)
//             const messages = messageRows.map(message => ({
//                 sender_id: message.sender_id,
//                 sender_name: userMap.get(message.sender_id) || 'Unknown User',
//                 message_text: message.message_text, // No decryption needed
//                 sent_at: message.sent_at,
//             }));

//             console.log('Final messages:', messages);
//             return NextResponse.json(messages, { status: 200 });
//         } else {
//             // No sender IDs found, return messages without user data
//             const messages = messageRows.map(message => ({
//                 sender_id: message.sender_id,
//                 sender_name: 'Unknown User',
//                 message_text: message.message_text,
//                 sent_at: message.sent_at,
//             }));

//             console.log('Final messages (no user data):', messages);
//             return NextResponse.json(messages, { status: 200 });
//         }
//     } catch (error: any) {
//         console.error('Messages API error:', error);
//         console.error('Error stack:', error.stack);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }


export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const chatroomId = searchParams.get("chatroomId");
        const limit = parseInt(searchParams.get("limit") || "15", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        if (!chatroomId) {
            return NextResponse.json({ error: "Chatroom ID is required" }, { status: 400 });
        }

        // Calculate range for Supabase
        const from = offset;
        const to = offset + limit - 1;

        // Fetch messages ordered by sent_at, paginated
        const { data: messageRows, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("chatroom_id", chatroomId)
            .order("sent_at", { ascending: true })
            .range(from, to);

        if (messagesError) {
            return NextResponse.json({ error: messagesError.message }, { status: 500 });
        }

        if (!messageRows || messageRows.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        console.log("the messages are ", messageRows);
        return NextResponse.json(messageRows, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}