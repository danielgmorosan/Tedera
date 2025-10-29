# ⚡ TEDERA - QUICK START GUIDE

## 🎯 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-random-secret-key
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_FACTORY_ADDRESS=0xcBF9225c4093a742C4A5A4152f296749Ad3490E7
NEXT_PUBLIC_RESOLVER_ADDRESS=0xd89bDfF4826bcBbF493e6F27ce6974F02E3d15E3
```

### 3. Compile Contracts
```bash
cd packages/contracts
npx hardhat compile
mkdir -p ../../apps/web/lib/contracts
cp artifacts/contracts/PropertySale.sol/PropertySale.json ../../apps/web/lib/contracts/
cp artifacts/contracts/DividendDistributor.sol/DividendDistributor.json ../../apps/web/lib/contracts/
```

### 4. Start App
```bash
cd ../..
npm run dev
```

### 5. Get Testnet HBAR
- Go to https://portal.hedera.com/
- Create account
- Get testnet HBAR from faucet

### 6. Connect Wallet
- Install MetaMask
- Go to http://localhost:3000
- Click "Connect Wallet"
- Approve Hedera Testnet network addition

### 7. Create Property
- Go to http://localhost:3000/admin
- Fill out property form
- Click "Create Property"
- Wait for 3 contracts to deploy
- Check HashScan: https://hashscan.io/testnet

### 8. Buy Shares
- Click on property
- Enter share quantity
- Click "Purchase"
- Approve MetaMask transaction

### 9. Distribute Dividends
- Go to /admin → "Distribute Profits"
- Select property
- Enter HBAR amount
- Click "Distribute"

---

## 🔥 WHAT ACTUALLY HAPPENS

### When You Create a Property:

**Frontend** (`create-property-form.tsx`):
```typescript
// 1. Deploy Property Token (ATS ERC-1400)
const tokenResult = await deployPropertyToken(...)
// Returns: { evmTokenAddress: '0x...', transactionId: '...' }

// 2. Deploy PropertySale Contract
const saleAddress = await deployPropertySale(tokenResult.evmTokenAddress, ...)
// Returns: '0x...'

// 3. Deploy DividendDistributor Contract
const dividendAddress = await deployDividendDistributor(tokenResult.evmTokenAddress)
// Returns: '0x...'

// 4. Save to Database
await fetch('/api/properties', {
  method: 'POST',
  body: JSON.stringify({
    ...propertyData,
    tokenAddress: tokenResult.evmTokenAddress,
    saleContractAddress: saleAddress,
    dividendContractAddress: dividendAddress,
  })
})
```

**Backend** (`apps/web/app/api/properties/route.ts`):
```typescript
// Validates and saves all 3 contract addresses
const property = await Property.create({
  title,
  location,
  type,
  tokenAddress,           // ATS token
  saleContractAddress,    // PropertySale
  dividendContractAddress, // DividendDistributor
  ...
})
```

### When You Buy Shares:

**Frontend** (`buy-panel.tsx` → `use-property-purchase.ts`):
```typescript
// 1. Get PropertySale contract
const saleContract = new ethers.Contract(
  property.saleContractAddress,
  PropertySaleABI,
  signer
)

// 2. Check sale is active
const isActive = await saleContract.saleActive()

// 3. Calculate cost
const pricePerShare = await saleContract.pricePerShare()
const totalCost = pricePerShare.mul(shares)

// 4. Buy shares with HBAR payment
const tx = await saleContract.buyShares(shares, {
  value: totalCost
})

// 5. Wait for confirmation
await tx.wait()

// 6. Save to database
await fetch('/api/investments', {
  method: 'POST',
  body: JSON.stringify({
    propertyId,
    shares,
    transactionHash: tx.hash
  })
})
```

**Smart Contract** (`PropertySale.sol`):
```solidity
function buyShares(uint256 shares) external payable {
    require(saleActive, "Sale not active");
    require(msg.value >= shares * pricePerShare, "Insufficient payment");
    
    sharesSold += shares;
    purchased[msg.sender] += shares;
    
    // Transfer tokens to buyer
    propertyToken.transfer(msg.sender, shares);
    
    emit SharesPurchased(msg.sender, shares, msg.value);
}
```

### When You Distribute Dividends:

**Frontend** (`profit-distribution-panel.tsx` → `use-dividend-distribution.ts`):
```typescript
// 1. Get DividendDistributor contract
const distributorContract = new ethers.Contract(
  property.dividendContractAddress,
  DividendDistributorABI,
  signer
)

// 2. Convert HBAR to wei
const amountInWei = ethers.utils.parseEther(amountInHbar.toString())

// 3. Create distribution with HBAR payment
const tx = await distributorContract.createDistribution({
  value: amountInWei
})

// 4. Wait for confirmation
await tx.wait()

