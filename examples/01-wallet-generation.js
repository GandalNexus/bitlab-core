/**
 * Example 1: Wallet Generation
 * 
 * Demonstrates how to generate a new Bitcoin wallet with private key
 * and derive multiple address formats from a single key.
 */

import init, { 
  generate_private_key, 
  derive_addresses_from_key 
} from '../pkg/bitlab_wasm.js';

async function main() {
  // Initialize the WASM module
  await init();

  console.log('=== BitLab Wallet Generation Example ===\n');

  // Step 1: Generate a new private key
  console.log('Step 1: Generating a new private key...');
  const privateKey = generate_private_key();
  console.log(`Private Key (hex): ${privateKey}\n`);

  // Step 2: Derive addresses from the private key
  console.log('Step 2: Deriving addresses from private key...');
  const walletJson = derive_addresses_from_key(privateKey);
  const wallet = JSON.parse(walletJson);

  console.log('Wallet Details:');
  console.log(`  Private Key: ${wallet.private_key}`);
  console.log(`  Public Key: ${wallet.public_key}`);
  console.log(`  Legacy Address (P2PKH): ${wallet.addresses.legacy}`);
  console.log(`  SegWit Address (P2WPKH): ${wallet.addresses.segwit}`);
  console.log(`  Taproot Address (P2TR): ${wallet.addresses.taproot}\n`);

  // Step 3: Generate multiple wallets
  console.log('Step 3: Generating multiple wallets...');
  for (let i = 0; i < 3; i++) {
    const key = generate_private_key();
    const w = JSON.parse(derive_addresses_from_key(key));
    console.log(`Wallet ${i + 1}: ${w.addresses.legacy}`);
  }
}

main().catch(console.error);
