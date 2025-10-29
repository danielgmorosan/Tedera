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
    
    // Check available shares
    const totalShares = await saleContract.totalShares();
    const sharesSold = await saleContract.sharesSold();
    const availableShares = totalShares.sub(sharesSold);
    
    if (shares > availableShares.toNumber()) {
      throw new Error(`Only ${availableShares.toString()} shares available`);
    }
    
    // Get current price per share from contract
    const contractPricePerShare = await saleContract.pricePerShare();
    const totalCost = contractPricePerShare.mul(shares);
    
    const tx = await saleContract.buyShares(shares, {
      value: totalCost,
    });
    
    await tx.wait();
    return tx.hash;
  };
  
  return { purchaseShares };
}
