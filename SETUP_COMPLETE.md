# ✅ YOUR HEDERA ACCOUNT IS CONFIGURED!

## 🎯 Your Hedera Testnet Credentials

**Account ID**: `0.0.7156136`  
**EVM Address**: `0x692584c8067dd401ac59046449f5582d27aa4977`  
**Private Key**: `0xe3d3900cb964b832efe50b08bed8b8dec9076542f1a681780c7ea9a60de1d415`

✅ **These have been added to `apps/web/.env.local`**

---

## 🚀 NEXT STEPS TO GET RUNNING

### Step 1: Setup MongoDB (Choose One Option)

#### Option A: Use MongoDB Atlas (Recommended - Free & Easy)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Update `apps/web/.env.local`:
   ```env
   MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/tedera?retryWrites=true&w=majority
   ```

#### Option B: Use Local MongoDB (If you have it installed)
The current setting should work:
```env
MONGO_URI=mongodb://localhost:27017/hedera_asset_dev
```

To check if MongoDB is running locally:
```bash
mongosh --eval "db.version()"
```

If not installed, install with:
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

### Step 2: Compile Smart Contracts

```bash
cd packages/contracts
npx hardhat compile

# Copy artifacts to web app
mkdir -p ../../apps/web/lib/contracts
cp artifacts/contracts/PropertySale.sol/PropertySale.json ../../apps/web/lib/contracts/
cp artifacts/contracts/DividendDistributor.sol/DividendDistributor.json ../../apps/web/lib/contracts/

cd ../..
```

---

### Step 3: Start the Application

```bash
npm run dev
```

The app will start on http://localhost:3000 (or 3001 if 3000 is in use)

---

### Step 4: Connect Your Wallet

1. Install MetaMask if you haven't already
2. Go to http://localhost:3000
3. Click "Connect Wallet"
4. MetaMask will prompt you to:
   - Add Hedera Testnet network
   - Switch to Hedera Testnet
5. Approve all prompts

**Import Your Account to MetaMask:**
1. Click MetaMask extension
2. Click account icon → "Import Account"
3. Select "Private Key"
4. Paste: `0xe3d3900cb964b832efe50b08bed8b8dec9076542f1a681780c7ea9a60de1d415`
5. Click "Import"

---

### Step 5: Get Testnet HBAR

You need testnet HBAR to deploy contracts and make transactions.

**Option A: Hedera Portal Faucet**
1. Go to https://portal.hedera.com/
2. Login with your account
3. Go to "Testnet" section
4. Request testnet HBAR (you can get ~10,000 HBAR for free)

**Option B: HashPack Wallet Faucet**
1. Install HashPack extension
2. Import your account using the private key
3. Switch to testnet
4. Use built-in faucet

**Check Your Balance:**
- Go to https://hashscan.io/testnet/account/0.0.7156136
- You should see your HBAR balance

---

### Step 6: Create Your First Property

1. Go to http://localhost:3000/admin
2. Click "Create New Property" tab
3. Fill out the form:
   - **Title**: "Solar Farm Texas"
   - **Location**: "Austin, TX"
   - **Type**: Solar
   - **Description**: "100MW solar farm generating clean energy"
   - **Total Value**: 5000000
   - **Total Shares**: 10000
   - **Price Per Share**: 500
   - **Expected Yield**: 8.5
   - **Sustainability Score**: 95

4. Click "Create Property"

5. **Watch the console** - you'll see:
   ```
   Deploying property token...
   Token deployed: { evmTokenAddress: '0x...', transactionId: '...' }
   Deploying PropertySale contract...
   PropertySale deployed to: 0x...
   Deploying DividendDistributor contract...
   DividendDistributor deployed to: 0x...
   Property created successfully!
   ```

6. **Verify on HashScan**:
   - Go to https://hashscan.io/testnet
   - Search for your account: `0.0.7156136`
   - You'll see all 3 contract deployments

