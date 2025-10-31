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
  currentValue: number; // in HBAR
  investedAmount: number; // in HBAR
  gainLoss: {
    amount: number;
    percentage: number; // % of investment made back through dividends
    isGain: boolean;
  };
  expectedYield: number;
  claimableDividends: number; // in HBAR
  totalDividendsReceived: number; // in HBAR (all dividends including claimed)
  status: 'active' | 'sold';
}

export interface PortfolioMetrics {
  totalInvested: number; // in HBAR
  currentValue: number; // in HBAR
  totalProfit: number; // in HBAR (claimable dividends)
  totalDividendsReceived: number; // in HBAR (total dividends received including claimed)
  roi: number; // ROI as percentage (totalDividendsReceived / totalInvested * 100)
  totalReturn: {
    amount: number; // in USD
    percentage: number;
  };
  totalHoldings: number;
  activeProperties: number;
  // Historical data for charts
  monthlyProfit: Array<{ month: string; amount: number }>; // in HBAR
  investmentHistory: Array<{ date: string; amount: number }>; // in HBAR
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
 * OPTIMIZED: Parallelizes distribution checks for better performance
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
    
    // OPTIMIZATION: Check all distributions in parallel
    const distributionPromises = Array.from({ length: count }, async (_, i) => {
      try {
        // Check if user has already claimed this distribution and get claimable amount in parallel
        const [claimed, claimableBN] = await Promise.all([
          contract.hasClaimed(i, userAddress),
          contract.getClaimableDividend(i, userAddress).catch(() => ethers.BigNumber.from(0))
        ]);
        
        // If already claimed or amount is zero, return null (will be filtered out)
        if (claimed || !claimableBN || claimableBN.isZero()) {
          return null;
        }
        
        return claimableBN;
      } catch (err) {
        // Skip this distribution if there's an error (e.g., invalid distribution ID)
        console.warn(`Error checking distribution ${i} for ${dividendContractAddress}:`, err);
        return null;
      }
    });
    
    // Wait for all distribution checks to complete
    const results = await Promise.all(distributionPromises);
    
    // Sum up all non-null claimable amounts
    let total = ethers.BigNumber.from(0);
    for (const result of results) {
      if (result !== null && !result.isZero()) {
        total = total.add(result);
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
 * OPTIMIZED: Processes properties in parallel for better performance
 */
export async function fetchUserPortfolio(
  userAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.Provider
): Promise<PropertyHolding[]> {
  try {
    // Fetch all properties from database
    const properties = await fetchAllProperties();
    console.log('📦 Fetched properties from API:', properties.length);
    
    // OPTIMIZATION: Process all properties in parallel
    const propertyPromises = properties.map(async (property) => {
      try {
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
          return null;
        }

        // OPTIMIZATION: Check balance first (early exit if user owns nothing)
        const sharesOwned = await getTokenBalance(
          tokenAddress,
          userAddress,
          provider
        );
        
        console.log(`🔍 Property: ${property.name}, Token: ${tokenAddress}, User: ${userAddress}, Shares: ${sharesOwned}`);

        // Early exit: Skip if user doesn't own any shares
        if (sharesOwned === 0) return null;
        
        // OPTIMIZATION: Fetch sale details and dividends in parallel
        const [saleDetails, claimableDividends] = await Promise.all([
          getPropertySaleDetails(property.saleContractAddress, provider),
          getClaimableDividends(property.dividendContractAddress, userAddress, provider)
        ]);
        
        if (!saleDetails) {
          console.log(`⚠️ Failed to get sale details for property ${property.name}`);
          return null;
        }
        
        // Calculate invested amount (shares owned × price per share) in HBAR
        const investedAmount = sharesOwned * saleDetails.pricePerShare;
        
        // For now, current value = invested amount (no price appreciation yet)
        // In a real system, you'd fetch current market price
        const currentValue = investedAmount;
        
        // Calculate total dividends received for this property
        // We'll fetch this in calculatePortfolioMetrics, for now set to 0
        let totalDividendsReceived = 0;
        
        // Calculate gain/loss based on % of investment made back through dividends
        // This will be updated in calculatePortfolioMetrics when we fetch distributions
        const gainLossPercentage = investedAmount > 0 && totalDividendsReceived > 0
          ? (totalDividendsReceived / investedAmount) * 100 
          : 0;
        
        const holding: PropertyHolding = {
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
            amount: totalDividendsReceived - investedAmount,
            percentage: gainLossPercentage,
            isGain: totalDividendsReceived >= 0,
          },
          expectedYield: parseFloat(property.expectedYield) || 0,
          claimableDividends,
          totalDividendsReceived, // Will be updated in calculatePortfolioMetrics
          status: saleDetails.saleActive ? 'active' : 'sold',
        };
        
        return holding;
      } catch (error) {
        // Log error but don't fail entire portfolio fetch
        console.error(`Error processing property ${property.name || 'Unknown'}:`, error);
        return null;
      }
    });
    
    // Wait for all properties to be processed
    const results = await Promise.all(propertyPromises);
    
    // Filter out null results (properties user doesn't own or that failed)
    const holdings = results.filter((holding): holding is PropertyHolding => holding !== null);
    
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
  // Convert invested amount to HBAR (assuming pricePerShare is in HBAR)
  const totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0); // in HBAR
  const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0); // in HBAR
  const totalProfit = holdings.reduce((sum, h) => sum + h.claimableDividends, 0); // in HBAR (claimable)
  
