"use client";

import { useState, useEffect, useCallback } from "react";
import { getEoaAddress, getSmartWalletAddress, getSmartWalletBalance } from "@/lib/zerodev";
import { formatEther } from "viem";
import { Copy, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface WalletInfoProps {
    isLoggedIn: boolean;
}

export default function WalletInfo({ isLoggedIn }: WalletInfoProps) {
    const [eoaAddress, setEoaAddress] = useState<string>("");
    const [smartWalletAddress, setSmartWalletAddress] = useState<string>("");
    const [smartWalletBalance, setSmartWalletBalance] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            fetchWalletInfo();
        } else {
            resetWalletInfo();
        }
    }, [isLoggedIn]);

    const resetWalletInfo = () => {
        setEoaAddress("");
        setSmartWalletAddress("");
        setSmartWalletBalance("");
    };

    const fetchWalletInfo = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            setIsLoading(true);

            const [eoa, smartWallet, balance] = await Promise.all([
                getEoaAddress(),
                getSmartWalletAddress(),
                getSmartWalletBalance()
            ]);

            setEoaAddress(eoa);
            setSmartWalletAddress(smartWallet);
            setSmartWalletBalance(formatEther(balance));
        } catch (error) {
            console.error("Failed to fetch wallet info:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn]);

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard`);
        } catch (error) {
            console.error("Failed to copy:", error);
            toast.error("Failed to copy to clipboard");
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="text-center">
                    <p className="text-gray-600">Please login to view wallet information</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Smart Wallet</h3>
                <button
                    onClick={fetchWalletInfo}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading wallet information...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Smart Wallet Address */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">Smart Wallet Address</p>
                            <button
                                onClick={() => copyToClipboard(smartWalletAddress, "Smart wallet address")}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                                <Copy className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-sm font-mono text-gray-900 break-all">
                            {smartWalletAddress || "Not available"}
                        </p>
                    </div>

                    {/* EOA Address */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">EOA Address</p>
                            <button
                                onClick={() => copyToClipboard(eoaAddress, "EOA address")}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                                <Copy className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-sm font-mono text-gray-900 break-all">
                            {eoaAddress || "Not available"}
                        </p>
                    </div>

                    {/* Balance */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">MATIC Balance</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {smartWalletBalance ? `${parseFloat(smartWalletBalance).toFixed(6)} MATIC` : "0.000000 MATIC"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
