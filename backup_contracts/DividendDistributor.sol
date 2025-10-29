// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DividendDistributor
 * @notice Distributes rental income/dividends to property token holders
 * @dev Works with ERC-20 compatible tokens (including ATS equity tokens)
 */
contract DividendDistributor is Ownable, ReentrancyGuard {
    IERC20 public propertyToken;

    struct Distribution {
        uint256 totalAmount;        // Total HBAR distributed
        uint256 timestamp;          // When distribution was created
        uint256 totalShares;        // Total token supply at distribution time
        uint256 claimedAmount;      // Total amount claimed so far
        mapping(address => bool) claimed;  // Track who has claimed
    }

    Distribution[] public distributions;

    // Track total dividends claimed by each address across all distributions
    mapping(address => uint256) public totalClaimed;

    event DividendDistributed(uint256 indexed distributionId, uint256 amount, uint256 totalShares);
    event DividendClaimed(uint256 indexed distributionId, address indexed holder, uint256 amount);
    event EmergencyWithdraw(address indexed owner, uint256 amount);

    /**
     * @notice Creates a new dividend distributor
     * @param _token Address of the property token (ATS equity token)
     */
    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        propertyToken = IERC20(_token);
    }

    /**
     * @notice Create a new dividend distribution (owner only)
     * @dev Snapshots the current token supply and distributes proportionally
     */
    function createDistribution() external payable onlyOwner {
        require(msg.value > 0, "Must send HBAR for distribution");

        uint256 totalShares = propertyToken.totalSupply();
        require(totalShares > 0, "No tokens in circulation");

        uint256 distributionId = distributions.length;

        Distribution storage dist = distributions.push();
        dist.totalAmount = msg.value;
        dist.timestamp = block.timestamp;
        dist.totalShares = totalShares;
        dist.claimedAmount = 0;

        emit DividendDistributed(distributionId, msg.value, totalShares);
    }

    /**
     * @notice Claim dividend for a specific distribution
     * @param distributionId The ID of the distribution to claim from
     */
    function claimDividend(uint256 distributionId) external nonReentrant {
        require(distributionId < distributions.length, "Invalid distribution ID");
        Distribution storage dist = distributions[distributionId];
        require(!dist.claimed[msg.sender], "Already claimed");

        uint256 holderShares = propertyToken.balanceOf(msg.sender);
        require(holderShares > 0, "No shares owned");

        // Calculate proportional dividend
        uint256 dividend = (dist.totalAmount * holderShares) / dist.totalShares;
        require(dividend > 0, "No dividend to claim");

        // Update state before transfer (CEI pattern)
        dist.claimed[msg.sender] = true;
        dist.claimedAmount += dividend;
        totalClaimed[msg.sender] += dividend;

        // Transfer dividend
        (bool success, ) = payable(msg.sender).call{value: dividend}("");
        require(success, "Dividend transfer failed");

        emit DividendClaimed(distributionId, msg.sender, dividend);
    }

    /**
     * @notice Claim dividends from multiple distributions at once
     * @param distributionIds Array of distribution IDs to claim from
     */
    function claimMultipleDividends(uint256[] calldata distributionIds) external nonReentrant {
        require(distributionIds.length > 0, "No distributions specified");
        require(distributionIds.length <= 50, "Too many distributions");

        uint256 totalDividend = 0;
        uint256 holderShares = propertyToken.balanceOf(msg.sender);
        require(holderShares > 0, "No shares owned");

        for (uint256 i = 0; i < distributionIds.length; i++) {
            uint256 distributionId = distributionIds[i];
            require(distributionId < distributions.length, "Invalid distribution ID");

            Distribution storage dist = distributions[distributionId];

            if (!dist.claimed[msg.sender]) {
                uint256 dividend = (dist.totalAmount * holderShares) / dist.totalShares;

                if (dividend > 0) {
                    dist.claimed[msg.sender] = true;
                    dist.claimedAmount += dividend;
                    totalDividend += dividend;

                    emit DividendClaimed(distributionId, msg.sender, dividend);
                }
            }
        }

        require(totalDividend > 0, "No dividends to claim");

        totalClaimed[msg.sender] += totalDividend;

        (bool success, ) = payable(msg.sender).call{value: totalDividend}("");
        require(success, "Dividend transfer failed");
    }

    /**
     * @notice Check if an address has claimed from a specific distribution
     * @param distributionId The distribution ID to check
     * @param holder The address to check
     */
    function hasClaimed(uint256 distributionId, address holder) external view returns (bool) {
        require(distributionId < distributions.length, "Invalid distribution ID");
        return distributions[distributionId].claimed[holder];
    }

    /**
     * @notice Calculate claimable dividend for an address from a specific distribution
     * @param distributionId The distribution ID
     * @param holder The address to check
     */
    function getClaimableDividend(uint256 distributionId, address holder) external view returns (uint256) {
        require(distributionId < distributions.length, "Invalid distribution ID");
        Distribution storage dist = distributions[distributionId];

        if (dist.claimed[holder]) {
            return 0;
        }

        uint256 holderShares = propertyToken.balanceOf(holder);
        if (holderShares == 0) {
            return 0;
        }

        return (dist.totalAmount * holderShares) / dist.totalShares;
    }

    /**
     * @notice Get total number of distributions
     */
    function getDistributionCount() external view returns (uint256) {
        return distributions.length;
    }

    /**
     * @notice Get distribution details
     * @param distributionId The distribution ID
     */
    function getDistribution(uint256 distributionId) external view returns (
        uint256 totalAmount,
        uint256 timestamp,
        uint256 totalShares,
        uint256 claimedAmount
    ) {
        require(distributionId < distributions.length, "Invalid distribution ID");
        Distribution storage dist = distributions[distributionId];
        return (dist.totalAmount, dist.timestamp, dist.totalShares, dist.claimedAmount);
    }

    /**
     * @notice Emergency withdraw unclaimed funds (owner only)
     * @dev Should only be used in emergency situations
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit EmergencyWithdraw(owner(), balance);
    }
}
