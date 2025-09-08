# 🔒 CryptoLock Rewards

> **Lock your crypto, unlock predictable rewards.**

A decentralized application built on Base that allows users to securely lock their cryptocurrency for fixed periods to earn predictable interest and rewards.

![CryptoLock Rewards Dashboard](https://via.placeholder.com/800x400/1e293b/ffffff?text=CryptoLock+Rewards+Dashboard)

## ✨ Features

### 🏦 Core Functionality
- **Time-Locked Deposits**: Lock USDC or WETH for 30, 90, or 180 days
- **Fixed APY Rewards**: Earn predictable returns with transparent rates
- **Non-Custodial**: Keep full control of your private keys
- **Base Network**: Low fees and fast transactions

### 📊 Portfolio Management
- **Real-time Tracking**: Monitor your deposits and earnings
- **Interactive Charts**: Visualize your portfolio growth
- **Detailed Analytics**: Track performance over time
- **Multi-Asset Support**: Manage USDC and WETH deposits

### 🎯 Premium Features
- **Subscription Tiers**: Free and Premium plans available
- **Boosted APY**: Premium users get +0.5% APY boost
- **Early Withdrawal**: Reduced penalties for Premium users
- **Advanced Analytics**: Detailed insights and projections

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/vistara-apps/this-is-a-4587.git
cd this-is-a-4587

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your environment variables (see Configuration section)
# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
# Blockchain RPC (choose one)
VITE_ALCHEMY_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
VITE_QUICKNODE_RPC_URL=https://YOUR_ENDPOINT.base-mainnet.quiknode.pro/YOUR_API_KEY/

# Supabase Backend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your-project-id

# Smart Contract (update after deployment)
VITE_CRYPTOLOCK_CONTRACT=0x1234567890123456789012345678901234567890
```

## 💰 APY Rates & Lock Periods

### USDC (USD Coin)
| Lock Period | APY Rate | Example Return* |
|-------------|----------|-----------------|
| 30 days     | 6.0%     | $50 → $50.25    |
| 90 days     | 8.5%     | $1000 → $1021   |
| 180 days    | 10.0%    | $5000 → $5247   |

### WETH (Wrapped Ethereum)
| Lock Period | APY Rate | Example Return* |
|-------------|----------|-----------------|
| 30 days     | 8.0%     | 1 ETH → 1.0066 ETH |
| 90 days     | 10.5%    | 5 ETH → 5.129 ETH  |
| 180 days    | 12.0%    | 10 ETH → 10.59 ETH |

*Returns calculated for full lock period

## 🏗️ Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and context
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **RainbowKit**: Beautiful wallet connection UI
- **Wagmi**: React hooks for Ethereum

### Blockchain Integration
- **Base Network**: Ethereum L2 for low fees
- **Smart Contracts**: Solidity 0.8.19 with OpenZeppelin
- **Wallet Support**: MetaMask, Coinbase Wallet, WalletConnect
- **Token Standards**: ERC-20 (USDC, WETH)

### Backend Services
- **Supabase**: PostgreSQL database and real-time subscriptions
- **RPC Providers**: Alchemy or QuickNode for blockchain data
- **Analytics**: User action tracking and protocol metrics

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── DepositForm.jsx  # Deposit creation form
│   ├── DepositCard.jsx  # Individual deposit display
│   └── ...
├── context/            # React context providers
│   └── AppContext.jsx  # Global app state
├── services/           # External service integrations
│   ├── blockchain.js   # Smart contract interactions
│   └── supabase.js     # Backend API calls
├── contracts/          # Smart contract source
│   └── CryptoLockRewards.sol
└── docs/              # Documentation
    ├── API_DOCUMENTATION.md
    └── DEPLOYMENT_GUIDE.md
```

## 🔐 Security Features

### Smart Contract Security
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Admin controls for critical functions
- **Time Locks**: Enforced lock periods with no early access

### Frontend Security
- **Input Validation**: All user inputs validated
- **Secure Connections**: HTTPS enforced
- **Non-Custodial**: No private key storage
- **Rate Limiting**: API request throttling

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

See our comprehensive [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for detailed instructions on:

- Smart contract deployment to Base
- Supabase backend setup
- Frontend deployment to Vercel/Netlify
- Environment configuration
- Post-deployment testing

## 📊 Monitoring & Analytics

The application tracks key metrics:

- **Total Value Locked (TVL)**
- **Active Deposits Count**
- **User Acquisition & Retention**
- **Average Deposit Amounts**
- **Transaction Success Rates**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 API Documentation

Detailed API documentation is available in [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md), covering:

- Smart contract functions and events
- Frontend service APIs
- Database schema and queries
- Error handling and rate limits

## 🐛 Troubleshooting

### Common Issues

**Wallet Connection Issues**
- Ensure you're on the Base network
- Check WalletConnect project ID configuration
- Try refreshing the page and reconnecting

**Transaction Failures**
- Verify sufficient token balance
- Check network congestion and gas prices
- Ensure token approval for the contract

**Loading Issues**
- Check RPC provider status
- Verify environment variables
- Check browser console for errors

## 📞 Support

- **Documentation**: Check our [docs](docs/) folder
- **Issues**: Open a [GitHub issue](https://github.com/vistara-apps/this-is-a-4587/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/vistara-apps/this-is-a-4587/discussions)

## 📈 Roadmap

### Phase 1 (Current)
- [x] Core deposit and withdrawal functionality
- [x] USDC and WETH support
- [x] Basic portfolio tracking
- [x] Subscription management

### Phase 2 (Q2 2024)
- [ ] Additional token support (USDT, DAI)
- [ ] Compound interest options
- [ ] Mobile app development
- [ ] Advanced analytics dashboard

### Phase 3 (Q3 2024)
- [ ] Cross-chain support (Ethereum, Polygon)
- [ ] Governance token launch
- [ ] Yield farming integration
- [ ] Insurance partnerships

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

CryptoLock Rewards is experimental software. While we've implemented security best practices, users should:

- Only deposit funds they can afford to lose
- Understand the risks of smart contracts
- Be aware that APY rates may change
- Consider the lock period carefully

**This is not financial advice. Always do your own research.**

---

<div align="center">

**Built with ❤️ on Base**

[Website](https://cryptolock-rewards.vercel.app) • [Documentation](docs/) • [Twitter](https://twitter.com/cryptolock) • [Discord](https://discord.gg/cryptolock)

</div>
