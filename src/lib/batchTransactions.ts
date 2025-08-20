"use client";

import { encodeFunctionData, type TransactionReceipt } from "viem";
import {
  USDC_ABI,
  USDC_CONTRACT_ADDRESS,
} from "@/lib/contracts";
import {
  executeBatchedTransactions,
} from "@/lib/zerodev";
import type { Address } from "viem";

export async function executeBatchedApprovalAndTransfer(
  spender: Address,
  recipient: Address,
  amount: bigint
): Promise<{ hash: string; receipt: TransactionReceipt }> {
  console.log("Executing batched approval and transfer:");
  console.log("- Spender:", spender);
  console.log("- Recipient:", recipient);
  console.log("- Amount:", amount.toString());

  try {
    // Build approve + transfer as a single UserOperation
    // First approve the spender, then do a direct transfer to recipient
    const approveData = encodeFunctionData({
      abi: USDC_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
    
    const transferData = encodeFunctionData({
      abi: USDC_ABI,
      functionName: "transfer",
      args: [recipient, amount],
    });

    const { hash, receipt } = await executeBatchedTransactions([
      { to: USDC_CONTRACT_ADDRESS, data: approveData },
      { to: USDC_CONTRACT_ADDRESS, data: transferData },
    ]);

    return { hash, receipt };
  } catch (error) {
    console.error("Batched transaction failed:", error);
    throw error;
  }
}
