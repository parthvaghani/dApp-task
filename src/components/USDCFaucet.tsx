"use client";

import { useState } from "react";
import { executeGaslessTransaction } from "@/lib/zerodev";
import { USDC_CONTRACT_ADDRESS, USDC_ABI, parseUSDC } from "@/lib/contracts";
import { encodeFunctionData } from "viem";
import toast from "react-hot-toast";
import TransactionStatus from "./TransactionStatus";
import { Coins, Zap, ExternalLink, AlertCircle } from "lucide-react";

type TransactionStatus = "idle" | "pending" | "success" | "error";

interface USDCFaucetProps {
    isLoggedIn: boolean;
}

export default function USDCFaucet({ isLoggedIn }: USDCFaucetProps) {
    const [status, setStatus] = useState<TransactionStatus>("idle");
    const [txHash, setTxHash] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleMintUSDC = async () => {
        if (!isLoggedIn) {
            toast.error("Please login first");
            return;
        }

        try {
            setIsLoading(true);
            setStatus("pending");

            // Mint 1000 USDC (1000000000 with 6 decimals)
            const amount = parseUSDC("1000");

            // We'll use a simple mint function call
            // Note: This assumes the contract has a mint function for testing
            const data = encodeFunctionData({
                abi: USDC_ABI,
                functionName: "mint",
                args: [amount]
            });

            const { hash } = await executeGaslessTransaction(USDC_CONTRACT_ADDRESS, data);

            setTxHash(hash);
            setStatus("success");
            toast.success("Successfully minted 1000 USDC!");

        } catch (error) {
            console.error("Mint failed:", error);
            setStatus("error");

            if (error instanceof Error) {
                if (error.message.includes("mint")) {
                    toast.error("Mint function not available. Try the manual faucet method.");
                } else {
                    toast.error("Mint failed. Please try again.");
                }
            } else {
                toast.error("Mint failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetTransaction = () => {
        setStatus("idle");
        setTxHash("");
    };

    if (!isLoggedIn) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600">Please login to use the USDC faucet</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Faucet Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">Quick Mint</h4>
                        <p className="text-sm text-gray-600">Get 1000 test USDC instantly</p>
                    </div>
                </div>

                <button
                    onClick={handleMintUSDC}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Minting USDC...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <Coins className="w-5 h-5" />
                            Mint 1000 USDC
                        </div>
                    )}
                </button>
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

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Warning Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h5 className="font-medium text-amber-800 mb-1">Test Tokens Only</h5>
                            <p className="text-sm text-amber-700">
                                These are test USDC tokens for development purposes only. They have no real value.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alternative Methods Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h5 className="font-medium text-blue-800 mb-2">Alternative Methods</h5>
                    <div className="space-y-2">
                        <a
                            href="https://www.oklink.com/amoy/faucet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Polygon Amoy Faucet (MATIC)
                        </a>
                        <div className="text-xs text-blue-600">
                            Contract: {USDC_CONTRACT_ADDRESS.slice(0, 8)}...{USDC_CONTRACT_ADDRESS.slice(-6)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
