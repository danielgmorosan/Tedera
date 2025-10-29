import { ethers } from 'ethers';

// Dynamic imports to avoid SSR and webpack issues
let PropertySaleArtifact: any = null;
let DividendDistributorArtifact: any = null;
let Network: any = null;
let Equity: any = null;

let sdkInitialized = false;

async function loadArtifacts() {
  if (!PropertySaleArtifact) {
    PropertySaleArtifact = await import('../contracts/PropertySale.json');
  }
  if (!DividendDistributorArtifact) {
    DividendDistributorArtifact = await import('../contracts/DividendDistributor.json');
  }
}

export async function initializeHederaSDK() {
  if (sdkInitialized) return;

  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    console.warn('Hedera SDK initialization skipped on server side');
    return null;
  }

  try {
    if (!Network) {
      // Dynamic import to avoid webpack bundling issues
      const module = await import(
        /* webpackIgnore: true */
        '@hashgraph/asset-tokenization-sdk'
      ).catch(() => {
        console.warn('Asset Tokenization SDK not available, using fallback');
        return null;
      });

      if (module) {
        Network = module.Network;
        Equity = module.Equity;
      }
    }

    if (!Network) {
      console.warn('Hedera SDK not available');
      return null;
    }

    const supportedWallets = await Network.init({
      network: process.env.NEXT_PUBLIC_HEDERA_NETWORK as any,
      configuration: {
        factoryAddress: process.env.NEXT_PUBLIC_FACTORY_ADDRESS!,
        resolverAddress: process.env.NEXT_PUBLIC_RESOLVER_ADDRESS!,
      },
      mirrorNode: {
        name: 'Hedera',
        url: 'https://testnet.mirrornode.hedera.com/api/v1/',
      },
      rpcNode: {
        name: 'Hashio',
        url: 'https://testnet.hashio.io/api',
      },
    });

    sdkInitialized = true;
    return supportedWallets;
  } catch (error) {
    console.error('Failed to initialize Hedera SDK:', error);
    throw new Error('Failed to initialize Hedera SDK. Please ensure MetaMask is connected and you are on Hedera testnet.');
  }
}

export async function deployPropertyToken(params: {
  name: string;
  symbol: string;
  totalShares: number;
  pricePerShare: number;
}) {
  try {
    // Check if we're in a browser environment with MetaMask
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask and connect your wallet.');
    }

    // Check if MetaMask is connected
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) {
      throw new Error('Please connect your MetaMask wallet and try again.');
    }

    console.log('✅ MetaMask detected');
    console.log('👛 Connected account:', accounts[0]);

    // Initialize Hedera SDK
    await initializeHederaSDK();

    if (typeof window !== 'undefined' && (window as any).ethereum) {

      // Ensure Equity is loaded
      if (!Equity) {
        const module = await import(
          /* webpackIgnore: true */
          '@hashgraph/asset-tokenization-sdk'
        ).catch(() => null);

        if (module) {
          Equity = module.Equity;
        }
      }

      if (!Equity) {
        throw new Error('Asset Tokenization SDK not available. Please check your installation.');
      }

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();

      // Get current account and network info
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      console.log('🚀 Starting property token deployment...');
      console.log('👛 Deploying from account:', address);
      console.log('🌐 Network:', network.chainId, network.name);
      console.log('📋 Params:', params);

      if (network.chainId !== 296) {
        throw new Error('Please switch to Hedera Testnet (Chain ID 296) in MetaMask');
      }

      console.log('⏳ MetaMask popup should appear - please approve the transaction...');

      // Use the Hedera Asset Tokenization SDK to create an equity token
      const result = await Equity.create({
        name: params.name,
        symbol: params.symbol,
        decimals: 0, // Whole shares only
        numberOfShares: params.totalShares.toString(),
        nominalValue: params.pricePerShare.toString(),
        currency: ethers.utils.formatBytes32String('USD'),
        regulationType: 0, // No regulation for MVP
        regulationSubType: 0,
        countries: '',
        isCountryControlListWhiteList: false,
        votingRight: true,
        informationRight: true,
        liquidationRight: true,
        subscriptionRight: false,
        conversionRight: false,
        redemptionRight: false,
        putRight: false,
        dividendRight: true,
      }, signer);

      console.log('✅ Token deployment successful!');
      console.log('📄 Result:', result);

      return {
        tokenAddress: result.payload.diamondAddress,
        evmTokenAddress: result.payload.evmDiamondAddress,
        transactionId: result.transactionId,
      };
    }
  } catch (error) {
    console.error('❌ Token deployment error:', error);

    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('user rejected') || error.message.includes('User denied')) {
        throw new Error('Transaction rejected by user in MetaMask');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient HBAR balance. Please get testnet HBAR from portal.hedera.com');
      }
    }

    throw new Error(`Token deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deployPropertySale(
  tokenAddress: string,
  pricePerShare: number,
  totalShares: number
) {
  try {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      // Load artifacts dynamically
      await loadArtifacts();

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();

      console.log('Deploying PropertySale contract...');

      // Use compiled artifact
      const PropertySaleFactory = new ethers.ContractFactory(
        PropertySaleArtifact.abi,
        PropertySaleArtifact.bytecode,
        signer
      );

      // Deploy with constructor parameters
      // Constructor: (address _token, uint256 _pricePerShare, uint256 _totalShares, uint256 _saleDuration)
      const saleDuration = 30 * 24 * 60 * 60; // 30 days in seconds
      const priceInWei = ethers.utils.parseEther(pricePerShare.toString());

      const propertySale = await PropertySaleFactory.deploy(
        tokenAddress,
        priceInWei,
        totalShares,
        saleDuration
      );

      await propertySale.deployed();
      console.log('PropertySale deployed to:', propertySale.address);

      return propertySale.address;
    } else {
      throw new Error('MetaMask not available or not in browser environment');
    }
  } catch (error) {
    console.error('PropertySale deployment error:', error);
    throw error;
  }
}

export async function deployDividendDistributor(tokenAddress: string) {
  try {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      // Load artifacts dynamically
      await loadArtifacts();

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();

      console.log('Deploying DividendDistributor contract...');

      // Use compiled artifact
      const DividendDistributorFactory = new ethers.ContractFactory(
        DividendDistributorArtifact.abi,
        DividendDistributorArtifact.bytecode,
        signer
      );

      const dividendDistributor = await DividendDistributorFactory.deploy(tokenAddress);
      await dividendDistributor.deployed();
      console.log('DividendDistributor deployed to:', dividendDistributor.address);

      return dividendDistributor.address;
    } else {
      throw new Error('MetaMask not available or not in browser environment');
    }
  } catch (error) {
    console.error('DividendDistributor deployment error:', error);
    throw error;
  }
}
