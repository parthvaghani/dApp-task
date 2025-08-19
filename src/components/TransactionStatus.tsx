"use client";

import { useState, useEffect } from "react";
import { ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TransactionStatusProps {
    hash: string;
    status: "pending" | "success" | "error";
    onReset: () => void;
}

export default function TransactionStatus({ hash, status, onReset }: TransactionStatusProps) {
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        if (status === "pending") {
            const interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status]);

    const getStatusIcon = () => {
        switch (status) {
            case "pending":
                return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case "pending":
                return "Processing transaction...";
            case "success":
                return "Transaction successful!";
            case "error":
                return "Transaction failed";
            default:
                return "";
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "pending":
                return "text-blue-600";
            case "success":
                return "text-green-600";
            case "error":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="mt-4 p-4 border rounded-lg bg-white">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className={`font-medium ${getStatusColor()}`}>
                        {getStatusText()}
                    </span>
                </div>
                {status === "pending" && (
                    <span className="text-sm text-gray-500">
                        {formatTime(timeElapsed)}
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                            {hash}
                        </code>
                        <a
                            href={`https://www.oklink.com/amoy/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {status === "success" && (
                    <div className="mt-3 pt-3 border-t">
                        <button
                            onClick={onReset}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Send Another Transfer
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="mt-3 pt-3 border-t">
                        <button
                            onClick={onReset}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
