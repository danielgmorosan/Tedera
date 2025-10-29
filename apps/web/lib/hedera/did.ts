/**
 * Hedera Decentralized Identity (DID) Implementation
 *
 * This module provides DID functionality for the Tedera platform.
 * DIDs are created using the W3C DID standard with Hedera-specific identifiers.
 *
 * Format: did:hedera:testnet:{accountId}
 * Example: did:hedera:testnet:0.0.123456
 */

import { ethers } from 'ethers';

/**
 * Create a DID identifier from a Hedera account ID
 * This follows the W3C DID standard format
 */
export function createDIDIdentifier(accountId: string): string {
  // Validate account ID format (should be x.x.x)
  if (!/^\d+\.\d+\.\d+$/.test(accountId)) {
    throw new Error(`Invalid Hedera account ID format: ${accountId}`);
  }

  // Format: did:hedera:testnet:accountId
  return `did:hedera:testnet:${accountId}`;
}

/**
 * Create a DID document for a user
 * This creates a W3C-compliant DID document that can be stored on-chain
 */
export async function createDIDDocument(
  accountId: string,
  evmAddress: string
): Promise<{
  did: string;
  didDocument: any;
}> {
  const did = createDIDIdentifier(accountId);

  // Create W3C DID Document
  const didDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        blockchainAccountId: `eip155:296:${evmAddress}`, // Hedera testnet chain ID is 296
      }
    ],
    authentication: [`${did}#key-1`],
    assertionMethod: [`${did}#key-1`],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  return {
    did,
    didDocument,
  };
}

/**
 * Verify wallet ownership by checking signature
 * This proves that the user controls the wallet associated with their DID
 */
export async function verifyWalletSignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    // Check if it matches the expected address
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Create a challenge message for wallet signature
 * This is used to prove wallet ownership during authentication
 */
export function createAuthChallenge(accountId: string): string {
  const timestamp = Date.now();
  return `Sign this message to authenticate with Tedera.\n\nAccount: ${accountId}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any fees.`;
}



