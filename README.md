# Tedera - Decentralized RWA Marketplace

Tedera is a decentralized marketplace for tokenized real-world assets (RWA), specifically focused on property investments. Built on Hedera using the Asset Tokenization Studio (ATS) for ERC-1400 compliant security tokens.

# Tedera

A decentralized marketplace for tokenizing real estate properties. Basically, you can buy fractional shares of properties on the blockchain and get paid dividends. Built on Hedera because we needed fast, cheap transactions and proper tokenization tools.

> Originally built for a Hedera hackathon, but hey, it works! 

## What it does

Think of it like this: instead of buying a whole building, you can buy tokens that represent shares of that building. When the building makes money (rent, etc.), you get dividends proportional to how many tokens you own.

**The main features:**
- Create and deploy property tokens using Hedera's Asset Tokenization Studio (ATS)
- Buy/sell shares on the marketplace
- Automatic dividend distribution (profits get split among token holders)
- Portfolio tracking to see all your investments in one place
- Admin dashboard for property creators to manage everything

We're using ERC-1400 compliant tokens, so it should work with standard tools and be regulatory-friendly.

## Tech stack

**Frontend:**
- Next.js 15 + React 18 (App Router)
- TypeScript (because JavaScript hurts my soul)
- Tailwind CSS + shadcn/ui components (looks decent without too much work)
- Recharts for those nice-looking charts

**Backend:**
- Next.js API routes (keeps it simple)
- MongoDB + Mongoose (Atlas free tier works fine for dev)
- JWT for auth
- Zod for validation

**Blockchain stuff:**
- Hedera Hashgraph (chose this over Ethereum because gas fees suck)
- Asset Tokenization Studio SDK (makes token creation way easier)
- Hardhat for contract development
- Solidity ^0.8.20 with OpenZeppelin contracts (don't reinvent the wheel)

**Smart Contracts:**
- `EquityToken.sol` - The actual token, ERC-20 compatible with extra security token features
- `PropertySale.sol` - Handles selling shares, tracks inventory, processes payments
- `DividendDistributor.sol` - Splits profits among shareholders

## Project structure

```
Tedera/
├── apps/web/              # The Next.js app
│   ├── app/               # Routes (admin, portfolio, api endpoints)
│   ├── components/        # React components
│   ├── lib/               # Utilities, contract ABIs, Hedera integration
│   └── models/            # MongoDB schemas
├── packages/contracts/    # Solidity contracts and deployment scripts
└── docs/                  # Deployment guide and other docs
```

Pretty standard monorepo setup. The contracts live in a separate package so we can deploy them independently.

## Getting started

### What you need

- Node.js 18+ (we use npm, but pnpm works too)
- MongoDB - local works, but Atlas free tier is easier
- MetaMask installed (we'll add Hedera testnet automatically)
- A Hedera testnet account with some HBAR (get it from the portal or HashPack faucet)

### Setup

1. **Clone and install**
```bash
git clone <your-repo>
cd Tedera
npm install
```

2. **Environment variables**

Create `apps/web/.env.local`:

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tedera

# JWT secret (just make something up, doesn't matter for dev)
JWT_SECRET=whatever-secret-key-you-want

# Your Hedera account (testnet)
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
NEXT_PUBLIC_HEDERA_OPERATOR_KEY=your-private-key

# ATS factory addresses (these are the testnet ones)
NEXT_PUBLIC_FACTORY_ADDRESS=0xcBF9225c4093a742C4A5A4152f296749Ad3490E7
NEXT_PUBLIC_RESOLVER_ADDRESS=0xd89bDfF4826bcBbF493e6F27ce6974F02E3d15E3
```

3. **Compile contracts**
```bash
npm run contracts:compile
```

This compiles the Solidity contracts. The ABIs get copied to the web app automatically (or should, if not, check the build scripts).

4. **Start it up**
```bash
npm run dev
```

Open http://localhost:3000 and you should see the marketplace. If something breaks, check the console - it's usually a missing env var or MongoDB connection issue.

### Connecting MetaMask

The app will prompt you to add Hedera Testnet to MetaMask automatically. If it doesn't, here's how to add it manually:

- Network Name: `Hedera Testnet`
- RPC URL: `https://testnet.hashio.io/api`
- Chain ID: `296`
- Currency Symbol: `HBAR`
- Block Explorer: `https://hashscan.io/testnet`

Once connected, you'll need some testnet HBAR. The Hedera portal has a faucet, or use HashPack's built-in one.

## Development

**Useful commands:**

From the root:
- `npm run dev` - Start the web app
- `npm run contracts:compile` - Recompile contracts
- `npm run contracts:deploy` - Deploy to testnet

Inside `apps/web/`:
- `npm run seed` - Add some sample properties to the database (helpful for testing)

Inside `packages/contracts/`:
- `npm run deploy:testnet` - Deploy all contracts
- `npm run test` - Run contract tests

### Deploying contracts

If you need to deploy contracts manually:

1. Make sure Hardhat is configured in `packages/contracts/hardhat.config.ts`
2. Set your Hedera account in the env vars
3. Run:
```bash
cd packages/contracts
npm run deploy:testnet
```

Each property creation actually deploys 3 contracts: the token (via ATS), PropertySale, and DividendDistributor. All addresses get saved to MongoDB automatically.

## Smart contracts overview

**EquityToken**: This is created via Hedera's ATS, so it's ERC-1400 compliant. Has all the standard token stuff plus transfer restrictions, pausing, and metadata fields.

**PropertySale**: When you create a property, this contract handles the sale. It tracks how many shares are available, the price per share, and processes HBAR payments. Pretty straightforward.

**DividendDistributor**: This is where the magic happens. When a property makes money, the admin calls `createDistribution()` with an amount. Shareholders can then claim their portion. We track everything by distribution ID so you can see the history.

## Testing

We have some basic tests for the web app:
```bash
cd apps/web
npm run test
```


## Documentation

There's a more detailed deployment guide in `docs/DEPLOYMENT_GUIDE.md` if you run into issues or want to understand the flow better.


## Useful links

- [Certificate](https://drive.google.com/file/d/13VziEGjawholkYyVsXHKokvSPI2Z-Ir1/view?usp=sharing) - One Team member that taught us in practive
- [Pitch Deck]([https://hashscan.io/testnet](https://drive.google.com/drive/folders/1l9NxvKhz0b12IgSDog3lZPXV_gm-IC26?usp=sharing)) - Learn more about our Full PLAN with Hedera
- [Promo Video]([https://github.com/hashgraph/hedera-asset-tokenization](https://drive.google.com/drive/folders/1l9NxvKhz0b12IgSDog3lZPXV_gm-IC26?usp=sharing)) - Get some Popcorn and Enjoy


## License

Apache-2.0 - do what you want with it.

---

Built with ❤️ from our lovely team and way too much coffee.
