import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState: {
    id: string,
    name: string;
    isAuthenticated: boolean;
    email: string;
    wallet_address: string;
    smart_wallet_address: string;
    userPlan: string;
    loading: boolean;
    error: string | null;
} = {
    id: "",
    name: "Echo-Client",
    isAuthenticated: false,
    email: "echoProof@echo.com",
    wallet_address: "",
    smart_wallet_address: "",
    userPlan: "free",
    loading: false,
    error: null,
};

// 🔐 Register a new user
export const registerUser = createAsyncThunk(
    "user/register",
    async (
        { smartWalletAddress, walletAddress, toast, router }: any,
        { rejectWithValue }
    ) => {
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

// 🧾 Update user profile (name & email)
export const updateUserProfile = createAsyncThunk(
    "user/updateProfile",
    async (
        { name, email, toast, smart_wallet_address, wallet_address }: any,
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post("/api/update-profile", {
                name,
                email,
                wallet_address,
                smart_wallet_address,
            }, { withCredentials: true });

            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });

            return response.data;
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error?.response?.data?.message || "Please try again.",
                variant: "destructive",
            });
            return rejectWithValue(error?.response?.data || "Unknown error");
        }
    }
);

// 📥 Get user details from Supabase
export const getUserDetails = createAsyncThunk(
    "user/getUserDetails",
    async (
        { smart_wallet_address, wallet_address }: any,
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post("/api/get-user", {
                wallet_address,
                smart_wallet_address,
            }, { withCredentials: true });
            localStorage.setItem("userId", response.data?.user.id)
            console.log("the reponse of the profile is ", response.data.user.id)

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data || "Unknown error");
        }
    }
);

// 🧠 User slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        stateLogin: (state, action) => {
            state.isAuthenticated = true;
            state.smart_wallet_address = action.payload.smart_wallet_address;
            state.wallet_address = action.payload.wallet_address;
            state.name = action.payload.name || state.name;
            state.email = action.payload.email || state.email;
        },
        stateLogout: (state) => {
            state.isAuthenticated = false;
            state.wallet_address = "";
            state.smart_wallet_address = "";
            state.name = "Echo-Client";
            state.email = "echoProof@echo.com";
            state.userPlan = "free";
        },
    },
    extraReducers: (builder) => {
        builder
            // Register User
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.smart_wallet_address = action.payload.smart_wallet_address;
                state.wallet_address = action.payload.wallet_address;
                state.isAuthenticated = true;
                state.name = action.payload.name || state.name;
                state.email = action.payload.email || state.email;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string | null;
            })

            // Update Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.name = action.payload.name;
                state.email = action.payload.email;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string | null;
            })

            // Get User Details
            .addCase(getUserDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserDetails.fulfilled, (state, action) => {
                state.loading = false;
                console.log("the action payload is ", action.payload.user)
                state.name = action.payload.user.name || state.name;
                state.id = action.payload.user.id || action.payload.user.wallet_address
                state.email = action.payload.user.email || state.email;
                state.smart_wallet_address = action.payload.user.smart_wallet_address;
                state.wallet_address = action.payload.user.wallet_address;
                state.userPlan = action.payload.userPlan || state.userPlan;
                state.isAuthenticated = true;
            })
            .addCase(getUserDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string | null;
            });
    },
});

export const { stateLogin, stateLogout } = userSlice.actions;
export default userSlice.reducer;