---

### Step 7: Buy Shares

1. Go to http://localhost:3000
2. Click on the property you just created
3. In the "Buy Panel" on the right:
   - Enter number of shares (e.g., 100)
   - Click "Purchase"
4. MetaMask will prompt for transaction approval
5. Confirm the transaction
6. Wait for success message
7. **Verify**: https://hashscan.io/testnet/account/0.0.7156136

---

### Step 8: Distribute Dividends

1. Go to http://localhost:3000/admin
2. Click "Distribute Profits" tab
3. Select the property
4. Enter HBAR amount (e.g., 100)
5. Click "Distribute Profits"
6. MetaMask will prompt for approval
7. Confirm the transaction
8. **Verify**: Check transaction on HashScan

---

## 🔍 VERIFICATION CHECKLIST

After setup, verify everything works:

- [ ] MongoDB is running (Atlas or local)
- [ ] Contracts are compiled
- [ ] Artifacts are copied to `apps/web/lib/contracts/`
- [ ] Dev server starts without errors
- [ ] MetaMask connects to Hedera Testnet
- [ ] You have testnet HBAR in your account
- [ ] Property creation deploys 3 contracts
- [ ] All 3 contract addresses are saved to database
- [ ] Contracts are visible on HashScan
- [ ] Share purchase works
- [ ] Dividend distribution works

---

## 🐛 TROUBLESHOOTING

### "MongoDB connection failed"
**Solution**: 
- If using Atlas: Check connection string is correct
- If using local: Make sure MongoDB is running (`brew services start mongodb-community`)

### "Insufficient funds"
**Solution**: Get more testnet HBAR from portal.hedera.com

### "Contract deployment failed"
**Solution**: 
- Check you have enough HBAR (~10 HBAR needed for all 3 contracts)
- Check MetaMask is on Hedera Testnet (Chain ID 296)
- Check console for specific error

### "Artifacts not found"
**Solution**: 
```bash
cd packages/contracts
npx hardhat compile
mkdir -p ../../apps/web/lib/contracts
cp artifacts/contracts/PropertySale.sol/PropertySale.json ../../apps/web/lib/contracts/
cp artifacts/contracts/DividendDistributor.sol/DividendDistributor.json ../../apps/web/lib/contracts/
```

---

## 📊 WHAT HAPPENS WHEN YOU CREATE A PROPERTY

1. **Deploy Property Token** (ATS ERC-1400)
   - Cost: ~5 HBAR
   - Returns: Token address

2. **Deploy PropertySale Contract**
   - Cost: ~2 HBAR
   - Returns: Sale contract address

3. **Deploy DividendDistributor Contract**
   - Cost: ~2 HBAR
   - Returns: Dividend contract address

4. **Save to Database**
   - All 3 addresses stored in MongoDB
   - Property is now live and tradeable

**Total Cost**: ~10 HBAR + gas fees

---

## 🎉 YOU'RE READY!

Once you complete these steps, you'll have:

✅ Fully functional RWA marketplace on Hedera Testnet  
✅ ERC-1400 compliant security tokens  
✅ Working PropertySale contracts  
✅ Working DividendDistributor contracts  
✅ Decentralized Identity for all users  
✅ All transactions verifiable on HashScan  

**Ready for hackathon demo!** 🚀

---

## 📚 USEFUL LINKS

- **Your Account on HashScan**: https://hashscan.io/testnet/account/0.0.7156136
- **Hedera Portal**: https://portal.hedera.com/
- **HashScan Explorer**: https://hashscan.io/testnet
- **Hedera Docs**: https://docs.hedera.com/
- **MetaMask**: https://metamask.io/

---

## 🆘 NEED HELP?

Check these files:
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `QUICK_START.md` - Quick reference and examples
- `IMPLEMENTATION_STATUS.md` - Full verification of requirements

**Everything is configured and ready to go!** 🎯

