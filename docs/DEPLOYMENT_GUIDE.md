# Tedera Deployment Guide

Complete guide to deploy and run the Tedera platform for the Hedera hackathon.

## Prerequisites

- Node.js v18+ and npm
- MongoDB running locally or connection string
- Hedera testnet account with HBAR (get from [Hedera Portal](https://portal.hedera.com/))
- Git

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Web App

```bash
# Copy environment template
cp apps/web/.env.local.example apps/web/.env.local

# Edit the file and set:
# - MONGO_URI (your MongoDB connection string)
# - JWT_SECRET (random secret key)
```

The ATS contracts are already deployed:
- Factory: `0xcBF9225c4093a742C4A5A4152f296749Ad3490E7`
- Resolver: `0xd89bDfF4826bcBbF493e6F27ce6974F02E3d15E3`

### 3. Start Web App

```bash
npm run dev
```

Visit http://localhost:3000

**That's it!** The web app is now running with token creation functionality.

---

## Full Deployment (Optional - For PropertySale & DividendDistributor)

If you want to deploy the custom PropertySale and DividendDistributor contracts:

### 1. Configure Contracts

```bash
# Copy environment template
cp packages/contracts/.env.example packages/contracts/.env

# Edit packages/contracts/.env and set:
# - TESTNET_PRIVATE_KEY (your Hedera account private key)
```

### 2. Compile Contracts

```bash
npm run contracts:compile
```

### 3. Deploy Contracts

**Option A: Deploy with placeholder token address**

```bash
cd packages/contracts
npm run deploy:testnet
```

**Option B: Deploy with specific token address**

First, create a property token via the web app, then:

```bash
cd packages/contracts
TOKEN_ADDRESS=0x... npm run deploy:token
```

### 4. Update Web App

After deployment, add the contract addresses to `apps/web/.env.local`:

```bash
NEXT_PUBLIC_PROPERTY_SALE_ADDRESS=0x...
NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS=0x...
```

### 5. Restart Web App

```bash
npm run dev
```

---

## Project Structure

```
hedera-hackathon-sc/
├── apps/
│   └── web/                    # Next.js web application
│       ├── app/                # App router pages
│       ├── components/         # React components
│       ├── lib/                # Utilities and Hedera integration
│       └── .env.local          # Environment variables
├── packages/
│   └── contracts/              # Smart contracts
│       ├── contracts/          # Solidity files (2 files)
│       │   ├── PropertySale.sol
│       │   └── DividendDistributor.sol
│       ├── scripts/            # Deployment scripts
│       └── .env                # Contract deployment config
└── package.json                # Root workspace config
```

---

## What's Already Working

### ✅ Web Application
- User authentication (JWT + Hedera wallet)
- Property listing UI
- Portfolio dashboard
- Admin panel
- MongoDB backend

### ✅ Token Creation
- Create property tokens via ATS SDK
- ERC-1400 compliant security tokens
- Country blacklisting (compliance)
- Transfer restrictions

### ✅ Smart Contracts (Compiled)
- PropertySale.sol - Presale contract
- DividendDistributor.sol - Dividend distribution

---

## Environment Variables Reference

### Web App (`apps/web/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/hedera_asset_dev` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `NEXT_PUBLIC_HEDERA_NETWORK` | Hedera network | `testnet` |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | ATS Factory address | `0xcBF9225c4093a742C4A5A4152f296749Ad3490E7` |
| `NEXT_PUBLIC_RESOLVER_ADDRESS` | ATS Resolver address | `0xd89bDfF4826bcBbF493e6F27ce6974F02E3d15E3` |
| `NEXT_PUBLIC_PROPERTY_SALE_ADDRESS` | PropertySale contract (optional) | `0x...` |
| `NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS` | DividendDistributor contract (optional) | `0x...` |

### Contracts (`packages/contracts/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `TESTNET_PRIVATE_KEY` | Your Hedera private key | `0x...` |
| `TESTNET_RPC_URL` | Hedera testnet RPC | `https://testnet.hashio.io/api` |
| `TOKEN_ADDRESS` | Property token address | `0x...` |
| `PRICE_PER_SHARE` | Price per share in wei | `1000000000000000000` (1 HBAR) |
| `TOTAL_SHARES` | Total shares to sell | `1000` |
| `SALE_DURATION` | Sale duration in seconds | `2592000` (30 days) |

---

## Testing

### Test Token Creation

1. Start web app: `npm run dev`
2. Navigate to http://localhost:3000
3. Connect Hedera wallet
4. Create a new property
5. Token will be created on Hedera testnet

### Test Contract Deployment

```bash
cd packages/contracts
npm run compile
npm run deploy:testnet
```

Check deployment on [HashScan Testnet](https://hashscan.io/testnet)

---

## Troubleshooting

### MongoDB Connection Error

```bash
# Make sure MongoDB is running
mongod --dbpath /path/to/data
```

Or use MongoDB Atlas (cloud):
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hedera_asset_dev
```

### Hedera Wallet Not Connecting

- Make sure you have MetaMask or HashPack installed
- Switch to Hedera testnet (Chain ID: 296)
- Add Hedera testnet RPC: https://testnet.hashio.io/api

### Contract Deployment Fails

- Check you have HBAR in your testnet account
- Verify TESTNET_PRIVATE_KEY is correct
- Make sure contracts are compiled: `npm run contracts:compile`

### Web App Build Errors

```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

---

## Deployment Addresses (Testnet)

### ATS Infrastructure (Already Deployed)
- **Factory Proxy**: `0xcBF9225c4093a742C4A5A4152f296749Ad3490E7`
- **Resolver Proxy**: `0xd89bDfF4826bcBbF493e6F27ce6974F02E3d15E3`

### Custom Contracts (Deploy These)
- **PropertySale**: Deploy using `npm run deploy:testnet`
- **DividendDistributor**: Deploy using `npm run deploy:testnet`

---

## Next Steps

1. ✅ **Start Web App** - `npm run dev`
2. ✅ **Create Property Tokens** - Use the web UI
3. ⏳ **Deploy Custom Contracts** - Optional, for presale/dividends
4. ⏳ **Integrate Contracts** - Connect UI to deployed contracts
5. ⏳ **Test End-to-End** - Complete user flow

---

## Support

- Hedera Documentation: https://docs.hedera.com
- ATS SDK: https://github.com/hashgraph/asset-tokenization-studio
- HashScan Explorer: https://hashscan.io/testnet

---

## License

Apache-2.0

