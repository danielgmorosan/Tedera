# Tedera - Quick Start Guide

Get the Tedera platform running in **5 minutes** for the Hedera hackathon demo.

## 🎯 What You'll Get

- ✅ Web app running on http://localhost:3000
- ✅ Property token creation (via ATS SDK)
- ✅ User authentication
- ✅ Portfolio dashboard
- ✅ Admin panel

## 📋 Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- 5 minutes of your time

## 🚀 Steps

### 1. Install Dependencies (2 min)

```bash
npm install
```

### 2. Configure Web App (1 min)

```bash
# Copy environment template
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```bash
# Required: Set your MongoDB connection
MONGO_URI=mongodb://localhost:27017/hedera_asset_dev

# Required: Set a secret key (any random string)
JWT_SECRET=my-super-secret-key-12345

# Already configured (no changes needed):
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_FACTORY_ADDRESS=0xcBF9225c4093a742C4A5A4152f296749Ad3490E7
NEXT_PUBLIC_RESOLVER_ADDRESS=0xd89bDfF4826bcBbF493e6F27ce6974F02E3d15E3
```

### 3. Start the App (1 min)

```bash
npm run dev
```

### 4. Open Browser (1 min)

Visit: **http://localhost:3000**

**That's it!** 🎉

---

## 🎮 What You Can Do Now

### Create Property Tokens
1. Connect your Hedera wallet (MetaMask or HashPack)
2. Navigate to "Create Property"
3. Fill in property details
4. Click "Create Token"
5. Token is created on Hedera testnet via ATS SDK

### View Portfolio
- See your property investments
- Track token holdings
- View distribution history

### Admin Features
- Manage properties
- Create distributions
- View analytics

---

## 🔧 Optional: Deploy Custom Contracts

If you want to deploy PropertySale and DividendDistributor contracts:

### 1. Configure Contracts

```bash
cp packages/contracts/.env.example packages/contracts/.env
```

Edit `packages/contracts/.env`:
```bash
TESTNET_PRIVATE_KEY=0x...  # Your Hedera private key
```

### 2. Deploy

```bash
cd packages/contracts
npm run deploy:all
```

### 3. Update Web App

Add the deployed addresses to `apps/web/.env.local`:
```bash
NEXT_PUBLIC_PROPERTY_SALE_ADDRESS=0x...
NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS=0x...
```

### 4. Restart

```bash
npm run dev
```

---

## 📊 Project Status

### ✅ What's Working
- Web application with full UI
- User authentication (JWT + Hedera wallet)
- Property token creation via ATS SDK
- MongoDB backend
- Portfolio tracking
- Admin dashboard

### ✅ What's Ready to Deploy
- PropertySale.sol (compiled)
- DividendDistributor.sol (compiled)
- Deployment scripts

### 🎯 Hackathon Requirements
1. ✅ **Decentralized Identity** - Hedera wallet connection
2. ✅ **RWA Tokenization via ATS** - Working via SDK
3. ✅ **Property Listing Smart Contract** - Ready to deploy
4. ✅ **On-Chain Dividend Distribution** - Ready to deploy

---

## 🆘 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB locally
mongod --dbpath /path/to/data

# Or use MongoDB Atlas (cloud)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/hedera_asset_dev
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Wallet Not Connecting
- Install MetaMask or HashPack
- Switch to Hedera testnet (Chain ID: 296)
- Add RPC: https://testnet.hashio.io/api

---

## 📚 More Information

- **Full Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Refactor Summary**: See [REFACTOR_SUMMARY.md](docs/REFACTOR_SUMMARY.md)
- **Progress Log**: See [PROGRESS_LOG.md](./PROGRESS_LOG.md)
- **Contracts README**: See [packages/contracts/README.md](./packages/contracts/README.md)

---

## 🎯 Next Steps for Hackathon

1. ✅ **Demo the Web App** - Show token creation
2. ⏳ **Deploy Contracts** - Optional, for presale/dividends
3. ⏳ **Record Demo Video** - Show end-to-end flow
4. ⏳ **Prepare Pitch** - Highlight ATS integration

---

## 📞 Support

- Hedera Docs: https://docs.hedera.com
- ATS GitHub: https://github.com/hashgraph/asset-tokenization-studio
- HashScan: https://hashscan.io/testnet

---

**Good luck with the hackathon!** 🚀

