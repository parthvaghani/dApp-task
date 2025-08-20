"use client";

import { useState, useEffect } from "react";
import { executeBatchedApprovalAndTransfer } from "@/lib/batchTransactions";
import {
  USDC_CONTRACT_ADDRESS,
  USDC_ABI,
  parseUSDC,
  formatUSDC,
  isValidAddress,
  getPublicClient,
} from "@/lib/contracts";
import { getSmartWalletAddress } from "@/lib/zerodev";
import toast from "react-hot-toast";
import TransactionStatus from "./TransactionStatus";
import { Zap, Wallet, Copy, ArrowRight, Layers } from "lucide-react";

type TransactionStatus = "idle" | "pending" | "success" | "error";

interface BatchedActionsProps {
  isLoggedIn: boolean;
}

export default function BatchedActions({ isLoggedIn }: BatchedActionsProps) {
  const [spender, setSpender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [usdcBalance, setUsdcBalance] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  // Single batched mode only

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

    if (!spender.trim()) {
      toast.error("Please enter a spender address");
      return false;
    }

    if (!isValidAddress(spender)) {
      toast.error("Invalid spender address format");
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

  const handleBatchedAction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setStatus("pending");

      const amountWei = parseUSDC(amount);

      const result = await executeBatchedApprovalAndTransfer(
        spender as `0x${string}`,
        recipient as `0x${string}`,
        amountWei
      );
      setTxHash(result.hash);

      setStatus("success");
      toast.success("Smart approval + transfer successful!");

      setSpender("");
      setRecipient("");
      setAmount("");
      await fetchUSDCBalance();
    } catch (error) {
      console.error("Batched action failed:", error);
      setStatus("error");

      if (error instanceof Error) {
        if (error.message.includes("insufficient")) {
          toast.error("Insufficient balance for transfer");
        } else if (error.message.includes("network")) {
          toast.error("Network error. Please check your connection");
        } else if (error.message.includes("user rejected")) {
          toast.error("Transaction was cancelled");
        } else {
          toast.error("Batched action failed. Please try again.");
        }
      } else {
        toast.error("Batched action failed. Please try again.");
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
    setSpender("0x1a9Ea0628868298b0e252D249deBb9ff91795341");
    setRecipient("0x1a9Ea0628868298b0e252D249deBb9ff91795341");
    setAmount("1.0");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layers className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-600">Please login to use batched actions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Your USDC Balance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {usdcBalance ? `${usdcBalance} USDC` : "Loading..."}
              </p>
            </div>
          </div>
          <button
            onClick={fetchUSDCBalance}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-2">Transaction Mode</h4>
        <div className="p-4 rounded-lg border-2 border-purple-500 bg-purple-50 text-purple-700">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Smart Mode</span>
          </div>
          <p className="text-xs text-gray-600">
            Approve and transfer executed in one user operation
          </p>
        </div>
      </div>

      {/* Transaction Flow Visualization */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h5 className="font-medium text-gray-900 mb-3">Transaction Flow</h5>
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="bg-white px-3 py-2 rounded-lg border">
            <span className="font-medium">Approve</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="bg-white px-3 py-2 rounded-lg border">
            <span className="font-medium">Transfer</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg border border-green-200">
            <span className="font-medium">Single TX</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleBatchedAction} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Spender Address (Who can spend)
            </label>
            <div className="relative">
              <input
                type="text"
                value={spender}
                onChange={(e) => setSpender(e.target.value)}
                placeholder="0x1a9Ea0628868298b0e252D249deBb9ff91795341"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isLoading}
              />
              {spender && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(spender)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recipient Address (Who receives)
            </label>
            <div className="relative">
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x1a9Ea0628868298b0e252D249deBb9ff91795341"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || !spender || !recipient || !amount}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Execute Smart Action
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

      {/* Mode Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h5 className="font-medium text-gray-900 mb-2">Smart Mode Benefits</h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Single transaction execution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Automatic approval detection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Lower gas costs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
