# 🚀 TEDERA - COMPLETE DEPLOYMENT GUIDE

## ✅ VERIFICATION: CONTRACTS ARE CONNECTED TO FRONTEND

### PropertySale Contract Integration
**File**: `apps/web/hooks/use-property-purchase.ts`
- ✅ Calls `buyShares(shares)` on PropertySale contract
- ✅ Checks `saleActive()` before purchase
- ✅ Validates available shares
- ✅ Sends HBAR payment with transaction
- ✅ Returns transaction hash

**Frontend Component**: `apps/web/components/buy-panel.tsx`
- ✅ Uses `usePropertyPurchase()` hook
- ✅ Passes `saleContractAddress` from property
- ✅ Saves transaction hash to database
- ✅ Shows success/error states

### DividendDistributor Contract Integration
**File**: `apps/web/hooks/use-dividend-distribution.ts`
- ✅ Calls `createDistribution()` on DividendDistributor contract
- ✅ Sends HBAR payment for distribution
- ✅ Returns transaction hash
- ✅ Includes `claimDividend()` function for shareholders

**Frontend Component**: `apps/web/components/profit-distribution-panel.tsx`
- ✅ Uses `useDividendDistribution()` hook
- ✅ Fetches properties from database
- ✅ Passes `dividendContractAddress` from property
- ✅ Saves transaction hash to database
- ✅ Shows success/error states

---

## 📋 PREREQUISITES

### 1. MetaMask Wallet
- Install MetaMask browser extension
- Create or import a wallet
- **IMPORTANT**: Save your seed phrase securely!

### 2. Get Hedera Testnet HBAR
**Option A: Hedera Faucet**
1. Go to https://portal.hedera.com/
2. Create a free account
3. Go to "Testnet Access"
4. Get your testnet account ID (format: 0.0.xxxxx)
5. Fund your account with testnet HBAR

**Option B: HashPack Wallet**
1. Install HashPack extension
2. Create wallet
3. Switch to testnet
4. Use built-in faucet

### 3. Connect MetaMask to Hedera Testnet
The app will automatically add Hedera testnet to MetaMask, but you can add it manually:

**Network Details:**
- Network Name: `Hedera Testnet`
- RPC URL: `https://testnet.hashio.io/api`
- Chain ID: `296` (hex: `0x128`)
- Currency Symbol: `HBAR`
- Block Explorer: `https://hashscan.io/testnet`

---

## 🏗️ STEP-BY-STEP DEPLOYMENT TO TESTNET

### STEP 1: Environment Setup

1. **Create `.env.local` file** in `apps/web/`:
```bash
cd apps/web
cp .env.example .env.local
```

2. **Edit `.env.local`** with these values:
```env
# MongoDB (use MongoDB Atlas free tier)
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/tedera?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Hedera Network Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
NEXT_PUBLIC_HEDERA_OPERATOR_KEY=your-private-key-here

# Hedera Asset Tokenization Studio Addresses (TESTNET)
NEXT_PUBLIC_FACTORY_ADDRESS=0xcBF9225c4093a742C4A5A4152f296749Ad3490E7
NEXT_PUBLIC_RESOLVER_ADDRESS=0xd89bDfF4826bcBbF493e6F27ce6974F02E3d15E3

# Optional: File Upload (use Cloudinary or similar)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### STEP 2: MongoDB Setup (Free)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Paste into `MONGODB_URI` in `.env.local`

### STEP 3: Install Dependencies

```bash
# From project root
npm install

# Install Hedera SDK dependencies
cd apps/web
npm install @hashgraph/sdk @hashgraph/asset-tokenization-sdk ethers@5
```

### STEP 4: Compile Smart Contracts

```bash
# From project root
cd packages/contracts
npx hardhat compile