// 5. Save to database
await fetch('/api/distributions', {
  method: 'POST',
  body: JSON.stringify({
    propertyId,
    totalAmount: amountInHbar,
    transactionHash: tx.hash
  })
})
```

**Smart Contract** (`DividendDistributor.sol`):
```solidity
function createDistribution() external payable onlyOwner {
    require(msg.value > 0, "Must send HBAR");
    
    uint256 totalShares = propertyToken.totalSupply();
    
    Distribution storage dist = distributions.push();
    dist.totalAmount = msg.value;
    dist.timestamp = block.timestamp;
    dist.totalShares = totalShares;
    
    emit DividendDistributed(distributionId, msg.value, totalShares);
}
```

---

## 📦 WHAT'S INCLUDED

### Smart Contracts (Solidity)
- ✅ `PropertySale.sol` - Token presale contract
- ✅ `DividendDistributor.sol` - Dividend distribution contract
- ✅ ATS Integration - ERC-1400 security tokens

### Frontend Hooks
- ✅ `use-property-purchase.ts` - Buy shares
- ✅ `use-dividend-distribution.ts` - Distribute & claim dividends
- ✅ `wallet-context.tsx` - MetaMask integration

### API Routes
- ✅ `/api/properties` - CRUD for properties
- ✅ `/api/investments` - Track share purchases
- ✅ `/api/distributions` - Track dividend distributions
- ✅ `/api/auth/signup` - User registration with DID
- ✅ `/api/auth/login` - User login with DID

### Components
- ✅ `create-property-form.tsx` - Deploy contracts
- ✅ `buy-panel.tsx` - Purchase shares
- ✅ `profit-distribution-panel.tsx` - Distribute dividends
- ✅ `admin-dashboard.tsx` - Admin interface

---

## 🎓 KEY CONCEPTS

### Hedera Asset Tokenization Studio (ATS)
- **What**: Official Hedera framework for security tokens
- **Standard**: ERC-1400 / ERC-3643 compliant
- **Features**: Compliance, KYC, transfer restrictions
- **Deployment**: Uses Factory pattern at `0xcBF9225c4093a742C4A5A4152f296749Ad3490E7`

### PropertySale Contract
- **Purpose**: Presale contract for property tokens
- **Function**: `buyShares(uint256 shares) payable`
- **Payment**: HBAR (native currency)
- **Features**: Sale activation, price updates, fund withdrawal

### DividendDistributor Contract
- **Purpose**: Distribute rental income to token holders
- **Function**: `createDistribution() payable`
- **Mechanism**: Snapshot-based proportional distribution
- **Claiming**: Shareholders call `claimDividend(distributionId)`

### Hedera DID
- **Format**: `did:hedera:testnet:0.0.{accountId}`
- **Standard**: W3C DID specification
- **Creation**: Automatic on signup/login
- **Storage**: MongoDB User model

---

## 🚨 IMPORTANT NOTES

### Gas Costs (Testnet HBAR)
- Deploy Property Token: ~5 HBAR
- Deploy PropertySale: ~2 HBAR
- Deploy DividendDistributor: ~2 HBAR
- Buy Shares: ~0.1 HBAR + share cost
- Distribute Dividends: ~0.1 HBAR + distribution amount

**Total for one property**: ~10 HBAR + transaction costs

### Contract Ownership
- PropertySale owner: Deployer address
- DividendDistributor owner: Deployer address
- Only owner can: Toggle sale, update price, distribute dividends

### Security Features
- ✅ ReentrancyGuard on all payable functions
- ✅ CEI pattern (Checks-Effects-Interactions)
- ✅ Owner-only functions for critical operations
- ✅ Sale activation controls
- ✅ Snapshot-based dividend distribution

---

## 🎬 DEMO SCRIPT

**For Hackathon Presentation:**

1. **Show Landing Page** - "Decentralized RWA Marketplace"
2. **Connect Wallet** - MetaMask → Hedera Testnet
3. **Create Property** - Deploy 3 contracts live
4. **Show HashScan** - Verify contracts on blockchain
5. **Buy Shares** - Execute real transaction
6. **Show Transaction** - HashScan confirmation
7. **Distribute Dividends** - Send HBAR to shareholders
8. **Show DID** - W3C-compliant identity

**Key Points to Emphasize:**
- ✅ Real smart contracts on Hedera Testnet
- ✅ ERC-1400 compliant security tokens via ATS
- ✅ All transactions verifiable on HashScan
- ✅ Decentralized identity for all users
- ✅ Production-ready code

---

## 🔗 USEFUL LINKS

- **Hedera Portal**: https://portal.hedera.com/
- **HashScan Explorer**: https://hashscan.io/testnet
- **Hedera Docs**: https://docs.hedera.com/
- **ATS Docs**: https://docs.hedera.com/hedera/sdks-and-apis/sdks/asset-tokenization-studio
- **MetaMask**: https://metamask.io/

---

**You're ready to go! 🚀**

