"use client";

import { useCallback, useEffect, useState } from "react";
import { web3auth, initWeb3Auth } from "@/lib/web3auth";
import toast from "react-hot-toast";

interface GoogleLoginProps {
    onLoginStateChange?: (isLoggedIn: boolean) => void;
}

export default function GoogleLogin({ onLoginStateChange }: GoogleLoginProps) {
    const [isReady, setIsReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserInfo = useCallback(async () => {
        try {
            const userInfo = await web3auth.getUserInfo();
            setUserEmail(userInfo.email || "User");
        } catch (error) {
            console.error("Failed to get user info:", error);
            setUserEmail("User");
        }
    }, []);

    const checkAuthStatus = useCallback(async () => {
        // Multiple checks to ensure we catch the session properly
        if (web3auth.connected && web3auth.provider) {
            console.log("User is connected via web3auth.connected");
            setIsLoggedIn(true);
            await fetchUserInfo();
        } else if (web3auth.provider) {
            console.log("User has provider, checking connection status");
            try {
                // Try to get user info as a connection test
                const userInfo = await web3auth.getUserInfo();
                if (userInfo && userInfo.email) {
                    console.log("User info retrieved, user is logged in");
                    setIsLoggedIn(true);
                    setUserEmail(userInfo.email);
                }
            } catch (error) {
                console.log("No valid session found:", error);
                setIsLoggedIn(false);
            }
        }
    }, [fetchUserInfo]);

    const initializeWeb3Auth = useCallback(async () => {
        try {
            await initWeb3Auth();
            setIsReady(true);

            // Check auth status immediately after init
            await checkAuthStatus();

            // Also check after a short delay to catch any async session restoration
            setTimeout(checkAuthStatus, 500);
        } catch (error) {
            console.error("Failed to initialize Web3Auth:", error);
            toast.error("Failed to initialize authentication");
        }
    }, [checkAuthStatus]);

    useEffect(() => {
        initializeWeb3Auth();
    }, [initializeWeb3Auth]);

    useEffect(() => {
        onLoginStateChange?.(isLoggedIn);
    }, [isLoggedIn, onLoginStateChange]);

    const handleLogin = useCallback(async () => {
        if (!isReady || isLoading) return;

        setIsLoading(true);
        try {
            const provider = await web3auth.connect();
            if (provider) {
                setIsLoggedIn(true);
                await fetchUserInfo();
                window.dispatchEvent(new CustomEvent("web3auth:connected"));
                toast.success("Successfully logged in with Google");
            }
        } catch (error) {
            console.error("Login failed:", error);
            toast.error("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [isReady, isLoading, fetchUserInfo]);

    const handleLogout = useCallback(async () => {
        if (!isReady || isLoading) return;

        setIsLoading(true);
        try {
            await web3auth.logout();
            setIsLoggedIn(false);
            setUserEmail("");
            window.dispatchEvent(new CustomEvent("web3auth:disconnected"));
            toast.success("Successfully logged out");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [isReady, isLoading]);

    return (
        <div className="flex flex-col items-center gap-4">
            {userEmail && (
                <div className="text-center">
                    <p className="text-sm text-gray-600">Welcome,</p>
                    <p className="font-medium text-gray-900">{userEmail}</p>
                </div>
            )}
            <div className="flex gap-3">
                <button
                    disabled={!isReady || isLoggedIn || isLoading}
                    onClick={handleLogin}
                    className="rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 font-medium transition-colors duration-200"
                >
                    {isLoading ? "Connecting..." : "Login with Google"}
                </button>
                <button
                    disabled={!isReady || !isLoggedIn || isLoading}
                    onClick={handleLogout}
                    className="rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 px-6 py-2 font-medium transition-colors duration-200"
                >
                    {isLoading ? "Disconnecting..." : "Logout"}
                </button>
            </div>
        </div>
    );
}


