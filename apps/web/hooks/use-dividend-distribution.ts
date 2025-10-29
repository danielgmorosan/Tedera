import { useWallet } from '@/context/wallet-context';
import { ethers } from 'ethers';
import DividendDistributorArtifact from '../lib/contracts/DividendDistributor.json';

export function useDividendDistribution() {
  const { provider } = useWallet();
  
  const createDistribution = async (
    dividendContractAddress: string,
    amountInHbar: number
  ) => {
    if (!provider) throw new Error('Wallet not connected');
    
    const signer = provider.getSigner();
    const distributorContract = new ethers.Contract(
      dividendContractAddress,
      DividendDistributorArtifact.abi,
      signer
    );
    
    // Convert HBAR to wei (tinybars)
    const amountInWei = ethers.utils.parseEther(amountInHbar.toString());
    
    // Call createDistribution with HBAR payment
    const tx = await distributorContract.createDistribution({
      value: amountInWei,
    });
    
    await tx.wait();
    return tx.hash;
  };
  
  const getDistributionCount = async (dividendContractAddress: string) => {
    if (!provider) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(
      dividendContractAddress,
      DividendDistributorArtifact.abi,
      provider
    );
    
    const count = await contract.getDistributionCount();
    return count.toNumber();
  };
  
  const claimDividend = async (
    dividendContractAddress: string,
    distributionId: number
  ) => {
    if (!provider) throw new Error('Wallet not connected');
    
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      dividendContractAddress,
      DividendDistributorArtifact.abi,
      signer
    );
    
    const tx = await contract.claimDividend(distributionId);
    await tx.wait();
    return tx.hash;
  };
  
  return { createDistribution, getDistributionCount, claimDividend };
}

