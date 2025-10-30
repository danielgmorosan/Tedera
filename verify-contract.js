// Quick script to verify if a PropertySale contract has the fix
const ethers = require('ethers');

// Connect to Hedera testnet
const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');

async function verifyContract(contractAddress) {
  console.log('\n🔍 Checking contract:', contractAddress);
  console.log('='.repeat(60));
  
  try {
    // Get the contract bytecode
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x') {
      console.log('❌ No contract found at this address!');
      return;
    }
    
    console.log('✅ Contract exists');
    console.log('📦 Bytecode length:', code.length, 'characters');
    
    // Check if bytecode contains the division by 1e18 (0xde0b6b3a764000)
    // This is the hex representation of 1000000000000000000
    const hasFix = code.includes('670de0b6b3a7640000');
    
    if (hasFix) {
      console.log('✅ Contract HAS the fix (divides by 1e18)');
      console.log('   This contract should work correctly!');
    } else {
      console.log('❌ Contract DOES NOT have the fix');
      console.log('   This is an OLD contract deployed before the fix.');
      console.log('   You MUST deploy a new property to use the fixed version.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get contract address from command line
const contractAddress = process.argv[2];

if (!contractAddress) {
  console.log('\n📝 Usage: node verify-contract.js <PropertySale_contract_address>');
  console.log('\nExample:');
  console.log('  node verify-contract.js 0x1234567890abcdef...');
  process.exit(1);
}

verifyContract(contractAddress);

