# Tedera Smart Contracts

Custom smart contracts for the Tedera property tokenization platform.

## 📋 Contracts

### PropertySale.sol
Manages presale of property tokens with HBAR payments.

**Features:**
- Buy property shares with HBAR
- Dynamic pricing
- Sale deadlines
- Refund mechanism for overpayment
- ReentrancyGuard protection
- CEI pattern implementation

### DividendDistributor.sol
Distributes rental income/dividends to token holders.

**Features:**
- Proportional dividend distribution
- Batch claim functionality
- Claimed amount tracking
- Emergency withdraw for owner
- ReentrancyGuard protection
- CEI pattern implementation

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your Hedera testnet private key:
```bash
TESTNET_PRIVATE_KEY=0x...
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy Contracts

**Option A: Deploy both contracts at once (Recommended)**

```bash
npm run deploy:all
```

This will:
- Deploy PropertySale
- Deploy DividendDistributor
- Save deployment addresses to `deployments/`
- Print HashScan links for verification

**Option B: Deploy individually**

```bash
# Deploy with placeholder token address
npm run deploy:testnet

# Deploy with specific token address
TOKEN_ADDRESS=0x... npm run deploy:token
```

## 📁 Project Structure

```
packages/contracts/
├── contracts/
│   ├── PropertySale.sol          # Presale contract
│   └── DividendDistributor.sol   # Dividend distribution
├── scripts/
│   ├── deployAll.ts              # Deploy both contracts
│   ├── deployPropertyContracts.ts
│   └── deployWithToken.ts
├── deployments/                   # Deployment info (auto-generated)
├── artifacts/                     # Compiled contracts (auto-generated)
├── package.json
├── hardhat.config.ts
└── .env                          # Your configuration
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TESTNET_PRIVATE_KEY` | Your Hedera private key | Required |
| `TESTNET_RPC_URL` | Hedera testnet RPC | `https://testnet.hashio.io/api` |
| `TOKEN_ADDRESS` | Property token address | `0x0000...` (placeholder) |
| `PRICE_PER_SHARE` | Price per share in wei | `1000000000000000000` (1 HBAR) |
| `TOTAL_SHARES` | Total shares to sell | `1000` |
| `SALE_DURATION` | Sale duration in seconds | `2592000` (30 days) |

### Example Configuration

```bash
# .env
TESTNET_PRIVATE_KEY=0x1234567890abcdef...
TOKEN_ADDRESS=0xABCDEF1234567890...
PRICE_PER_SHARE=500000000000000000  # 0.5 HBAR
TOTAL_SHARES=5000
SALE_DURATION=1209600  # 14 days
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile contracts |
| `npm run compile:force` | Force recompile all contracts |
| `npm run clean` | Clean artifacts and cache |
| `npm run test` | Run tests |
| `npm run deploy:all` | Deploy both contracts (recommended) |
| `npm run deploy:testnet` | Deploy with placeholder token |
| `npm run deploy:token` | Deploy with specific token |

## 📦 Deployment Output

After deployment, you'll find:

1. **Deployment files** in `deployments/`:
   - `deployment-testnet-latest.json` - Latest deployment
   - `deployment-testnet-{timestamp}.json` - Historical deployments

2. **Contract ABIs** in `artifacts/contracts/`:
   - `PropertySale.sol/PropertySale.json`
   - `DividendDistributor.sol/DividendDistributor.json`

## 🔗 Integration with Web App

After deployment, add the contract addresses to `apps/web/.env.local`:

```bash
NEXT_PUBLIC_PROPERTY_SALE_ADDRESS=0x...
NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS=0x...
```

Then restart the web app:
```bash
npm run dev
```

## 🧪 Testing

```bash
npm run test
```

## 🔍 Verification

After deployment, verify your contracts on HashScan:

**Testnet:**
- https://hashscan.io/testnet/contract/{address}

**Mainnet:**
- https://hashscan.io/mainnet/contract/{address}

## 🛠️ Troubleshooting

### "Insufficient funds" error
- Make sure you have HBAR in your testnet account
- Get testnet HBAR from [Hedera Portal](https://portal.hedera.com/)

### "Invalid private key" error
- Check your `TESTNET_PRIVATE_KEY` in `.env`
- Make sure it starts with `0x`

### Compilation errors
- Run `npm run clean` then `npm run compile`
- Make sure all dependencies are installed: `npm install`

## 📚 Resources

- [Hedera Documentation](https://docs.hedera.com)
- [Asset Tokenization Studio](https://github.com/hashgraph/asset-tokenization-studio)
- [HashScan Explorer](https://hashscan.io/testnet)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## 📄 License

Apache-2.0

