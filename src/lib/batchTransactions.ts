"use client";

import { encodeFunctionData, type TransactionReceipt } from "viem";
import { USDC_ABI, USDC_CONTRACT_ADDRESS, getPublicClient } from "@/lib/contracts";
import { executeGaslessTransaction, getSmartWalletAddress } from "@/lib/zerodev";
import type { Address } from "viem";

export async function executeBatchedApprovalAndTransfer(
    spender: Address,
    recipient: Address,
    amount: bigint
): Promise<{ hash: string; receipt: TransactionReceipt; }> {
    console.log("Executing batched approval and transfer:");
    console.log("- Spender:", spender);
    console.log("- Recipient:", recipient);
    console.log("- Amount:", amount.toString());

    // For ERC20 tokens, we can't batch approve + transfer in a single call
    // because they're separate functions. Instead, we'll do them sequentially
    // but in a more optimized way.

    try {
        // First, check if approval is already sufficient
        const publicClient = getPublicClient();
        const smartWalletAddress = await getSmartWalletAddress();

        const currentAllowance = await publicClient.readContract({
            address: USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: "allowance",
            args: [smartWalletAddress, spender],
        });

        console.log("Current allowance:", currentAllowance.toString());
        console.log("Required amount:", amount.toString());

        // If current allowance is sufficient, skip approval
        if (currentAllowance >= amount) {
            console.log("Sufficient allowance exists, proceeding with transfer only");

            const transferData = encodeFunctionData({
                abi: USDC_ABI,
                functionName: "transfer",
                args: [recipient, amount],
            });

            const { hash, receipt } = await executeGaslessTransaction(USDC_CONTRACT_ADDRESS, transferData);
            console.log("Transfer transaction successful:", hash);
            return { hash, receipt };
        }

        // If approval needed, do approval first
        console.log("Approval needed, executing approval first");
        const approveData = encodeFunctionData({
            abi: USDC_ABI,
            functionName: "approve",
            args: [spender, amount],
        });

        const { hash: approvalHash } = await executeGaslessTransaction(USDC_CONTRACT_ADDRESS, approveData);
        console.log("Approval transaction successful:", approvalHash);

        // Wait a moment for the approval to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Then do the transfer
        const transferData = encodeFunctionData({
            abi: USDC_ABI,
            functionName: "transfer",
            args: [recipient, amount],
        });

        const { hash: transferHash, receipt: transferReceipt } = await executeGaslessTransaction(USDC_CONTRACT_ADDRESS, transferData);
        console.log("Transfer transaction successful:", transferHash);

        // Return the transfer hash as the main result
        return { hash: transferHash, receipt: transferReceipt };
    } catch (error) {
        console.error("Batched transaction failed:", error);
        throw error;
    }
}

export async function executeSequentialApprovalAndTransfer(
    spender: Address,
    recipient: Address,
    amount: bigint
): Promise<{ approvalHash: string; transferHash: string; }> {
    console.log("Executing sequential approval and transfer:");
    console.log("- Spender:", spender);
    console.log("- Recipient:", recipient);
    console.log("- Amount:", amount.toString());

    try {
        // First, approve the spender
        const approveData = encodeFunctionData({
            abi: USDC_ABI,
            functionName: "approve",
            args: [spender, amount],
        });

        console.log("Executing approval transaction...");
        const { hash: approvalHash } = await executeGaslessTransaction(USDC_CONTRACT_ADDRESS, approveData);
        console.log("Approval transaction hash:", approvalHash);

        // Wait a moment for the approval to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Then, transfer the tokens
        const transferData = encodeFunctionData({
            abi: USDC_ABI,
            functionName: "transfer",
            args: [recipient, amount]
        });

        console.log("Executing transfer transaction...");
        const { hash: transferHash } = await executeGaslessTransaction(USDC_CONTRACT_ADDRESS, transferData);
        console.log("Transfer transaction hash:", transferHash);

        return { approvalHash, transferHash };
    } catch (error) {
        console.error("Sequential transaction failed:", error);
        throw error;
    }
}
