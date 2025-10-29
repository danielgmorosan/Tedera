// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PropertySale
 * @notice Manages the presale of property tokens (equity shares)
 * @dev Works with ERC-20 compatible tokens (including ATS equity tokens)
 */
contract PropertySale is Ownable, ReentrancyGuard {
    IERC20 public propertyToken;
    uint256 public pricePerShare; // Price in wei (tinybars on Hedera)
    uint256 public totalShares;
    uint256 public sharesSold;
    bool public saleActive;
    uint256 public saleEndTime; // Unix timestamp for sale deadline

    mapping(address => uint256) public purchased;

    event SharesPurchased(address indexed buyer, uint256 shares, uint256 amount);
    event SaleStatusChanged(bool active);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event PriceUpdated(uint256 newPrice);

    /**
     * @notice Creates a new property sale contract
     * @param _token Address of the property token (ATS equity token)
     * @param _pricePerShare Price per share in wei (tinybars)
     * @param _totalShares Total number of shares available for sale
     * @param _saleDuration Duration of the sale in seconds (0 for unlimited)
     */
    constructor(
        address _token,
        uint256 _pricePerShare,
        uint256 _totalShares,
        uint256 _saleDuration
    ) {
        require(_token != address(0), "Invalid token address");
        require(_pricePerShare > 0, "Price must be greater than 0");
        require(_totalShares > 0, "Total shares must be greater than 0");

        propertyToken = IERC20(_token);
        pricePerShare = _pricePerShare;
        totalShares = _totalShares;
        saleActive = true;

        if (_saleDuration > 0) {
            saleEndTime = block.timestamp + _saleDuration;
        }
    }

    /**
     * @notice Purchase property shares with HBAR
     * @param shares Number of shares to purchase
     */
    function buyShares(uint256 shares) external payable nonReentrant {
        require(saleActive, "Sale not active");
        require(shares > 0, "Must purchase at least 1 share");
        require(sharesSold + shares <= totalShares, "Not enough shares available");

        // Check sale deadline if set
        if (saleEndTime > 0) {
            require(block.timestamp <= saleEndTime, "Sale has ended");
        }

        uint256 cost = shares * pricePerShare;
        require(msg.value >= cost, "Insufficient payment");

        // Update state before external calls (CEI pattern)
        sharesSold += shares;
        purchased[msg.sender] += shares;

        // Transfer tokens to buyer
        require(
            propertyToken.transfer(msg.sender, shares),
            "Token transfer failed"
        );

        // Refund excess payment
        if (msg.value > cost) {
            (bool success, ) = msg.sender.call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }

        emit SharesPurchased(msg.sender, shares, cost);
    }

    /**
     * @notice Toggle sale active status (owner only)
     */
    function toggleSale() external onlyOwner {
        saleActive = !saleActive;
        emit SaleStatusChanged(saleActive);
    }

    /**
     * @notice Update price per share (owner only)
     * @param newPrice New price in wei (tinybars)
     */
    function updatePrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        pricePerShare = newPrice;
        emit PriceUpdated(newPrice);
    }

    /**
     * @notice Withdraw collected funds (owner only)
     */
    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(owner(), balance);
    }

    /**
     * @notice Get remaining shares available for purchase
     */
    function remainingShares() external view returns (uint256) {
        return totalShares - sharesSold;
    }

    /**
     * @notice Check if sale is currently active
     */
    function isSaleActive() external view returns (bool) {
        if (!saleActive) return false;
        if (saleEndTime > 0 && block.timestamp > saleEndTime) return false;
        if (sharesSold >= totalShares) return false;
        return true;
    }
}
