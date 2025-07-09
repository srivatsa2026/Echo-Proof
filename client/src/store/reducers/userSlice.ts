import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState: {
    id: string,
    name: string;
    isAuthenticated: boolean;
    email: string;
    wallet_address: string;
    userPlan: string;
    profileImage: string | null;
    loading: boolean;
    error: string | null;
} = {
    id: "",
    name: "Echo-Client",
    isAuthenticated: false,
    email: "echoProof@echo.com",
    wallet_address: "",
    userPlan: "free",
    profileImage: null,
    loading: false,
    error: null,
};

// 🔐 Register a new user
export const registerUser = createAsyncThunk(
    "user/register",
    async (
        { walletAddress, toast, router }: any,
        { rejectWithValue }
    ) => {
        if (!walletAddress) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to register.",
                variant: "destructive",
            });
            return rejectWithValue("No address");
        }

        try {
            const response = await axios.post("/api/user", {
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
        { name, email, toast }: { name: string, email?: string, toast: any },
        { rejectWithValue }
    ) => {
        try {
            if (email) {

                const response = await axios.patch("/api/user", {
                    name,
                    email,
                }, { withCredentials: true });

                return response.data;
            }
            else {

                const response = await axios.patch("/api/user", {
                    name,

                }, { withCredentials: true });
                return response.data;

            }
            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });

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
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/api/user", { withCredentials: true });
            console.log("the get reponsonse in the slice is ", response.data)
            console.log("the reponse of the profile is ", response.data.userData.id)
            localStorage.setItem("userId", response.data?.userData.id)

            return response.data.userData;
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
            state.wallet_address = action.payload.wallet_address;
            state.name = action.payload.name || state.name;
            state.email = action.payload.email || state.email;
        },
        stateLogout: (state) => {
            state.isAuthenticated = false;
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
                const user = action.payload;
                state.id = user.id || "";
                state.name = user.name || "Echo-Client";
                state.email = user.email || "echoProof@echo.com";
                state.wallet_address = user.walletAddress || "";
                state.userPlan = user.userPlan || "free";
                state.profileImage = user.profileImage || null;
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
