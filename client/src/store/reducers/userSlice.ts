// features/user/userSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState: {
    name: string;
    isAuthenticated: boolean;
    email: string;
    wallet_address: string;
    smart_wallet_address: string;
    userPlan: string;
    loading: boolean;
    error: string | null;
} = {
    name: "Echo-Client",
    isAuthenticated: false,
    email: "echoProof@echo.com",
    wallet_address: "",
    smart_wallet_address: "",
    userPlan: "free",
    loading: false,
    error: null,
};

export const registerUser = createAsyncThunk(
    "user/register",
    async (
        { smartWalletAddress, walletAddress, toast, router }: any,
        { rejectWithValue }
    ) => {
        console.log("hey here we are inside the redux boooooooyeahhhhh")
        if (!smartWalletAddress || !walletAddress) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to register.",
                variant: "destructive",
            });
            return rejectWithValue("No address");
        }

        try {
            const response = await axios.post("/api/register", {
                smart_wallet_address: smartWalletAddress,
                wallet_address: walletAddress,
            });

            if (response.status === 201) {
                toast({
                    title: "Registration successful",
                    description: "Please complete your profile.",
                });
            } else if (response.data?.message === "User already exists") {
                toast({
                    title: "Account already exists",
                    description: "Signing you in now.",
                });
            }

            router.push("/dashboard");

            return response.data;
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error?.response?.data?.message || "Please try again.",
                variant: "destructive",
            });
            return rejectWithValue(error?.response?.data || "Unknown error");
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    "user/updateProfile",
    async ({ name, email, toast, }: any) => { }
)

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.smart_wallet_address = action.payload.smart_wallet_address;
                state.wallet_address = action.payload.wallet_address;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string | null;
            });
    },
});

export default userSlice.reducer;
