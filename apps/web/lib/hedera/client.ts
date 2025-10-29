// Dynamic import for Hedera SDK to avoid SSR issues
let Network: any = null;
let Equity: any = null;

let sdkInitialized = false;

export async function initializeHederaSDK() {
  if (sdkInitialized) return;
  
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    console.warn('Hedera SDK initialization skipped on server side');
    return null;
  }
  
  if (!Network) {
    const module = await import('@hashgraph/asset-tokenization-sdk');
    Network = module.Network;
    Equity = module.Equity;
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
}

export async function connectHederaAccount(accountId: string) {
  await initializeHederaSDK();
  
  const result = await Network.connect({
    account: {
      accountId,
      evmAddress: '', // will be populated by wallet
    },
    network: 'testnet',
    mirrorNode: {
      name: 'Hedera',
      url: 'https://testnet.mirrornode.hedera.com/api/v1/',
    },
    rpcNode: {
      name: 'Hashio',
      url: 'https://testnet.hashio.io/api',
    },
  });
  
  return result;
}
