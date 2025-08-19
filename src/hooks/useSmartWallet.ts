"use client";

import { useEffect, useState } from "react";
import { getSmartWalletAddress, getPublicClient } from "@/lib/zerodev";
import { formatEther } from "viem";

export function useSmartWallet() {
    const [address, setAddress] = useState<string>("");
    const [balance, setBalance] = useState<string>("");
    const [isReady, setIsReady] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        (async () => {
            try {
                const sa = await getSmartWalletAddress();
                setAddress(sa);
                const pub = getPublicClient();
                const bal = await pub.getBalance({ address: sa as `0x${string}` });
                setBalance(formatEther(bal));
                setIsReady(true);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to init smart wallet";
                setError(message);
            }
        })();
    }, []);

    return { address, balance, isReady, error };
}

export default useSmartWallet;


