import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"

interface ChatroomState {
    id: string
    roomName: string
    purpose: string
    creator: string
    members: string[]
    chatrooms: any[]
    loading: boolean
    error: string | null
    active: boolean
}

const initialState: ChatroomState = {
    id: "",
    roomName: "Echo-Room",
    purpose: "Group discussion Regarding the project",
    creator: "unknown-id",
    members: [],
    chatrooms: [],
    loading: false,
    error: null,
    active: false
}

// Async thunk for creating a chatroom
export const createChatroom = createAsyncThunk(
    "chatroom/create",
    async (
        {
            roomName,
            purpose,
            creator_id,
            toast,
            router
        }: {
            roomName: string
            purpose: string
            creator_id: string
            toast: any
            router?: any
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post("/api/create-chatroom", {
                roomName,
                purpose,
                creator_id
            })
            console.log("the response from the chat room slice is ", response.data)
            const data = response.data
            toast({
                title: "Chatroom Created",
                description: `Room "${roomName}" has been created successfully.`,
            })

            // Navigate to the newly created chatroom
            // router.push(`/chatroom/${data.sessionId}`)

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
                console.log("Inside fulfilled case");

                // Check the structure of the payload
                console.log("Action payload:", action.payload);

                // Proceed with your existing logic
                state.loading = false;
                state.id = action.payload.chatroom.id;
                state.roomName = action.payload.chatroom.name;
                state.purpose = action.payload.chatroom.purpose;
                state.active = action.payload.chatroom.active;
                state.creator = action.payload.chatroom.creator_id;
                state.chatrooms.push(action.payload);
            })

            .addCase(createChatroom.rejected, (state, action) => {
                state.loading = false
                state.error = (action.payload as any)?.message || "Failed to create chatroom"
            })
    }
})

export default chatroomSlice.reducer
