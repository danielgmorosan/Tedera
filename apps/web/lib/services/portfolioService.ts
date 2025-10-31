import { ethers } from 'ethers';

// ERC-1400 Token ABI (minimal interface for balance queries)
const ERC1400_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
];

// PropertySale ABI (minimal interface)
const PROPERTY_SALE_ABI = [
  'function pricePerShare() view returns (uint256)',
  'function totalShares() view returns (uint256)',
  'function sharesSold() view returns (uint256)',
  'function saleActive() view returns (bool)',
];

// DividendDistributor ABI (minimal interface)
const DIVIDEND_DISTRIBUTOR_ABI = [
  'function getClaimableDividends(address account) view returns (uint256)',
  'function totalDividendsDistributed() view returns (uint256)',
];

export interface PropertyHolding {
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  location: string;
  category: string;
  tokenAddress: string;
  saleContractAddress: string;
  dividendContractAddress: string;
  sharesOwned: number;
  totalShares: number;
  pricePerShare: number;
  currentValue: number;
  investedAmount: number;
  gainLoss: {
    amount: number;
    percentage: number;
    isGain: boolean;
  };
  expectedYield: number;
  claimableDividends: number;
  status: 'active' | 'sold';
}

export interface PortfolioMetrics {
  totalInvested: number;
  currentValue: number;
  totalProfit: number;
  totalReturn: {
    amount: number;
    percentage: number;
  };
  totalHoldings: number;
  activeProperties: number;
}

/**
 * Fetch all properties from the database
 */
async function fetchAllProperties() {
  try {
    const response = await fetch('/api/properties');
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    const data = await response.json();
    return data.properties || [];
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

/**
 * Get user's holdings for a specific property token
 */
async function getTokenBalance(
  tokenAddress: string,
  userAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.Provider
): Promise<number> {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC1400_ABI, provider);
    const balance = await tokenContract.balanceOf(userAddress);
    return balance.toNumber();
  } catch (error) {
    console.error(`Error fetching balance for token ${tokenAddress}:`, error);
    return 0;
  }
}

/**
 * Get property sale contract details
 */
async function getPropertySaleDetails(
  saleContractAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.Provider
) {
  try {
    const saleContract = new ethers.Contract(saleContractAddress, PROPERTY_SALE_ABI, provider);
    const [pricePerShare, totalShares, sharesSold, saleActive] = await Promise.all([
      saleContract.pricePerShare(),
      saleContract.totalShares(),
      saleContract.sharesSold(),
      saleContract.saleActive(),
    ]);

    return {
      pricePerShare: parseFloat(ethers.utils.formatEther(pricePerShare)),
      totalShares: totalShares.toNumber(),
      sharesSold: sharesSold.toNumber(),
      saleActive,
    };
  } catch (error) {
    console.error(`Error fetching sale details for ${saleContractAddress}:`, error);
    return null;
  }
}

/**
 * Get claimable dividends for a user
 * TODO: Implement proper dividend fetching by iterating distributions
 * The contract has getClaimableDividend(distributionId, holder) not getClaimableDividends(address)
 */
async function getClaimableDividends(
  dividendContractAddress: string,
  userAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.Provider
): Promise<number> {
  try {
    // Temporarily return 0 to prevent blocking portfolio display
    // The contract method getClaimableDividends(address) doesn't exist
    // We need to implement: get distribution count, then iterate and sum up claimable amounts
    console.log(`⚠️ Dividend fetching not fully implemented for ${dividendContractAddress}`);
    return 0;
  } catch (error) {
    console.error(`Error fetching dividends for ${dividendContractAddress}:`, error);
    return 0;
  }
}

/**
 * Fetch user's complete portfolio
 */
