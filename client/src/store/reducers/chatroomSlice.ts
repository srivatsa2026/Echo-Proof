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
            });
    }
})

export default chatroomSlice.reducer
