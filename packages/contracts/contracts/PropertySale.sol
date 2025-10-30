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
    uint256 public pricePerShare; // Price in wei per whole token (1e18 token wei = 1 whole token)
    uint256 public totalShares;
    uint256 public sharesSold;
    bool public saleActive;
    uint256 public saleEndTime; // Unix timestamp for sale deadline

    mapping(address => uint256) public purchased;

    event SharesPurchased(address indexed buyer, uint256 shares, uint256 amount);
    event SaleStatusChanged(bool active);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event PriceUpdated(uint256 newPrice);

    // Custom errors for clearer, gas-efficient failures
    error InvalidShares();
    error InventoryUnavailable(uint256 available, uint256 requested);
    error InsufficientPayment(uint256 required, uint256 sent);
    error SaleEnded();
    error SaleNotActive();

    /**
     * @notice Creates a new property sale contract
     * @param _token Address of the property token (ATS equity token)
     * @param _pricePerShare Price in wei (HBAR) per whole token (accounts for 18 decimals)
     * @param _totalShares Total number of shares available for sale (in token wei, with 18 decimals)
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
        // Ensure totalShares respects ERC20 18-decimal standard and at least 1 whole token
        require(_totalShares % 1e18 == 0, "totalShares must be in 18 decimals");
        require(_totalShares >= 1e18, "totalShares must be >= 1 token");

        propertyToken = IERC20(_token);
        pricePerShare = _pricePerShare;
        totalShares = _totalShares;
        saleActive = true;

        if (_saleDuration > 0) {
            saleEndTime = block.timestamp + _saleDuration;
        }
    }

    /// @notice Quote exact HBAR needed for `shares` (shares in token wei)
    function quoteCost(uint256 shares) public view returns (uint256) {
        if (shares == 0 || shares % 1e18 != 0) revert InvalidShares();
        return (shares * pricePerShare) / 1e18;
    }

    /**
     * @notice Purchase property shares with HBAR
     * @param shares Number of shares to purchase (in token wei, i.e., with 18 decimals)
     */
    function buyShares(uint256 shares) external payable nonReentrant {
        if (!saleActive) revert SaleNotActive();
        if (shares == 0 || shares % 1e18 != 0) revert InvalidShares();
        if (saleEndTime > 0 && block.timestamp > saleEndTime) revert SaleEnded();
        if (sharesSold + shares > totalShares) {
            revert InventoryUnavailable(totalShares - sharesSold, shares);
        }

        // Ensure contract holds enough inventory
        uint256 inventory = propertyToken.balanceOf(address(this));
        if (inventory < shares) revert InventoryUnavailable(inventory, shares);

        uint256 cost = (shares * pricePerShare) / 1e18;
        if (msg.value < cost) revert InsufficientPayment(cost, msg.value);

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
     * @param newPrice New price in wei (HBAR) per whole token
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
