import { ethers } from 'ethers';

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
  
  try {
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
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      // Initialize Hedera SDK
      await initializeHederaSDK();
      
      // Ensure Equity is loaded
      if (!Equity) {
        const module = await import('@hashgraph/asset-tokenization-sdk');
        Equity = module.Equity;
      }
      
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      
      console.log('Deploying property token with params:', params);
      
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
      
      console.log('Token deployment result:', result);
      
      return {
        tokenAddress: result.payload.diamondAddress,
        evmTokenAddress: result.payload.evmDiamondAddress,
        transactionId: result.transactionId,
      };
    } else {
      throw new Error('MetaMask not available or not in browser environment');
    }
  } catch (error) {
    console.error('Token deployment error:', error);
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
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      
      // Simple PropertySale contract ABI
      const PropertySaleABI = [
        "constructor(address _token, uint256 _pricePerShare, uint256 _totalShares)",
        "function buyShares(uint256 shares) external payable",
        "function saleActive() external view returns (bool)",
        "function toggleSale() external",
        "function withdrawFunds() external",
      ];
      
      // Deploy PropertySale contract
      const PropertySaleFactory = new ethers.ContractFactory(
        PropertySaleABI,
        `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertySale is Ownable {
    IERC20 public propertyToken;
    uint256 public pricePerShare; // in tinybars
    uint256 public totalShares;
    uint256 public sharesSold;
    bool public saleActive;
    
    mapping(address => uint256) public purchased;
    
    event SharesPurchased(address indexed buyer, uint256 shares, uint256 amount);
    event SaleStatusChanged(bool active);
    
    constructor(
        address _token,
        uint256 _pricePerShare,
        uint256 _totalShares
    ) {
        propertyToken = IERC20(_token);
        pricePerShare = _pricePerShare;
        totalShares = _totalShares;
        saleActive = true;
    }
    
    function buyShares(uint256 shares) external payable {
        require(saleActive, "Sale not active");
        require(sharesSold + shares <= totalShares, "Not enough shares");
        require(msg.value >= shares * pricePerShare, "Insufficient payment");
        
        sharesSold += shares;
        purchased[msg.sender] += shares;
        
        require(
            propertyToken.transfer(msg.sender, shares),
            "Token transfer failed"
        );
        
        emit SharesPurchased(msg.sender, shares, msg.value);
    }
    
    function toggleSale() external onlyOwner {
        saleActive = !saleActive;
        emit SaleStatusChanged(saleActive);
    }
    
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}`,
        signer
      );
      
      console.log('Deploying PropertySale contract...');
      const propertySale = await PropertySaleFactory.deploy(
        tokenAddress,
        ethers.utils.parseEther(pricePerShare.toString()),
        totalShares
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
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      
      // Simple DividendDistributor contract ABI
      const DividendDistributorABI = [
        "constructor(address _token)",
        "function distributeDividends() external payable",
        "function claimDividends() external",
        "function getClaimableDividends(address account) external view returns (uint256)",
      ];
      
      // Deploy DividendDistributor contract
      const DividendDistributorFactory = new ethers.ContractFactory(
        DividendDistributorABI,
        `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DividendDistributor is Ownable {
    IERC20 public token;
    mapping(address => uint256) public dividendsPerShare;
    mapping(address => uint256) public lastClaimed;
    
    event DividendsDistributed(uint256 amount);
    event DividendsClaimed(address indexed account, uint256 amount);
    
    constructor(address _token) {
        token = IERC20(_token);
    }
    
    function distributeDividends() external payable onlyOwner {
        uint256 totalSupply = token.totalSupply();
        require(totalSupply > 0, "No tokens in circulation");
        
        uint256 dividendPerShare = msg.value / totalSupply;
        dividendsPerShare[address(this)] += dividendPerShare;
        
        emit DividendsDistributed(msg.value);
    }
    
    function claimDividends() external {
        uint256 claimable = getClaimableDividends(msg.sender);
        require(claimable > 0, "No dividends to claim");
        
        lastClaimed[msg.sender] = dividendsPerShare[address(this)];
        payable(msg.sender).transfer(claimable);
        
        emit DividendsClaimed(msg.sender, claimable);
    }
    
    function getClaimableDividends(address account) external view returns (uint256) {
        uint256 balance = token.balanceOf(account);
        uint256 currentDividendsPerShare = dividendsPerShare[address(this)];
        uint256 lastClaimedPerShare = lastClaimed[account];
        
        return balance * (currentDividendsPerShare - lastClaimedPerShare);
    }
}`,
        signer
      );
      
      console.log('Deploying DividendDistributor contract...');
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
