import { ethers } from 'ethers';

// ERC-1400/ERC-20 Token ABI (minimal interface for balance queries)
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

// PropertySale ABI (minimal interface)
const PROPERTY_SALE_ABI = [
  'function pricePerShare() view returns (uint256)',
  'function totalShares() view returns (uint256)',
  'function sharesSold() view returns (uint256)',
  'function saleActive() view returns (bool)',
];

// DividendDistributor ABI (functions needed for read-only portfolio calculations)
const DIVIDEND_DISTRIBUTOR_ABI = [
  'function getDistributionCount() view returns (uint256)',
  'function hasClaimed(uint256 distributionId, address holder) view returns (bool)',
  'function getClaimableDividend(uint256 distributionId, address holder) view returns (uint256)',
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
  // Historical data for charts
  monthlyProfit: Array<{ month: string; amount: number }>;
  investmentHistory: Array<{ date: string; amount: number }>;
  monthlyChange: number;
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
 * Returns balance in whole tokens (not wei) to avoid JavaScript number overflow
 */
async function getTokenBalance(
  tokenAddress: string,
  userAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.Provider
): Promise<number> {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Fetch balance and decimals in parallel
    const [balanceRaw, decimals] = await Promise.all([
      tokenContract.balanceOf(userAddress),
      tokenContract.decimals().catch(() => 18), // Default to 18 if decimals() not available
    ]);

    // Convert from token wei (raw BigNumber) to whole tokens using formatUnits
    // This prevents overflow when converting large values
    const balanceInWholeTokens = parseFloat(ethers.utils.formatUnits(balanceRaw, decimals));
    
    return balanceInWholeTokens;
  } catch (error) {
    console.error(`Error fetching balance for token ${tokenAddress}:`, error);
    return 0;
  }
}

/**
 * Get property sale contract details
 * Converts all values from contract format (wei/token wei) to human-readable format
 */
async function getPropertySaleDetails(
  saleContractAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.Provider
) {
  try {
    const saleContract = new ethers.Contract(saleContractAddress, PROPERTY_SALE_ABI, provider);
    const [pricePerShareRaw, totalSharesRaw, sharesSoldRaw, saleActive] = await Promise.all([
      saleContract.pricePerShare(),
      saleContract.totalShares(),
      saleContract.sharesSold(),
      saleContract.saleActive(),
    ]);

    // pricePerShare is in wei per whole token -> convert to HBAR units
    const pricePerShare = parseFloat(ethers.utils.formatEther(pricePerShareRaw));

    // totalShares and sharesSold are in token wei (18 decimals) -> convert to whole tokens
    // This prevents overflow when converting large values
    const totalShares = parseFloat(ethers.utils.formatUnits(totalSharesRaw, 18));
    const sharesSold = parseFloat(ethers.utils.formatUnits(sharesSoldRaw, 18));

    return {
      pricePerShare,
      totalShares,
      sharesSold,
      saleActive,
    };
  } catch (error) {
    console.error(`Error fetching sale details for ${saleContractAddress}:`, error);
    return null;
  }
}

/**
 * Get claimable dividends for a user
 * Iterates through all distributions and sums up claimable amounts
 */
