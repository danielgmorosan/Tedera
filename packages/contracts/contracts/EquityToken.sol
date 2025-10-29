// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EquityToken
 * @dev ERC-20 compliant equity token with additional features for security tokens
 * Compatible with Hedera and EVM networks
 * 
 * Features:
 * - ERC-20 standard compliance for maximum compatibility
 * - Ownership controls for issuer management
 * - Transfer restrictions (can be enabled/disabled)
 * - Pauseable transfers for regulatory compliance
 * - Metadata for token details (ISIN, rights, etc.)
 */
contract EquityToken is ERC20, Ownable {
    
    // Token metadata
    string public isin;
    uint256 public nominalValue;
    string public currency;
    
    // Rights associated with the token
    bool public votingRight;
    bool public informationRight;
    bool public liquidationRight;
    bool public subscriptionRight;
    bool public conversionRight;
    bool public redemptionRight;
    bool public putRight;
    bool public dividendRight;
    
    // Control flags
    bool public transfersEnabled;
    bool public isControllable;
    
    // Events
    event TransfersEnabled();
    event TransfersDisabled();
    event ControlRenounced();
    
    /**
     * @dev Constructor
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param totalSupply_ Total supply of tokens
     * @param isin_ ISIN code
     * @param nominalValue_ Nominal value per share
     * @param currency_ Currency code
     * @param rights_ Array of boolean rights [voting, information, liquidation, subscription, conversion, redemption, put, dividend]
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_,
        string memory isin_,
        uint256 nominalValue_,
        string memory currency_,
        bool[8] memory rights_
    ) ERC20(name_, symbol_) Ownable() {
        isin = isin_;
        nominalValue = nominalValue_;
        currency = currency_;
        
        votingRight = rights_[0];
        informationRight = rights_[1];
        liquidationRight = rights_[2];
        subscriptionRight = rights_[3];
        conversionRight = rights_[4];
        redemptionRight = rights_[5];
        putRight = rights_[6];
        dividendRight = rights_[7];
        
        transfersEnabled = true;
        isControllable = true;
        
        // Mint total supply to contract deployer (issuer)
        _mint(msg.sender, totalSupply_);
    }
    
    /**
     * @dev Override transfer to add transfer restrictions
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        require(transfersEnabled, "Transfers are disabled");
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to add transfer restrictions
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        require(transfersEnabled, "Transfers are disabled");
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Enable transfers
     */
    function enableTransfers() external onlyOwner {
        transfersEnabled = true;
        emit TransfersEnabled();
    }
    
    /**
     * @dev Disable transfers
     */
    function disableTransfers() external onlyOwner {
        transfersEnabled = false;
        emit TransfersDisabled();
    }
    
    /**
     * @dev Renounce control - makes token fully decentralized
     * This action is irreversible
     */
    function renounceControl() external onlyOwner {
        isControllable = false;
        transfersEnabled = true;
        emit ControlRenounced();
    }
    
    /**
     * @dev Force transfer (only if controllable)
     * Allows issuer to force transfers for regulatory compliance
     */
    function forceTransfer(
        address from,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(isControllable, "Token is not controllable");
        _transfer(from, to, amount);
    }
    
    /**
     * @dev Mint new tokens (only if controllable)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(isControllable, "Token is not controllable");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens (only if controllable)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        require(isControllable, "Token is not controllable");
        _burn(from, amount);
    }
    
    /**
     * @dev Get token metadata
     */
    function getMetadata() external view returns (
        string memory _isin,
        uint256 _nominalValue,
        string memory _currency,
        bool[8] memory _rights
    ) {
        return (
            isin,
            nominalValue,
            currency,
            [
                votingRight,
                informationRight,
                liquidationRight,
                subscriptionRight,
                conversionRight,
                redemptionRight,
                putRight,
                dividendRight
            ]
        );
    }
}

