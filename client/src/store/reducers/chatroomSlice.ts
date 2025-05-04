import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";



const initialState = {
    roomName: "Echo-Room",
    description: "Group discussion Regarding the project",
    creator: "",
    members: [],

}

export const createChatroom = createAsyncThunk(
    "chatroom/create",
    async ({ roomName, description,  }: any) => {
        try {
            const response = await axios.post("/api/create-room");
            console.log("")
        } catch (error) {

        }
    }
)




const chatroomSlice = createSlice({
    name: "chatroom",
    initialState,
    reducers: {}
}) 