export async function fetchUserPortfolio(
  userAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.Provider
): Promise<PropertyHolding[]> {
  try {
    // Fetch all properties from database
    const properties = await fetchAllProperties();
    console.log('📦 Fetched properties from API:', properties.length);
    
    // For each property, check if user has holdings
    const holdings: PropertyHolding[] = [];
    
    for (const property of properties) {
      // Handle MongoDB _id field (it comes as _id, not id)
      const propertyId = property._id || property.id;
      
      // Use correct field names from Property model
      // Property model has: tokenAddress, evmTokenAddress (not tokenId)
      // Check both tokenAddress and evmTokenAddress
      const tokenAddress = property.tokenAddress || property.evmTokenAddress || property.tokenId;
      
      // Skip properties without required contract addresses
      if (!tokenAddress || !property.saleContractAddress || !property.dividendContractAddress) {
        console.log(`Skipping property ${property.name || 'Unknown'} - missing contract addresses`, {
          hasTokenAddress: !!tokenAddress,
          hasSaleContract: !!property.saleContractAddress,
          hasDividendContract: !!property.dividendContractAddress
        });
        continue;
      }

      // Get user's token balance
      const sharesOwned = await getTokenBalance(
        tokenAddress,
        userAddress,
        provider
      );
      
      console.log(`🔍 Property: ${property.name}, Token: ${tokenAddress}, User: ${userAddress}, Shares: ${sharesOwned}`);

      // Skip if user doesn't own any shares
      if (sharesOwned === 0) continue;
      
      // Get property sale details
      const saleDetails = await getPropertySaleDetails(
        property.saleContractAddress,
        provider
      );
      
      if (!saleDetails) {
        console.log(`⚠️ Failed to get sale details for property ${property.name}`);
        continue;
      }
      
      // Get claimable dividends
      const claimableDividends = await getClaimableDividends(
        property.dividendContractAddress,
        userAddress,
        provider
      );
      
      // Calculate invested amount (shares owned × price per share)
      const investedAmount = sharesOwned * saleDetails.pricePerShare;
      
      // For now, current value = invested amount (no price appreciation yet)
      // In a real system, you'd fetch current market price
      const currentValue = investedAmount;
      
      // Calculate gain/loss
      const gainLossAmount = currentValue - investedAmount;
      const gainLossPercentage = investedAmount > 0 
        ? (gainLossAmount / investedAmount) * 100 
        : 0;
      
      holdings.push({
        propertyId: String(propertyId),  // Ensure it's a string, handle _id
        propertyName: property.name,
        propertyImage: property.image || property.imageUrl || '/portfolio/building-img.png',  // Use 'image' field
        location: property.location || '',
        category: property.type || 'Real Estate',
        tokenAddress: tokenAddress,  // Use corrected token address
        saleContractAddress: property.saleContractAddress,
        dividendContractAddress: property.dividendContractAddress,
        sharesOwned,
        totalShares: saleDetails.totalShares,
        pricePerShare: saleDetails.pricePerShare,
        currentValue,
        investedAmount,
        gainLoss: {
          amount: gainLossAmount,
          percentage: gainLossPercentage,
          isGain: gainLossAmount >= 0,
        },
        expectedYield: parseFloat(property.expectedYield) || 0,
        claimableDividends,
        status: saleDetails.saleActive ? 'active' : 'sold',
      });
    }
    
    console.log(`✅ Portfolio loaded: ${holdings.length} holdings found`);
    return holdings;
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    return [];
  }
}

/**
 * Calculate portfolio metrics from holdings
 */
export function calculatePortfolioMetrics(holdings: PropertyHolding[]): PortfolioMetrics {
  const totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalProfit = holdings.reduce((sum, h) => sum + h.claimableDividends, 0);
  
  const totalReturnAmount = currentValue - totalInvested + totalProfit;
  const totalReturnPercentage = totalInvested > 0 
    ? (totalReturnAmount / totalInvested) * 100 
    : 0;
  
  return {
    totalInvested,
    currentValue,
    totalProfit,
    totalReturn: {
      amount: totalReturnAmount,
      percentage: totalReturnPercentage,
    },
    totalHoldings: holdings.length,
    activeProperties: holdings.filter(h => h.status === 'active').length,
  };
}

