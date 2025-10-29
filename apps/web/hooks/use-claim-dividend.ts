import { useWallet } from '@/context/wallet-context';
import { ethers } from 'ethers';

export function useClaimDividend() {
  const { provider } = useWallet();
  
  const claimDividend = async (
    distributorAddress: string,
    distributionId: number
  ) => {
    if (!provider) throw new Error('Wallet not connected');
    
    const signer = provider.getSigner();
    const DividendDistributorABI = [
      'function claimDividend(uint256 distributionId) external',
    ];
    
    const distributor = new ethers.Contract(
      distributorAddress,
      DividendDistributorABI,
      signer
    );
    
    const tx = await distributor.claimDividend(distributionId);
    await tx.wait();
    return tx.hash;
  };
  
  return { claimDividend };
}
