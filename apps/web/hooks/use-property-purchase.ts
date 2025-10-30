import { useWallet } from '@/context/wallet-context';
import { ethers } from 'ethers';

export function usePropertyPurchase() {
  const { provider } = useWallet();
  
  const purchaseShares = async (
    saleContractAddress: string,
    shares: number,
    pricePerShare: number
  ) => {
    if (!provider) throw new Error('Wallet not connected');
    if (!Number.isFinite(shares) || shares <= 0) {
      throw new Error('Enter a valid number of shares');
    }
    
    const signer = provider.getSigner();
    const PropertySaleABI = [
      'function buyShares(uint256 shares) external payable',
      'function pricePerShare() external view returns (uint256)',
      'function totalShares() external view returns (uint256)',
      'function sharesSold() external view returns (uint256)',
      'function saleActive() external view returns (bool)',
    ];
    
    const saleContract = new ethers.Contract(
      saleContractAddress,
      PropertySaleABI,
      signer
    );
    
    // Check if sale is active
    const isActive = await saleContract.saleActive();
    if (!isActive) {
      throw new Error('Sale is not active');
    }
    
    // Check available shares (contract stores shares in wei with 18 decimals)
    const totalShares = await saleContract.totalShares();
    const sharesSold = await saleContract.sharesSold();
    const availableSharesWei = totalShares.sub(sharesSold);
    
    // Convert available shares from wei to whole tokens for comparison
    const availableSharesTokens = parseFloat(ethers.utils.formatUnits(availableSharesWei, 18));
    
    console.log('📊 Available shares:', availableSharesTokens, 'tokens');
    console.log('📊 Requested shares:', shares, 'tokens');
    
    if (shares > availableSharesTokens) {
      throw new Error(`Only ${availableSharesTokens} shares available`);
    }
    
    // Convert the number of shares user wants to buy into wei (18 decimals)
    const sharesInWei = ethers.utils.parseUnits(shares.toString(), 18);
    
    // Get current price per share from contract
    // This is stored as wei (tinybars) per whole token
    const pricePerWholeTokenInWei = await saleContract.pricePerShare();
    
    // Calculate total cost: (sharesInWei * pricePerWholeToken) / 10^18
    // Example: (1 * 10^18 wei of token) * (100 * 10^18 tinybars per token) / 10^18 = 100 * 10^18 tinybars = 100 HBAR
    const totalCost = sharesInWei.mul(pricePerWholeTokenInWei).div(ethers.utils.parseUnits('1', 18));
    
    console.log('🔍 === PURCHASE CALCULATION DEBUG ===');
    console.log('📊 Available shares:', availableSharesTokens, 'tokens');
    console.log('📊 Requested shares:', shares, 'tokens');
    console.log('📦 Shares in wei:', sharesInWei.toString());
    console.log('💰 Price per whole token (from contract):', pricePerWholeTokenInWei.toString(), 'wei');
    console.log('💰 Price per whole token:', ethers.utils.formatEther(pricePerWholeTokenInWei), 'HBAR');
    console.log('💵 Total cost (calculated):', totalCost.toString(), 'wei');
    console.log('💵 Total cost:', ethers.utils.formatEther(totalCost), 'HBAR');
    console.log('🏦 Wallet balance:', ethers.utils.formatEther(await signer.getBalance()), 'HBAR');
    console.log('🔍 Contract address:', saleContractAddress);
    console.log('🔍 === END DEBUG ===');
    
    const tx = await saleContract.buyShares(sharesInWei, {
      value: totalCost,
    });
    
    await tx.wait();
    return tx.hash;
  };
  
  return { purchaseShares };
}
