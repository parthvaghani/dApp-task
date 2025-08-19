"use client";

import { useState } from "react";
import GoogleLogin from "@/components/GoogleLogin";
import WalletInfo from "@/components/WalletInfo";
import TokenTransfer from "@/components/TokenTransfer";
import BatchedActions from "@/components/BatchedActions";
import USDCFaucet from "@/components/USDCFaucet";
import { ChevronDown, ChevronRight, Wallet, Send, Zap, Coins } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ZeroDev dApp
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of Web3 with gasless transactions, smart wallets, and seamless Google authentication
          </p>
        </div>

        {/* Authentication Section */}
        <div className="flex justify-center mb-12">
          <GoogleLogin onLoginStateChange={setIsLoggedIn} />
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Wallet Information - Always Visible */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <WalletInfo isLoggedIn={isLoggedIn} />
          </div>

          {/* Features Section - Only show when logged in */}
          {isLoggedIn && (
            <div className="space-y-6">
              {/* USDC Faucet Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('faucet')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Coins className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">USDC Faucet</h3>
                      <p className="text-sm text-gray-600">Get test USDC tokens for development</p>
                    </div>
                  </div>
                  {activeSection === 'faucet' ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {activeSection === 'faucet' && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <USDCFaucet isLoggedIn={isLoggedIn} />
                  </div>
                )}
              </div>

              {/* Transaction Features Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* USDC Transfer Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('transfer')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900">USDC Transfer</h3>
                        <p className="text-sm text-gray-600">Send USDC tokens gaslessly</p>
                      </div>
                    </div>
                    {activeSection === 'transfer' ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {activeSection === 'transfer' && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <TokenTransfer isLoggedIn={isLoggedIn} />
                    </div>
                  )}
                </div>

                {/* Batched Actions Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('batched')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900">Batched Actions</h3>
                        <p className="text-sm text-gray-600">Approve & transfer in one transaction</p>
                      </div>
                    </div>
                    {activeSection === 'batched' ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {activeSection === 'batched' && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <BatchedActions isLoggedIn={isLoggedIn} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
