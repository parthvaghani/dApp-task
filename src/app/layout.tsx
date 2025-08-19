import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZeroDev dApp - Gasless Web3 Experience",
  description: "A modern dApp built with Next.js, Web3Auth, and ZeroDev that demonstrates Google authentication with smart wallet creation and gasless token transactions on Polygon Amoy testnet.",
  keywords: ["Web3", "ZeroDev", "Web3Auth", "Account Abstraction", "Gasless Transactions", "Polygon", "dApp"],
  authors: [{ name: "ZeroDev dApp" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
