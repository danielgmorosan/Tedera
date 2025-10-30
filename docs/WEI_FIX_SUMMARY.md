# PropertySale Contract Wei Calculation Fix

## What Was Fixed

The `PropertySale` contract has been updated to follow **blockchain standards** for handling ERC20 tokens with 18 decimals.

### The Problem

The original contract calculated the purchase cost incorrectly:
```solidity
uint256 cost = shares * pricePerShare;
```

When:
- `shares` = 1 whole token = 10^18 wei (ERC20 standard with 18 decimals)
- `pricePerShare` = 100 HBAR = 100 × 10^18 wei

The calculation resulted in:
```
cost = 10^18 × (100 × 10^18) = 100 × 10^36 wei
```

This astronomical value caused "Insufficient payment" errors because no one could send that much HBAR!

### The Solution (Blockchain Standard)

The contract now correctly implements the ERC20 decimal standard:

```solidity
// Standard ERC20 decimal handling
uint256 cost = (shares * pricePerShare) / 1e18;
```

With the same values:
```
cost = (10^18 × 100 × 10^18) / 10^18 = 100 × 10^18 wei = 100 HBAR ✅
```

## Files Modified

### 1. Smart Contract (Fixed)
- **File**: `packages/contracts/contracts/PropertySale.sol`
- **Changes**:
  - Line 71: Updated cost calculation to `(shares * pricePerShare) / 1e18`
  - Added clear comments explaining the ERC20 decimal handling
  - Updated documentation to clarify parameter meanings

### 2. Frontend (Already Correct)
The frontend code was already implementing the correct calculation:

- **`apps/web/components/create-property-form.tsx`** (Line 214):
  ```typescript
  const pricePerWholeTokenInWei = ethers.utils.parseEther(pricePerShare.toString());
  ```
  ✅ Passes price as wei per whole token

- **`apps/web/hooks/use-property-purchase.ts`** (Line 59):
  ```typescript
  const totalCost = sharesInWei.mul(pricePerWholeTokenInWei).div(ethers.utils.parseUnits('1', 18));
  ```
  ✅ Calculates cost the same way as the contract

## What You Need To Do

### ⚠️ IMPORTANT: You Must Redeploy Everything

Because smart contracts are **immutable** (cannot be changed after deployment), you need to create new tokens and properties:

1. **Clear your browser cache** and refresh the page
2. **Create a new Equity Token** using the "Create Equity Token" tab
   - Example: 1000 shares → Contract mints 1000 × 10^18 wei of tokens to your wallet
3. **Create a new Property** using the "Create Property" tab
   - Use the token address from step 2
   - Example: Price = 100 HBAR → Contract stores 100 × 10^18 wei per whole token
4. **Buy shares** from the new property
   - Example: Buy 1 share → Cost = 100 HBAR ✅

### Testing Example

Let's say you create:
- **Token**: 1000 total shares
- **Property**: 100 HBAR per share

When someone buys **1 whole share**:
```
Frontend sends:
  shares = 1 × 10^18 wei (1 whole token)
  value = 100 × 10^18 wei (100 HBAR)

Contract calculates:
  cost = (1 × 10^18 × 100 × 10^18) / 10^18 = 100 × 10^18 wei ✅
  
Buyer receives:
  1 × 10^18 wei of tokens (displayed as "1 share" in UI)
```

## Why This Is The Blockchain Standard

This approach is used across all major DeFi platforms (Uniswap, Aave, etc.) because:

1. **ERC20 tokens use 18 decimals by default** (like wei in Ethereum/Hedera)
2. **Prices are always "per whole token"** to avoid confusion
3. **Division by 10^18 converts from token wei to whole tokens**
4. **Enables fractional token purchases** (e.g., 0.5 tokens = 0.5 × 10^18 wei)

## Summary

✅ **Contract Fixed**: Now uses `(shares * pricePerShare) / 1e18`  
✅ **Frontend Already Correct**: Matches the contract calculation  
✅ **Contracts Compiled**: ABIs updated  
⚠️ **Action Required**: Deploy new tokens and properties to test  

---

Last Updated: October 29, 2025

