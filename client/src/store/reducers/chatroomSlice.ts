import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"

interface ChatroomState {
    id: string
    title: string
    creator: string
    members: string[]
    chatrooms: any[]
    loading: boolean
    error: string | null
    active: boolean
    tokenGated: boolean
    tokenAddress?: string | null
    tokenStandard?: string | null
}

const initialState: ChatroomState = {
    id: "",
    title: "Echo-Room",
    creator: "unknown-id",
    members: [],
    chatrooms: [],
    loading: false,
    error: null,
    active: false,
    tokenGated: false,
    tokenAddress: null,
    tokenStandard: null
}

// Async thunk for creating a chatroom
export const createChatroom = createAsyncThunk(
    "chatroom/create",
    async (
        {
            title,
            tokenGated,
            tokenAddress,
            tokenStandard,
            toast,
            router
        }: {
            title: string
            tokenGated: boolean
            tokenAddress?: string | null
            tokenStandard?: string | null
            toast: any
            router?: any
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post("/api/chatrooms", {
                title,
                tokenGated,
                tokenAddress,
                tokenStandard
            }, { withCredentials: true })
            const data = response.data
            toast({
                title: "Chatroom Created",
                description: `Room "${title}" has been created successfully.`,
            })
            return data
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create chatroom.",
                variant: "destructive"
            })
            return rejectWithValue(error.response?.data || { message: "Unknown error" })
        }
    }
)

// Async thunk for fetching all chatrooms for the user
export const fetchUserChatrooms = createAsyncThunk(
    "chatroom/fetchUserChatrooms",
    async (_: void, { rejectWithValue }) => {
        try {
            const response = await axios.get("/api/chatrooms", { withCredentials: true });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch chatrooms" });
        }
    }
);

// Async thunk for joining a chatroom
export const joinChatroom = createAsyncThunk(
    "chatroom/joinChatroom",
    async (
        { roomId, toast }: { roomId: string; toast?: any },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post(
                "/api/join-chatroom",
                { roomId },
                { withCredentials: true }
            );
            const data = response.data;
            if (toast) {
                toast({
                    title: "Joined Chatroom",
                    description: data.message || "Successfully joined the chatroom.",
                });
            }
            return data;
        } catch (error: any) {
            if (toast) {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "Failed to join chatroom.",
                    variant: "destructive"
                });
            }
            return rejectWithValue(error.response?.data || { message: "Unknown error" });
        }
    }
);

// Async thunk for checking if user can join a chatroom
export const checkJoinChatroom = createAsyncThunk(
    "chatroom/checkJoinChatroom",
    async (
        { roomId }: { roomId: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.get(`/api/join-chatroom?roomId=${roomId}`, { withCredentials: true });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "Unknown error" });
        }
    }
);

const chatroomSlice = createSlice({
    name: "chatroom",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createChatroom.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createChatroom.fulfilled, (state, action) => {
                state.loading = false;
                state.id = action.payload.chatroom.id;
                state.title = action.payload.chatroom.title;
                state.active = action.payload.chatroom.isActive;
                state.creator = action.payload.chatroom.creatorId;
                state.tokenGated = action.payload.chatroom.tokenGated;
                state.tokenAddress = action.payload.chatroom.tokenAddress;
                state.tokenStandard = action.payload.chatroom.tokenStandard;
                state.chatrooms.push(action.payload.chatroom);
            })
            .addCase(createChatroom.rejected, (state, action) => {
                state.loading = false
                state.error = (action.payload as any)?.message || "Failed to create chatroom"
            })
            .addCase(fetchUserChatrooms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserChatrooms.fulfilled, (state, action) => {
                state.loading = false;
                state.chatrooms = action.payload.chatrooms || [];
            })
            .addCase(fetchUserChatrooms.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || "Failed to fetch chatrooms";
            })
            .addCase(joinChatroom.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinChatroom.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Optionally update chatroom info if returned
                if (action.payload && action.payload.chatroom) {
                    state.id = action.payload.chatroom.id;
                    state.title = action.payload.chatroom.title;
                    state.creator = action.payload.chatroom.creator?.id || "unknown-id";
                    state.tokenGated = action.payload.chatroom.tokenGated;
                    // Only push if not already in chatrooms
                    if (!state.chatrooms.some((c: any) => c.id === action.payload.chatroom.id)) {
                        state.chatrooms.push(action.payload.chatroom);
                    }
                }
                // Push the joined member to the members array if present
                if (action.payload && action.payload.member) {
                    // Avoid duplicates
                    if (!state.members.some((m: any) => m.id === action.payload.member.id)) {
                        state.members.push(action.payload.member);
                    }
                }
            })
            .addCase(joinChatroom.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || "Failed to join chatroom";
            })
            .addCase(checkJoinChatroom.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkJoinChatroom.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Store chatroom info and user join status
                if (action.payload && action.payload.chatroom) {
                    state.id = action.payload.chatroom.id;
                    state.title = action.payload.chatroom.title;
                    state.active = action.payload.chatroom.isActive;
                    state.tokenGated = action.payload.chatroom.tokenGated;
                    state.tokenAddress = action.payload.chatroom.tokenAddress;
                    state.tokenStandard = action.payload.chatroom.tokenStandard;
                }
                // Optionally store user join status
                if (action.payload && action.payload.userStatus) {
                    (state as any).userStatus = action.payload.userStatus;
                }
            })
            .addCase(checkJoinChatroom.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || "Failed to check join status";
            });
    }
})

export default chatroomSlice.reducer
