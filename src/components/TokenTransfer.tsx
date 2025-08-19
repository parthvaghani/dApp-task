"use client";

import { useState, useEffect } from "react";
import {
    executeGaslessTransaction,
    getSmartWalletAddress
} from "@/lib/zerodev";
import {
    USDC_CONTRACT_ADDRESS,
    USDC_ABI,
    parseUSDC,
    formatUSDC,
    isValidAddress,
    getPublicClient
} from "@/lib/contracts";
import { encodeFunctionData } from "viem";
import toast from "react-hot-toast";
import TransactionStatus from "./TransactionStatus";
import { Send, Wallet, Copy, Zap } from "lucide-react";

type TransactionStatus = "idle" | "pending" | "success" | "error";

interface TokenTransferProps {
    isLoggedIn: boolean;
}

export default function TokenTransfer({ isLoggedIn }: TokenTransferProps) {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState<TransactionStatus>("idle");
    const [txHash, setTxHash] = useState<string>("");
    const [usdcBalance, setUsdcBalance] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            fetchUSDCBalance();
        } else {
            setUsdcBalance("");
        }
    }, [isLoggedIn]);

    const fetchUSDCBalance = async () => {
        try {
            const publicClient = getPublicClient();
            const smartWalletAddress = await getSmartWalletAddress();

            const balance = await publicClient.readContract({
                address: USDC_CONTRACT_ADDRESS,
                abi: USDC_ABI,
                functionName: "balanceOf",
                args: [smartWalletAddress as `0x${string}`],
            });

            setUsdcBalance(formatUSDC(balance as bigint));
        } catch (error) {
            console.error("Failed to fetch USDC balance:", error);
            setUsdcBalance("0");
        }
    };

    const validateForm = () => {
        if (!isLoggedIn) {
            toast.error("Please login first");
            return false;
        }

        if (!recipient.trim()) {
            toast.error("Please enter a recipient address");
            return false;
        }

        if (!isValidAddress(recipient)) {
            toast.error("Invalid recipient address format");
            return false;
        }

        if (!amount.trim()) {
            toast.error("Please enter an amount");
            return false;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Please enter a valid amount greater than 0");
            return false;
        }

        const currentBalance = parseFloat(usdcBalance || "0");
        if (amountNum > currentBalance) {
            toast.error(`Insufficient USDC balance. You have ${usdcBalance} USDC`);
            return false;
        }

        return true;
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            setStatus("pending");

            const amountWei = parseUSDC(amount);

            const data = encodeFunctionData({
                abi: USDC_ABI,
                functionName: "transfer",
                args: [recipient as `0x${string}`, amountWei]
            });

            const { hash } = await executeGaslessTransaction(USDC_CONTRACT_ADDRESS, data);

            setTxHash(hash);
            setStatus("success");
            toast.success("USDC transfer successful!");

            setRecipient("");
            setAmount("");
            await fetchUSDCBalance();

        } catch (error: unknown) {
            console.error("Transfer failed:", error);
            setStatus("error");

            if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();

                if (errorMessage.includes("insufficient")) {
                    toast.error("Insufficient balance for transfer");
                } else if (errorMessage.includes("network")) {
                    toast.error("Network error. Please check your connection");
                } else if (errorMessage.includes("user rejected")) {
                    toast.error("Transaction was cancelled");
                } else if (errorMessage.includes("useroperation reverted")) {
                    toast.error("Transaction simulation failed. This usually means the smart wallet needs more gas or the transaction parameters are invalid.");
                } else if (errorMessage.includes("simulation failed")) {
                    toast.error("Transaction simulation failed - check contract permissions and parameters");
                } else {
                    toast.error(`Transfer failed: ${error.message}`);
                }
            } else {
                toast.error("Transfer failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetTransaction = () => {
        setStatus("idle");
        setTxHash("");
    };

    const fillTestData = () => {
        setRecipient("0x742d35Cc6634C0532925a3b8D8C8EC29582f6442");
        setAmount("1.0");
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Address copied to clipboard");
        } catch (error) {
            toast.error("Failed to copy address");
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600">Please login to transfer USDC</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Your USDC Balance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {usdcBalance ? `${usdcBalance} USDC` : "Loading..."}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchUSDCBalance}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Transfer Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <form onSubmit={handleTransfer} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Recipient Address
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="0x742d35Cc6634C0532925a3b8D8C8EC29582f6442"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                disabled={isLoading}
                            />
                            {recipient && (
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(recipient)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount (USDC)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="1.0"
                            step="0.000001"
                            min="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isLoading || !recipient || !amount}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Send Gasless Transfer
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={fillTestData}
                            disabled={isLoading}
                            className="px-4 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Test Data
                        </button>
                    </div>
                </form>
            </div>

            {/* Transaction Status */}
            {status !== "idle" && txHash && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <TransactionStatus
                        hash={txHash}
                        status={status}
                        onReset={resetTransaction}
                    />
                </div>
            )}

            {/* Test Data Info */}
            <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-medium text-gray-900 mb-2">Test Data</h5>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Recipient:</span>
                        <code className="text-gray-800 bg-gray-100 px-2 py-1 rounded">
                            0x742d35Cc6634C0532925a3b8D8C8EC29582f6442
                        </code>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="text-gray-800">1.0 USDC</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Click &quot;Test Data&quot; to auto-fill the form
                    </p>
                </div>
            </div>
        </div>
    );
}