  // Calculate total return in USD (for display)
  // Assuming 1 HBAR = ~$0.05 for conversion (this should come from an exchange rate API in production)
  const HBAR_TO_USD_RATE = 0.05;
  const totalReturnAmount = (currentValue - totalInvested + totalProfit) * HBAR_TO_USD_RATE;
  const totalReturnPercentage = totalInvested > 0 
    ? (totalReturnAmount / (totalInvested * HBAR_TO_USD_RATE)) * 100 
    : 0;

  // Fetch historical distribution data for charts and calculate total dividends received
  const monthlyProfit: Array<{ month: string; amount: number }> = [];
  const investmentHistory: Array<{ date: string; amount: number }> = [];
  let monthlyChange = 0;
  let totalDividendsReceived = 0; // Total dividends received including claimed

  try {
    const token = authToken || (typeof window !== 'undefined' ? localStorage.getItem('hedera-auth-token') : null);
    
    if (token && holdings.length > 0) {
      // Fetch distributions for each property
      const monthlyMap = new Map<string, number>();
      const propertyDistributions: Array<{ date: Date; amount: number }> = [];

      // Create a map to store dividends per property
      const dividendsPerProperty = new Map<string, number>();

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
            let propertyTotalDividends = 0;

            for (const dist of distributions) {
              if (dist.executedAt || dist.createdAt) {
                const date = new Date(dist.executedAt || dist.createdAt);
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                const userShare = holding.sharesOwned / holding.totalShares;
                const userAmount = (dist.totalAmount || 0) * userShare;

                // Add to property total and global total
                propertyTotalDividends += userAmount;
                totalDividendsReceived += userAmount;

                monthlyMap.set(month, (monthlyMap.get(month) || 0) + userAmount);
                propertyDistributions.push({ date, amount: userAmount });
              }
            }
            
            // Store dividends for this property to update holding later
            dividendsPerProperty.set(holding.propertyId, propertyTotalDividends);
          }
        } catch (err) {
          console.warn(`Error fetching distributions for ${holding.propertyId}:`, err);
        }
      }
      
      // Update holdings with total dividends received and recalculate gain/loss
      for (const holding of holdings) {
        const propertyDividends = dividendsPerProperty.get(holding.propertyId) || 0;
        holding.totalDividendsReceived = propertyDividends;
        
        // Recalculate gain/loss as % of investment made back through dividends
        holding.gainLoss.percentage = holding.investedAmount > 0 
          ? (propertyDividends / holding.investedAmount) * 100 
          : 0;
        holding.gainLoss.amount = propertyDividends - holding.investedAmount;
        holding.gainLoss.isGain = propertyDividends >= 0;
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

      // Generate investment history in HBAR over the last 30 days
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
  
  // Calculate ROI as percentage of invested amount made back from dividends
  const roi = totalInvested > 0 ? (totalDividendsReceived / totalInvested) * 100 : 0;
  
  return {
    totalInvested, // in HBAR
    currentValue, // in HBAR
    totalProfit, // in HBAR (claimable)
    totalDividendsReceived, // in HBAR (all dividends received)
    roi, // percentage
    totalReturn: {
      amount: totalReturnAmount, // in USD
      percentage: totalReturnPercentage,
    },
    totalHoldings: holdings.length,
    activeProperties: holdings.filter(h => h.status === 'active').length,
    monthlyProfit, // in HBAR
    investmentHistory, // in HBAR
    monthlyChange,
  };
}