async function getClaimableDividends(
  dividendContractAddress: string,
  userAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.Provider
): Promise<number> {
  try {
    const contract = new ethers.Contract(
      dividendContractAddress,
      DIVIDEND_DISTRIBUTOR_ABI,
      provider
    );
    
    // Get total number of distributions
    const countBN = await contract.getDistributionCount();
    const count = parseInt(countBN.toString(), 10);
    
    if (count === 0) {
      return 0;
    }
    
    // Iterate through all distributions and sum up unclaimed amounts
    let total = ethers.BigNumber.from(0);
    
    for (let i = 0; i < count; i++) {
      try {
        // Check if user has already claimed this distribution
        const claimed: boolean = await contract.hasClaimed(i, userAddress);
        if (claimed) continue;
        
        // Get claimable amount for this distribution
        const claimableBN: ethers.BigNumber = await contract.getClaimableDividend(i, userAddress);
        if (claimableBN && !claimableBN.isZero()) {
          total = total.add(claimableBN);
        }
      } catch (err) {
        // Skip this distribution if there's an error (e.g., invalid distribution ID)
        console.warn(`Error checking distribution ${i} for ${dividendContractAddress}:`, err);
        continue;
      }
    }
    
    // Convert from tinybars (8 decimals) to HBAR
    const totalInHBAR = parseFloat(ethers.utils.formatUnits(total, 8));
    return totalInHBAR;
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
 * Calculate portfolio metrics from holdings with historical data
 */
export async function calculatePortfolioMetrics(
  holdings: PropertyHolding[],
  authToken?: string
): Promise<PortfolioMetrics> {
  const totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalProfit = holdings.reduce((sum, h) => sum + h.claimableDividends, 0);
  
  const totalReturnAmount = currentValue - totalInvested + totalProfit;
  const totalReturnPercentage = totalInvested > 0 
    ? (totalReturnAmount / totalInvested) * 100 
    : 0;

  // Fetch historical distribution data for charts
  const monthlyProfit: Array<{ month: string; amount: number }> = [];
  const investmentHistory: Array<{ date: string; amount: number }> = [];
  let monthlyChange = 0;

  try {
    const token = authToken || (typeof window !== 'undefined' ? localStorage.getItem('hedera-auth-token') : null);
    
    if (token && holdings.length > 0) {
      // Fetch distributions for each property
      const monthlyMap = new Map<string, number>();
      const propertyDistributions: Array<{ date: Date; amount: number }> = [];

      for (const holding of holdings) {
        try {
          const response = await fetch(`/api/distributions/property/${holding.propertyId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const distributions = data.distributions || [];

            for (const dist of distributions) {
              if (dist.executedAt || dist.createdAt) {
                const date = new Date(dist.executedAt || dist.createdAt);
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                const userShare = holding.sharesOwned / holding.totalShares;
                const userAmount = (dist.totalAmount || 0) * userShare;

                monthlyMap.set(month, (monthlyMap.get(month) || 0) + userAmount);
                propertyDistributions.push({ date, amount: userAmount });
              }
            }
          }
        } catch (err) {
          console.warn(`Error fetching distributions for ${holding.propertyId}:`, err);
        }
      }

      // Convert monthly map to array for last 5 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const last5Months: Array<{ month: string; amount: number }> = [];

      for (let i = 4; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = months[date.getMonth()];
        last5Months.push({
          month,
          amount: monthlyMap.get(month) || 0
        });
      }

      monthlyProfit.push(...last5Months);

      // Calculate monthly change
      if (last5Months.length >= 2) {
        const thisMonth = last5Months[last5Months.length - 1]?.amount || 0;
        const lastMonth = last5Months[last5Months.length - 2]?.amount || 0;
        monthlyChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
      }

      // Generate investment history (simplified - can be enhanced with actual purchase dates)
      // For now, we'll simulate gradual investment growth over the last 30 days
      const nowDate = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(nowDate);
        date.setDate(date.getDate() - i);
        investmentHistory.push({
          date: date.toISOString().split('T')[0],
          // Simulate gradual investment - start at 70% of total, grow to 100%
          amount: totalInvested * (0.7 + (30 - i) / 30 * 0.3)
        });
      }
    }
  } catch (error) {
    console.error('Error fetching historical distributions:', error);
    // Fallback: generate empty arrays
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyProfit.push({
        month: months[date.getMonth()],
        amount: 0
      });
    }
    const nowDate = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(nowDate);
      date.setDate(date.getDate() - i);
      investmentHistory.push({
        date: date.toISOString().split('T')[0],
        amount: totalInvested
      });
    }
  }
  
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
    monthlyProfit,
    investmentHistory,
    monthlyChange,
  };
}

