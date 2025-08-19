# Environment Setup Guide

Follow these steps to configure your environment variables for the ZeroDev dApp.

## 1. Create Environment File

Create a `.env.local` file in the root directory of your project:

```bash
touch .env.local
```

## 2. Configure Web3Auth

1. Visit [Web3Auth Dashboard](https://dashboard.web3auth.io/)
2. Create a new project
3. Add your domain to authorized origins:
   - For local development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
4. Copy your Client ID

## 3. Configure ZeroDev

1. Visit [ZeroDev Dashboard](https://dashboard.zerodev.app/)
2. Create a new project
3. Select Polygon Amoy as your network
4. Copy your Project ID

## 4. Environment Variables

Add the following to your `.env.local` file:

```env
# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here

# ZeroDev Configuration
NEXT_PUBLIC_ZERODEV_PROJECT_ID=your_zerodev_project_id_here

# USDC Contract (Polygon Amoy Testnet)
NEXT_PUBLIC_USDC_CONTRACT=0xD464CC7367a7A39eb4b1E6643CDa262B0B0CfdA8
```

## 5. Verification

After setting up your environment variables:

1. Restart your development server
2. Check the browser console for any configuration errors
3. Try logging in with Google

## Troubleshooting

- **"Missing Client ID"**: Ensure your Web3Auth Client ID is correct
- **"Missing Project ID"**: Verify your ZeroDev Project ID is set
- **Network errors**: Check that your domains are added to authorized origins
- **Authentication failures**: Ensure you're using the correct network (Polygon Amoy)

## Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure
- Use different projects for development and production
- Regularly rotate your API keys
