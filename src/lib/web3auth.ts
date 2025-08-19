"use client";

import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, type SafeEventEmitterProvider } from "@web3auth/base";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string;
const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || "a83fa6d6-2301-4ecd-8bc2-40a8e65eeaa8";

// Only log errors in development to prevent build issues
if (!clientId || clientId === "your_web3auth_client_id_here") {
	console.error("❌ Missing or invalid NEXT_PUBLIC_WEB3AUTH_CLIENT_ID in environment");
	console.error("Please create a Web3Auth project and update your .env.local file");
	console.error("Visit: https://dashboard.web3auth.io/");
}

export const web3auth = new Web3Auth({
	clientId: clientId || "placeholder",
	web3AuthNetwork: "sapphire_devnet",
	// Use browser-specific configuration to avoid React Native dependencies
	enableLogging: false,
	uiConfig: {
		uxMode: "popup",
		logoLight: "/globe.svg",
		logoDark: "/globe.svg",
		defaultLanguage: "en",
		mode: "light",
		useLogoLoader: true,
	},
	chains: [
		{
			chainNamespace: CHAIN_NAMESPACES.EIP155,
			chainId: "0x13882", // Polygon Amoy
			rpcTarget: `https://rpc.zerodev.app/api/v3/${projectId}/chain/80002`,
			displayName: "Polygon Amoy",
			blockExplorerUrl: "https://www.oklink.com/amoy",
			logo: "/globe.svg",
			ticker: "MATIC",
			tickerName: "MATIC",
		},
	],
});

export async function initWeb3Auth(): Promise<void> {
	try {
		// Only initialize if we're in the browser and have a valid client ID
		if (typeof window !== 'undefined' && clientId && clientId !== "your_web3auth_client_id_here") {
			await web3auth.init();
		}
	} catch (error) {
		console.error("Failed to initialize Web3Auth:", error);
		// Don't throw error to prevent build failures
	}
}

export type Web3AuthProvider = SafeEventEmitterProvider | null;


