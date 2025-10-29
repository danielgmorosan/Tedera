# Tedera - Decentralized RWA Marketplace

> **Hedera Hackathon Project** - Real-World Asset tokenization platform for property investments

Tedera is a decentralized marketplace for tokenized real-world assets (RWA), specifically focused on property investments. Built on Hedera using the Asset Tokenization Studio (ATS) for ERC-1400 compliant security tokens.

## 🎯 Hackathon Features

1. ✅ **Decentralized Identity** - Hedera wallet integration (MetaMask, HashPack)
2. ✅ **RWA Tokenization via ATS** - ERC-1400 compliant property tokens with compliance features
3. ✅ **Property Listing Smart Contract** - PropertySale.sol for presale management
4. ✅ **On-Chain Dividend Distribution** - DividendDistributor.sol for rental income distribution

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure web app
cp apps/web/.env.local.example apps/web/.env.local
# Edit apps/web/.env.local and set MONGO_URI and JWT_SECRET

# 3. Start the app
npm run dev

# 4. Open browser
# Visit http://localhost:3000
```

**See [QUICK_START.md](docs/QUICK_START.md) for detailed instructions.**

## 📁 Project Structure

```
hedera-hackathon-sc/
├── apps/
│   └── web/                    # Next.js web application
│       ├── app/                # App router pages
│       ├── components/         # React components
│       ├── lib/                # Hedera integration & utilities
│       └── models/             # MongoDB models
├── packages/
│   └── contracts/              # Smart contracts (2 files)
│       ├── contracts/
│       │   ├── PropertySale.sol
│       │   └── DividendDistributor.sol
│       └── scripts/            # Deployment scripts
├── QUICK_START.md              # 5-minute setup guide
├── DEPLOYMENT_GUIDE.md         # Complete deployment guide
├── REFACTOR_SUMMARY.md         # Refactor documentation
└── PROGRESS_LOG.md             # Development progress
```

## 🎨 Features

### Web Application
- **User Authentication** - JWT + Hedera wallet integration
- **Property Marketplace** - Browse and invest in tokenized properties
- **Portfolio Dashboard** - Track investments and earnings
- **Admin Panel** - Property management and distribution creation
- **Token Creation** - Create property tokens via ATS SDK

### Smart Contracts
- **PropertySale.sol** - Presale contract with HBAR payments
  - Dynamic pricing
  - Sale deadlines
  - Refund mechanism
  - ReentrancyGuard protection

- **DividendDistributor.sol** - Dividend distribution contract
  - Proportional distribution
  - Batch claim functionality
  - Claimed amount tracking
  - Emergency withdraw

## 🛠️ Technology Stack

- **Blockchain**: Hedera Hashgraph
- **Token Standard**: ERC-1400 (via ATS)
- **Smart Contracts**: Solidity 0.8.18
- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB
- **Development**: Hardhat, ethers.js v5

## 📊 Current Status

### ✅ Complete
- Web application with full UI
- User authentication system
- Property token creation (via ATS SDK)
- MongoDB backend
- Smart contracts (compiled and ready)
- Deployment scripts
- Documentation

### 🎯 Ready for Demo
- Token creation flow
- Portfolio tracking
- Admin dashboard
- Contract deployment

## 🔧 Available Scripts

```bash
# Development
npm run dev                    # Start web app
npm run build                  # Build everything
npm run clean                  # Clean build artifacts

# Contracts
npm run contracts:compile      # Compile smart contracts
npm run contracts:deploy       # Deploy to Hedera testnet
npm run contracts:clean        # Clean contract artifacts

# Web App
npm run web:dev                # Start web app
npm run web:build              # Build web app
npm run web:clean              # Clean web app build
```

## 📚 Documentation

- **[QUICK_START.md](docs/QUICK_START.md)** - Get started in 5 minutes
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[REFACTOR_SUMMARY.md](docs/REFACTOR_SUMMARY.md)** - Codebase refactor details
- **[PROGRESS_LOG.md](./PROGRESS_LOG.md)** - Development progress log
- **[packages/contracts/README.md](./packages/contracts/README.md)** - Smart contracts documentation

## 🌐 Deployed Contracts (Testnet)

### ATS Infrastructure (Already Deployed)
- **Factory**: `0xcBF9225c4093a742C4A5A4152f296749Ad3490E7`
- **Resolver**: `0xd89bDfF4826bcBbF493e6F27ce6974F02E3d15E3`

### Custom Contracts (Deploy These)
- **PropertySale**: Deploy using `npm run contracts:deploy`
- **DividendDistributor**: Deploy using `npm run contracts:deploy`

## 🔗 Resources

- **Hedera Documentation**: https://docs.hedera.com
- **Asset Tokenization Studio**: https://github.com/hashgraph/asset-tokenization-studio
- **HashScan Explorer**: https://hashscan.io/testnet
- **Hedera Portal**: https://portal.hedera.com

## 🏗️ Architecture

### Token Creation Flow
1. User connects Hedera wallet
2. User fills property details in web UI
3. Web app calls ATS SDK to create ERC-1400 token
4. Token is deployed to Hedera testnet
5. Token address saved to MongoDB

### Presale Flow (PropertySale.sol)
1. Property owner deploys PropertySale contract
2. Transfers property tokens to contract
3. Investors buy shares with HBAR
4. Contract transfers tokens to investors
5. HBAR collected by property owner

### Dividend Flow (DividendDistributor.sol)
1. Property manager creates distribution
2. Deposits HBAR to DividendDistributor
3. Token holders claim proportional dividends
4. Contract tracks claimed amounts

## 🧪 Testing

```bash
# Test web app
cd apps/web
npm run test

# Test contracts
cd packages/contracts
npm run test
```

## 📝 Workspace Management

This repo uses **npm workspaces** for monorepo management.

### Adding Dependencies
```bash
# Add to web app
npm install --workspace apps/web <package-name>

# Add to contracts
npm install --workspace packages/contracts <package-name>
```

### Running Workspace Scripts
```bash
# From root
npm run dev --workspace apps/web

# Or use shortcuts
npm run web:dev
npm run contracts:compile
```

## 🎯 Hackathon Submission Checklist

- [x] Decentralized identity integration
- [x] RWA tokenization via ATS
- [x] Property listing smart contract
- [x] On-chain dividend distribution
- [x] Working web application
- [x] Documentation
- [ ] Demo video
- [ ] Pitch deck

## 📄 License

Apache-2.0

## 🙏 Acknowledgments

- Hedera Hashgraph team for the Asset Tokenization Studio
- OpenZeppelin for secure smart contract libraries
- The Hedera developer community

---

**Built for the Hedera Hackathon** 🚀
