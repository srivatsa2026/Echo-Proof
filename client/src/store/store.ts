import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./reducers/userSlice"
import chatroomSlice from "./reducers/chatroomSlice"
const store = configureStore({
    reducer: {
        user: userReducer,
        chatroom: chatroomSlice
    }
})

export default store