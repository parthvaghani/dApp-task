"use client";

import { toSigner } from "@zerodev/sdk";
import { getKernelAddressFromECDSA } from "@zerodev/ecdsa-validator";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_3, getEntryPoint } from "@zerodev/sdk/constants";
import { getUserOperationGasPrice } from "@zerodev/sdk/actions";
import {
  type Address,
  type Chain,
  defineChain,
  http,
  createPublicClient,
  type PublicClient,
  type EIP1193Provider,
  type Hash,
  type TransactionReceipt,
} from "viem";
import { web3auth } from "@/lib/web3auth";
import { formatEther } from "viem";

const projectId =
  process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID ||
  process.env.REACT_APP_ZERODEV_PROJECT_ID ||
  "bbf7388d-98f1-413d-8366-de0e77dfd88e";

if (!projectId || projectId === "your_zerodev_project_id_here") {
  console.error(
    "❌ Missing or invalid NEXT_PUBLIC_ZERODEV_PROJECT_ID in environment"
  );
  console.error(
    "Please create a ZeroDev project and update your .env.local file"
  );
  console.error("Visit: https://dashboard.zerodev.app/");
}

// Define Polygon Amoy chain
export const polygonAmoy: Chain = defineChain({
  id: 80002,
  name: "Polygon Amoy",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [`https://rpc.zerodev.app/api/v3/${projectId}/chain/80002`],
    },
    public: {
      http: [`https://rpc.zerodev.app/api/v3/${projectId}/chain/80002`],
    },
  },
  blockExplorers: {
    default: {
      name: "Oklink",
      url: "https://www.oklink.com/amoy",
    },
  },
  testnet: true,
});

export function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: polygonAmoy,
    transport: http(`https://rpc.zerodev.app/api/v3/${projectId}/chain/80002`),
  });
}

export async function getEoaAddress(): Promise<Address> {
  if (!web3auth.provider) throw new Error("Not authenticated");
  const account = await toSigner({
    signer: web3auth.provider as unknown as EIP1193Provider,
  });
  return account.address as Address;
}

export async function getSmartWalletAddress(): Promise<`0x${string}`> {
  const publicClient = getPublicClient();
  const eoa = await getEoaAddress();
  const address = await getKernelAddressFromECDSA({
    publicClient,
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_3,
    eoaAddress: eoa,
    index: BigInt(0),
    initConfig: [],
  });
  console.log("Smart wallet address:", address);
  return address as `0x${string}`;
}

export async function getSmartAccountClient() {
  if (!web3auth.provider) throw new Error("Not authenticated");

  const publicClient = getPublicClient();

  const validator = await signerToEcdsaValidator(publicClient, {
    signer: web3auth.provider as unknown as EIP1193Provider,
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_3,
  });

  const account = await createKernelAccount(publicClient, {
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_3,
    plugins: { sudo: validator },
    index: BigInt(0),
    initConfig: [],
  });

  console.log("Kernel account created:", account.address);
  console.log("Project ID:", projectId);

  // Use the v3 bundler endpoint for consistency
  const bundlerUrl = `https://rpc.zerodev.app/api/v3/${projectId}/chain/80002`;
  console.log("Bundler URL:", bundlerUrl);

  // Create paymaster client for gas sponsorship
  const paymasterClient = createZeroDevPaymasterClient({
    chain: polygonAmoy,
    transport: http(bundlerUrl),
  });

  // Create kernel account client with proper configuration
  const client = createKernelAccountClient({
    account,
    chain: polygonAmoy,
    bundlerTransport: http(bundlerUrl),
    paymaster: {
      getPaymasterData: async (userOperation) =>
        paymasterClient.sponsorUserOperation({ userOperation }),
    },
    client: publicClient,
    userOperation: {
      estimateFeesPerGas: async ({ bundlerClient }) =>
        getUserOperationGasPrice(bundlerClient),
    },
  });

  return client;
}