# Copy artifacts to web app
mkdir -p ../../apps/web/lib/contracts
cp artifacts/contracts/PropertySale.sol/PropertySale.json ../../apps/web/lib/contracts/
cp artifacts/contracts/DividendDistributor.sol/DividendDistributor.json ../../apps/web/lib/contracts/
```

### STEP 5: Start the Application

```bash
# From project root
npm run dev
```

The app will start on http://localhost:3000 (or 3001 if 3000 is in use)

---

## 🎯 USING THE APP ON TESTNET

### STEP 1: Connect Wallet

1. Go to http://localhost:3000
2. Click "Connect Wallet" in the top right
3. MetaMask will prompt you to:
   - Connect your account
   - Add Hedera Testnet network (if not already added)
   - Switch to Hedera Testnet
4. Approve all prompts

### STEP 2: Create a Property (Admin)

1. Go to http://localhost:3000/admin
2. Click "Create New Property" tab
3. Fill out the form:
   - **Title**: "Solar Farm Texas"
   - **Location**: "Austin, TX"
   - **Type**: Solar
   - **Description**: "100MW solar farm generating clean energy"
   - **Total Value**: 5000000 (5 million)
   - **Total Shares**: 10000
   - **Expected Yield**: 8.5
   - **Sustainability Score**: 95

4. Click "Create Property"

5. **Watch the console** for deployment progress:
```
Deploying Hedera smart contracts...
Token deployed: { evmTokenAddress: '0x...', transactionId: '...' }
Sale contract deployed: 0x...
Dividend distributor deployed: 0x...
Property created successfully!
```

6. **Verify on HashScan**:
   - Copy each contract address
   - Go to https://hashscan.io/testnet/contract/{address}
   - Confirm contracts are deployed

### STEP 3: Buy Property Shares

1. Go to http://localhost:3000
2. Click on the property you just created
3. In the "Buy Panel" on the right:
   - Enter number of shares (e.g., 100)
   - Click "Purchase"
4. MetaMask will prompt for transaction approval
5. Confirm the transaction
6. Wait for success message with transaction hash
7. **Verify on HashScan**: https://hashscan.io/testnet/transaction/{txHash}

### STEP 4: Distribute Dividends

1. Go to http://localhost:3000/admin
2. Click "Distribute Profits" tab
3. Select the property
4. Enter HBAR amount (e.g., 100)
5. Click "Distribute Profits"
6. MetaMask will prompt for transaction approval
7. Confirm the transaction
8. Wait for success message
9. **Verify on HashScan**: Check the transaction

### STEP 5: Claim Dividends (Shareholders)

**Note**: The UI for claiming is not yet built, but the contract function exists.

To claim dividends, shareholders can:
1. Use the `claimDividend(distributionId)` function
2. Or wait for the claiming UI to be added

---

## 🔍 VERIFICATION CHECKLIST

After deploying, verify everything works:

- [ ] MetaMask connects to Hedera Testnet
- [ ] Property creation deploys 3 contracts
- [ ] All 3 contract addresses are saved to database
- [ ] Contracts are visible on HashScan
- [ ] Share purchase calls PropertySale.buyShares()
- [ ] Purchase transaction appears on HashScan
- [ ] Dividend distribution calls DividendDistributor.createDistribution()
- [ ] Distribution transaction appears on HashScan
- [ ] Transaction hashes are saved to database

---

## 🐛 TROUBLESHOOTING

### Issue: "MetaMask not detected"
**Solution**: Install MetaMask browser extension

### Issue: "Insufficient funds"
**Solution**: Get testnet HBAR from Hedera portal or HashPack faucet

### Issue: "Wrong network"
**Solution**: Switch to Hedera Testnet in MetaMask (Chain ID 296)

### Issue: "Contract deployment failed"
**Solution**: 
- Check you have enough testnet HBAR (need ~10 HBAR for gas)
- Check console for specific error
- Verify `.env.local` has correct values

### Issue: "Transaction failed"
**Solution**:
- Check contract addresses are correct
- Verify sale is active (PropertySale.saleActive = true)
- Check you have enough HBAR for purchase
- Look at error message in MetaMask

### Issue: "Database connection failed"
**Solution**:
- Verify MongoDB URI is correct
- Check MongoDB Atlas allows connections from your IP
- Ensure database user has read/write permissions

---

## 📊 CONTRACT ADDRESSES ON TESTNET

After deployment, your contracts will be at addresses like:

**Factory Contract (ATS)**: `0xcBF9225c4093a742C4A5A4152f296749Ad3490E7`
**Resolver Contract (ATS)**: `0xd89bDfF4826bcBbF493e6F27ce6974F02E3d15E3`

**Your Deployed Contracts** (will be different each time):
- **Property Token (ATS)**: `0x...` (from Equity.create())
- **PropertySale**: `0x...` (from deployPropertySale())
- **DividendDistributor**: `0x...` (from deployDividendDistributor())

All addresses are saved to the database and can be viewed in the property details.

---

## 🎉 SUCCESS!

If you've completed all steps, you now have:

1. ✅ A fully functional RWA marketplace on Hedera Testnet
2. ✅ ERC-1400 compliant security tokens via ATS
3. ✅ Working PropertySale contracts for share purchases
4. ✅ Working DividendDistributor contracts for profit sharing
5. ✅ Decentralized Identity (DID) for all users
6. ✅ All transactions verifiable on HashScan

**Ready for hackathon demo!** 🚀

