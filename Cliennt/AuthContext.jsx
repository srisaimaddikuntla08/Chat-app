import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Get the backend URL from environment variables
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check authentication
    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("token"); // Fetch token from localStorage
            if (!token) {
                // console.error("No token found in localStorage");
                toast.error("Please login first.");
                return;
            }

            console.log("Token being sent: ", token); // Debugging line

            // Send token in the Authorization header
            const { data } = await axios.get(`/api/auth/check`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass token in the Authorization header
                },
            });

            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            } else {
                toast.error("Authentication failed: Invalid token.");
                localStorage.removeItem("token"); // Clear token if invalid
                setToken(null); // Update state
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            toast.error(error.message || "Authentication failed");
            localStorage.removeItem("token"); // Clear token on failure
            setToken(null); // Update state
        }
    };

    // Socket connection
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id // Make sure the correct user ID is passed
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    };

    // Login function
    const login = async (type, data) => {
        setLoading(true);
        setError(null); // Reset previous error state
        try {
            const response = await axios.post(`/api/auth/${type}`, data);
            if (response.data.success) {
                localStorage.setItem("token", response.data.token); // Save the token in localStorage
                setToken(response.data.token); // Update token in state
                setAuthUser(response.data.user); // Set authenticated user
                connectSocket(response.data.user); // Connect socket on login
                toast.success("Logged in successfully");
            }
        } catch (err) {
            console.error("Error during authentication:", err);
            setError("Network Error: Unable to reach the server. Please try again later.");
            if (err.response) {
                console.error("Server Response:", err.response);
                setError(`Error: ${err.response.status} - ${err.response.data.message || "An error occurred."}`);
            } else if (err.request) {
                console.error("Request Error:", err.request);
                setError("No response received from the server.");
            } else {
                console.error("Error Message:", err.message);
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["Authorization"] = null; // Remove the authorization token from axios
        toast.success("Logged out successfully");
        socket?.disconnect(); // Disconnect socket on logout
    };

    // Update profile function
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body, {
                headers: {
                    Authorization: `Bearer ${token}`, // Ensure token is passed in the header for profile updates
                }
            });
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        }
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Set the token in the header
        }
        checkAuth(); // Check authentication status on component mount
    }, [token]);

    return (
        <AuthContext.Provider value={{
            authUser, 
            onlineUsers, 
            socket, 
            login, 
            logout, 
            updateProfile, 
            loading, 
            error
        }}>
            {children}
        </AuthContext.Provider>
    );
};