export async function executeGaslessTransaction(
  to: Address,
  data: `0x${string}`,
  value: bigint = 0n
): Promise<{ hash: Hash; receipt: TransactionReceipt }> {
  const client = await getSmartAccountClient();
  const publicClient = getPublicClient();

  console.log("Executing transaction:");
  console.log("- To:", to);
  console.log("- Data:", data);
  console.log("- Value:", value.toString());
  console.log("- Account:", client.account.address);

  try {
    // If sending native value, ensure wallet has enough balance for the value itself
    if (value > 0n) {
      const balance = await publicClient.getBalance({
        address: client.account.address,
      });
      console.log("Smart wallet balance:", balance.toString(), "wei");
      if (balance < value) {
        throw new Error(
          `Insufficient balance. Required: ${value.toString()} wei, Available: ${balance.toString()} wei`
        );
      }
    }

    // Send as a UserOperation with sponsored gas
    const callData = await client.account.encodeCalls([{ to, data, value }]);
    console.log("Sending UserOperation...");
    const userOpHash = await client.sendUserOperation({ callData });
    console.log("UserOperation hash:", userOpHash);

    const { receipt } = await client.waitForUserOperationReceipt({
      hash: userOpHash,
    });
    console.log("Transaction receipt:", receipt);

    return { hash: receipt.transactionHash, receipt };
  } catch (error) {
    console.error("Transaction execution failed:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes("insufficient funds")) {
        throw new Error("Insufficient funds in smart wallet");
      } else if (errorMessage.includes("simulation failed")) {
        throw new Error(
          "Transaction simulation failed - check contract permissions and parameters"
        );
      } else if (errorMessage.includes("user rejected")) {
        throw new Error("Transaction was rejected by user");
      } else if (errorMessage.includes("useroperation reverted")) {
        throw new Error(
          "UserOperation reverted - this usually means the smart wallet doesn't have enough gas or the transaction parameters are invalid"
        );
      } else if (errorMessage.includes("gas estimation failed")) {
        throw new Error(
          "Gas estimation failed - check if the smart wallet has enough balance for gas fees"
        );
      } else if (errorMessage.includes("bundler error")) {
        throw new Error(
          "Bundler error - check your ZeroDev project configuration and network connectivity"
        );
      }
    }

    throw error;
  }
}

// Execute multiple contract calls in a single UserOperation (batched)
export async function executeBatchedTransactions(
  calls: Array<{ to: Address; data: `0x${string}`; value?: bigint }>
): Promise<{ hash: Hash; receipt: TransactionReceipt }> {
  const client = await getSmartAccountClient();

  // Normalize missing values to 0n
  const normalizedCalls = calls.map((c) => ({ ...c, value: c.value ?? 0n }));

  console.log(
    "Executing batched transaction with",
    normalizedCalls.length,
    "calls"
  );
  normalizedCalls.forEach((c, i) => {
    console.log(`- Call #${i + 1} To:`, c.to);
    console.log(`  Value:`, c.value?.toString() ?? "0");
  });

  try {
    const callData = await client.account.encodeCalls(normalizedCalls);
    const userOpHash = await client.sendUserOperation({ callData });
    const { receipt } = await client.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return { hash: receipt.transactionHash, receipt };
  } catch (error) {
    console.error("Batched transaction execution failed:", error);
    throw error;
  }
}

// Utility function to check smart wallet balance
export async function getSmartWalletBalance(): Promise<bigint> {
  const smartWalletAddress = await getSmartWalletAddress();
  return await getPublicClient().getBalance({ address: smartWalletAddress });
}

// Utility function to fund smart wallet (for testing)
export async function fundSmartWallet(
  amount: bigint
): Promise<{ hash: Hash; receipt: TransactionReceipt }> {
  const eoa = await getEoaAddress();
  const smartWalletAddress = await getSmartWalletAddress();

  console.log("Funding smart wallet:");
  console.log("- From EOA:", eoa);
  console.log("- To Smart Wallet:", smartWalletAddress);
  console.log("- Amount:", amount.toString(), "wei");

  // This would require the EOA to have funds and sign the transaction
  // For now, this is a placeholder for manual funding
  throw new Error(
    "Manual funding required. Please send funds to the smart wallet address from your EOA."
  );
}

// Test function to verify smart wallet setup
export async function testSmartWalletSetup(): Promise<{
  eoaAddress: string;
  smartWalletAddress: string;
  smartWalletBalance: string;
  gasPrice: string;
  isReady: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  const publicClient = getPublicClient();

  try {
    // Get EOA address
    const eoa = await getEoaAddress();

    // Get smart wallet address
    const smartWallet = await getSmartWalletAddress();

    // Get smart wallet balance
    const balance = await getSmartWalletBalance();

    // Get gas price
    const gasPrice = await publicClient.getGasPrice();

    // Check if smart wallet has enough balance for gas
    const minBalance = 1000000000000000n; // 0.001 MATIC
    if (balance < minBalance) {
      issues.push(
        `Smart wallet balance too low: ${formatEther(
          balance
        )} MATIC. Need at least ${formatEther(minBalance)} MATIC for gas fees.`
      );
    }

    // Test if we can create a client
    try {
      await getSmartAccountClient();
    } catch (error) {
      issues.push(
        `Failed to create smart account client: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    return {
      eoaAddress: eoa,
      smartWalletAddress: smartWallet,
      smartWalletBalance: formatEther(balance),
      gasPrice: formatEther(gasPrice),
      isReady: issues.length === 0,
      issues,
    };
  } catch (error) {
    issues.push(
      `Setup test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return {
      eoaAddress: "",
      smartWalletAddress: "",
      smartWalletBalance: "0",
      gasPrice: "0",
      isReady: false,
      issues,
    };
  }
}
