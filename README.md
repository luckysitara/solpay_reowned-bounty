# SolPay - Decentralized Payment Gateway

SolPay is a decentralized payment gateway built on the Solana blockchain, leveraging the power of the Solana AppKit. This project is an entry for the renowned AppKit bounty on earn.superteam.fun.

## Features

- Full payment processing
- Enhanced security measures
- Expanded token support
- Recurring payment management
- Invoice generation
- Token swap interface
- Mobile-optimized interface
- Real-time notifications
- Merchant dashboard with analytics

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository:

## Running SolPay

1. After installing the dependencies, start the development server:

   \`\`\`
   npm run dev
   \`\`\`

2. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

SolPay leverages the power of Solana AppKit to provide a seamless experience for users. Here are some key features enabled by Solana AppKit:

- **Wallet Integration**: Easy connection to Solana wallets.
- **Transaction Management**: Simplified creation and sending of transactions.
- **Token Account Management**: Effortless fetching and management of token accounts.
- **Balance Queries**: Quick and efficient balance checks for SOL and SPL tokens.

To use these features in your code, import the necessary functions from Solana AppKit:

\`\`\`typescript
import { useAppKit } from "@solana/app-kit"

// In your component
const { getBalance, getTransactions, getTokenAccounts, transferSol } = useAppKit()
\`\`\`

For more information on how to use Solana AppKit, refer to the official documentation.

## Configuration

The application is set up to connect to the Solana mainnet using a Helius RPC URL. If you need to change the RPC URL or switch to a different network (e.g., devnet or testnet), you can modify the following lines in `src/index.tsx`:

\`\`\`typescript
const network = WalletAdapterNetwork.Mainnet;
const endpoint = 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY';
\`\`\`

Replace `YOUR_API_KEY` with your actual Helius API key, or use a different RPC URL entirely.

