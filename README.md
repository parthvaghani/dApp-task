# ZeroDev dApp - Google Login + Gasless Transfer + Batched Actions

A simple dApp built with Next.js, Web3Auth, and ZeroDev that demonstrates Google login, smart wallet creation, a gasless USDC transfer, and a batched approval + transfer in a single user operation on Polygon Amoy.

## ✨ Features

-  **Google SSO Authentication** - One-click login with Web3Auth
-  **Smart Wallet Creation** - Automatic AA wallet creation via ZeroDev
-  **Gasless Transactions** - Zero gas fees using ZeroDev's bundler
-  **USDC Transfer** - Send USDC tokens gaslessly
-  **Batched Approval + Transfer** - Single user operation with approval then transfer
-  **Modern UI/UX** - Clean, responsive interface with real-time status
-  **Transaction Tracking** - Monitor transactions with block explorer links

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js** | React framework with App Router |
| **React** | UI library |
| **TypeScript** | Type-safe development |
| **Web3Auth** | Social authentication (Google SSO) |
| **ZeroDev** | Account Abstraction & gasless transactions |
| **Polygon Amoy** | Testnet for development |
| **Tailwind CSS** | Utility-first styling |
| **React Hot Toast** | User notifications |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Web3Auth account ([Sign up here](https://dashboard.web3auth.io/))
- ZeroDev account ([Sign up here](https://dashboard.zerodev.app/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dApp-task
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   # Web3Auth Configuration
   NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here
   NEXT_PUBLIC_ZERODEV_PROJECT_ID=your_zerodev_project_id_here
   NEXT_PUBLIC_TOKEN_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
   ```

4. **Configure Web3Auth**
   - Visit [Web3Auth Dashboard](https://dashboard.web3auth.io/)
   - Create a new project
   - Add `http://localhost:3000` to authorized origins
   - Copy your Client ID to `.env.local`

5. **Configure ZeroDev**
   - Visit [ZeroDev Dashboard](https://dashboard.zerodev.app/)
   - Create a new project
   - Select Polygon Amoy network
   - Copy your Project ID to `.env.local`

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How It Works

### 1. Authentication Flow
```
User clicks "Login with Google"
→ Web3Auth handles OAuth
→ Smart wallet created via ZeroDev
→ User can perform gasless transactions
```

### 2. Gasless Transaction Flow
```
User initiates transaction
→ ZeroDev bundles transaction
→ Transaction executed on-chain
→ User pays no gas fees
```

### 3. Smart Wallet Benefits
- **No seed phrases** - Social login creates wallet
- **Gasless transactions** - ZeroDev covers gas costs
- **Batch operations** - Multiple actions in one transaction
- **Enhanced security** - Account abstraction features

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── GoogleLogin.tsx    # Authentication component
│   ├── WalletInfo.tsx     # Smart wallet display
│   ├── TokenTransfer.tsx  # USDC transfer interface
│   ├── BatchedActions.tsx # Batch transaction UI
│   ├── USDCFaucet.tsx     # Test USDC minting
│   └── TransactionStatus.tsx # Transaction monitoring
├── lib/                   # Core libraries
│   ├── web3auth.ts        # Web3Auth configuration
│   ├── zerodev.ts         # ZeroDev smart wallet setup
│   ├── contracts.ts       # Contract ABIs & helpers
│   └── batchTransactions.ts # Batch transaction logic
└── hooks/                 # Custom React hooks
    └── useSmartWallet.ts  # Smart wallet state management
```

## 🔧 Configuration

### Supported Networks

Currently configured for **Polygon Amoy Testnet**:
- **Chain ID**: 80002
- **RPC**: ZeroDev bundled endpoint
- **Block Explorer**: [Oklink Amoy](https://www.oklink.com/amoy)
- **Test Tokens**: Available via faucet

### USDC Contract Details

- Address and ABI are configurable. Default contract is a test USDC on Amoy.

## 🧪 Testing

### Getting Test Tokens

- MATIC is not required for end users due to sponsorship, but the Paymaster/bundler may require project-side funding. If needed, use the Polygon Amoy faucet.

### Test Data

The app includes convenient test data:
- **Test Recipient**: `0x1a9Ea0628868298b0e252D249deBb9ff91795341`
- **Test Amount**: 1.0 USDC

Use "Test Data" buttons to auto-fill forms.

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **"Not authenticated"** | Check Web3Auth Client ID in `.env.local` |
| **"Missing project ID"** | Verify ZeroDev Project ID configuration |
| **Transaction failures** | Ensure sufficient MATIC for gas fees |
| **Network errors** | Check RPC URL and network configuration |

### Debug Mode

Enable debug logging:
1. Open browser console (F12)
2. Look for Web3Auth initialization logs
3. Check smart wallet creation logs
4. Monitor transaction execution logs

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` | Web3Auth project client ID | ✅ |
| `NEXT_PUBLIC_ZERODEV_PROJECT_ID` | ZeroDev project ID | ✅ |
| `NEXT_PUBLIC_TOKEN_ADDRESS` | Test token contract address | ✅ |

## 📚 Resources

- [Web3Auth Documentation](https://web3auth.io/docs)
- [ZeroDev Documentation](https://docs.zerodev.app/)
- [Polygon Amoy Guide](https://wiki.polygon.technology/docs/amoy/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify environment variables are correct
4. Ensure you're using Node.js 18+

---

**Note**: This is a demonstration application for educational purposes. Always test thoroughly before deploying to production.
