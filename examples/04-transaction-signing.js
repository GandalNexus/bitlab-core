/**
 * Example 4: Transaction Signing
 * 
 * Demonstrates how to sign a Bitcoin transaction with a private key.
 * This is the critical step that authorizes spending of UTXOs.
 */

import init, { 
  generate_private_key,
  derive_addresses_from_key,
  build_transaction,
  sign_transaction,
  calculate_txid
} from '../pkg/bitlab_wasm.js';

async function main() {
  await init();

  console.log('=== BitLab Transaction Signing Example ===\n');

  // Step 1: Generate a private key
  console.log('Step 1: Generating private key...');
  const privateKey = generate_private_key();
  console.log(`Private Key: ${privateKey}\n`);

  // Step 2: Derive wallet addresses
  console.log('Step 2: Deriving wallet addresses...');
  const walletJson = derive_addresses_from_key(privateKey);
  const wallet = JSON.parse(walletJson);
  console.log(`Address: ${wallet.addresses.legacy}\n`);

  // Step 3: Create a transaction to sign
  console.log('Step 3: Building transaction...');
  const inputs = [
    {
      txid: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
      vout: 0,
      amount: 50000000,
      script_pubkey: '76a91462e907b15cbf27d5425399ebf6f0fb50ebb88f1888ac'
    }
  ];

  const outputs = [
    {
      address: 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn',
      amount: 49000000
    }
  ];

  const txHex = build_transaction(
    JSON.stringify(inputs),
    JSON.stringify(outputs),
    1000000
  );

  console.log(`Unsigned Transaction: ${txHex.substring(0, 50)}...\n`);

  // Step 4: Sign the transaction
  console.log('Step 4: Signing transaction...');
  const signedTxHex = sign_transaction(
    txHex,
    privateKey,
    0, // input index
    inputs[0].script_pubkey,
    inputs[0].amount
  );

  console.log(`Signed Transaction: ${signedTxHex.substring(0, 50)}...\n`);

  // Step 5: Calculate transaction ID
  console.log('Step 5: Calculating transaction ID...');
  const txid = calculate_txid(signedTxHex);
  console.log(`Transaction ID: ${txid}`);
  console.log('\nTransaction is now ready for broadcast to the Bitcoin network.');
}

main().catch(console.error);
