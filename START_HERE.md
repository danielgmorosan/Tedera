# 🚀 START HERE - TEDERA QUICK LAUNCH

## ✅ YOUR SETUP STATUS

### Already Configured:
- ✅ Hedera Account: `0.0.7156136`
- ✅ EVM Address: `0x692584c8067dd401ac59046449f5582d27aa4977`
- ✅ Environment variables set in `.env.local`
- ✅ Smart contracts compiled
- ✅ Contract artifacts ready

### What You Need:
- [ ] MongoDB running (local or Atlas)
- [ ] Testnet HBAR in your account
- [ ] MetaMask installed

---

## 🎯 FASTEST WAY TO GET RUNNING (3 STEPS)

### Step 1: Setup MongoDB (Pick One)

**Option A: Quick Local MongoDB (Docker)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Free Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Get connection string
4. Update `apps/web/.env.local`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tedera
   ```

### Step 2: Get Testnet HBAR
1. Go to https://portal.hedera.com/
2. Login and request testnet HBAR
3. You'll get ~10,000 HBAR for free

### Step 3: Start the App
```bash
npm run dev
```

**That's it!** Go to http://localhost:3000

---

## 🎬 DEMO FLOW (For Hackathon)

### 1. Import Account to MetaMask
1. Open MetaMask
2. Click account icon → "Import Account"
3. Paste private key: `0xe3d3900cb964b832efe50b08bed8b8dec9076542f1a681780c7ea9a60de1d415`
4. Click "Import"

### 2. Connect Wallet
1. Go to http://localhost:3000
2. Click "Connect Wallet"
3. Approve Hedera Testnet network addition
4. Switch to Hedera Testnet

### 3. Create Property (Deploys 3 Contracts)
1. Go to http://localhost:3000/admin
2. Fill out property form
3. Click "Create Property"
4. **Watch console** - 3 contracts deploy to Hedera testnet
5. **Show HashScan** - https://hashscan.io/testnet/account/0.0.7156136

### 4. Buy Shares (Real Blockchain Transaction)
1. Click on property
2. Enter share quantity
3. Click "Purchase"
4. Approve MetaMask transaction
5. **Show HashScan** - Transaction confirmed on blockchain

### 5. Distribute Dividends (Real Blockchain Transaction)
1. Go to /admin → "Distribute Profits"
2. Select property
3. Enter HBAR amount
4. Click "Distribute"
5. **Show HashScan** - Distribution confirmed on blockchain

---

## 🔥 KEY DEMO POINTS

**Emphasize These:**
1. ✅ **Real Smart Contracts** - Not mocked, actually deployed to Hedera testnet
2. ✅ **ERC-1400 Compliant** - Using Hedera's Asset Tokenization Studio
3. ✅ **Verifiable on Blockchain** - Every transaction visible on HashScan
4. ✅ **Decentralized Identity** - W3C-compliant DIDs for all users
5. ✅ **Production Ready** - Real code, real contracts, real transactions

**Show on HashScan:**
- Your account: https://hashscan.io/testnet/account/0.0.7156136
- Contract deployments
- Share purchase transactions
- Dividend distribution transactions

---

## 📊 WHAT GETS DEPLOYED

When you create a property, 3 contracts deploy to Hedera testnet:

### 1. Property Token (ATS ERC-1400)
- **Standard**: ERC-1400 security token
- **Features**: Voting rights, dividend rights, compliance
- **Cost**: ~5 HBAR

### 2. PropertySale Contract
- **Purpose**: Token presale for property shares
- **Function**: `buyShares(uint256 shares) payable`
- **Cost**: ~2 HBAR

### 3. DividendDistributor Contract
- **Purpose**: Distribute rental income to shareholders
- **Function**: `createDistribution() payable`
- **Cost**: ~2 HBAR

**Total**: ~10 HBAR per property

---

## 🎯 VERIFICATION

After creating a property, verify on HashScan:

1. **Go to**: https://hashscan.io/testnet/account/0.0.7156136
2. **Check**: Recent transactions show 3 contract deployments
3. **Click**: Each transaction to see contract details
4. **Copy**: Contract addresses and verify they match database

---

## 🐛 QUICK TROUBLESHOOTING

**"MongoDB connection failed"**
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Or start it
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**"Insufficient funds"**
- Get testnet HBAR from https://portal.hedera.com/
- Check balance: https://hashscan.io/testnet/account/0.0.7156136

**"Wrong network"**
- MetaMask should be on Hedera Testnet (Chain ID 296)
- App will prompt to add network automatically

**"Contract deployment failed"**
- Check you have ~10 HBAR for gas
- Check console for specific error
- Verify MetaMask is connected

---

## 📚 DOCUMENTATION

- **`SETUP_COMPLETE.md`** - Detailed setup instructions
- **`DEPLOYMENT_GUIDE.md`** - Complete deployment guide
- **`QUICK_START.md`** - Code examples and reference
- **`IMPLEMENTATION_STATUS.md`** - Full verification of requirements

---

## 🎉 YOU'RE READY!

**Your Hedera account is configured and ready to deploy!**

Just need:
1. MongoDB running
2. Testnet HBAR in account
3. `npm run dev`

**Then you can deploy real smart contracts to Hedera testnet!** 🚀

---

## 🔗 QUICK LINKS

- **Your Account**: https://hashscan.io/testnet/account/0.0.7156136
- **Get HBAR**: https://portal.hedera.com/
- **HashScan**: https://hashscan.io/testnet
- **Hedera Docs**: https://docs.hedera.com/

**Everything is ready - just start the app and go!** 🎯

