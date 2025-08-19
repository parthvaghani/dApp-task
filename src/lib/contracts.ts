"use client";

import { createPublicClient, http, type Address, getAddress } from "viem";

const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || "a83fa6d6-2301-4ecd-8bc2-40a8e65eeaa8";

// Define Polygon Amoy chain
const polygonAmoy = {
    id: 80002,
    name: "Polygon Amoy",
    nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [
                `https://rpc.zerodev.app/api/v3/${projectId}/chain/80002`
            ],
        },
        public: {
            http: [
                `https://rpc.zerodev.app/api/v3/${projectId}/chain/80002`
            ],
        },
    },
    blockExplorers: {
        default: {
            name: "Oklink",
            url: "https://www.oklink.com/amoy",
        },
    },
    testnet: true,
};

// USDC Contract ABI (ERC20 + specific functions we need)
export const USDC_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "from", "type": "address" },
      { "indexed": true, "name": "to", "type": "address" },
      { "indexed": false, "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": true, "name": "spender", "type": "address" },
      { "indexed": false, "name": "value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  }
] as const;

// USDC Contract Address (Polygon Amoy) - properly checksummed
export const USDC_CONTRACT_ADDRESS = getAddress(process.env.NEXT_PUBLIC_USDC_CONTRACT || "0xD464CC7367a7A39eb4b1E6643CDa262B0B0CfdA8") as Address;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// Helper function to format USDC amount (from wei to human readable)
export function formatUSDC(amount: bigint): string {
  return (Number(amount) / Math.pow(10, USDC_DECIMALS)).toFixed(USDC_DECIMALS);
}

// Helper function to parse USDC amount (from human readable to wei)
export function parseUSDC(amount: string): bigint {
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error("Invalid USDC amount");
  }
  return BigInt(Math.floor(parsed * Math.pow(10, USDC_DECIMALS)));
}

// Helper function to validate address
export function isValidAddress(address: string): boolean {
  try {
    getAddress(address);
    return true;
  } catch {
    return false;
  }
}

// Public client for reading contract data
export function getPublicClient() {
  return createPublicClient({
    chain: polygonAmoy,
    transport: http(
      `https://rpc.zerodev.app/api/v3/${projectId}/chain/80002`
    ),
  });
}
