/**
 * Example 3: Transaction Building
 * 
 * Demonstrates how to construct an unsigned Bitcoin transaction
 * with multiple inputs and outputs.
 */

import init, { 
  build_transaction,
  calculate_txid
} from '../pkg/bitlab_wasm.js';

async function main() {
  await init();

  console.log('=== BitLab Transaction Building Example ===\n');

  // Define transaction inputs (UTXOs to spend)
  const inputs = [
    {
      txid: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
      vout: 0,
      amount: 50000000, // 0.5 BTC in satoshis
      script_pubkey: '76a91462e907b15cbf27d5425399ebf6f0fb50ebb88f1888ac'
    },
    {
      txid: 'def456abc123def456abc123def456abc123def456abc123def456abc123def4',
      vout: 1,
      amount: 30000000, // 0.3 BTC in satoshis
      script_pubkey: '76a91462e907b15cbf27d5425399ebf6f0fb50ebb88f1888ac'
    }
  ];

  // Define transaction outputs (recipients)
  const outputs = [
    {
      address: 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', // Testnet address
      amount: 70000000 // 0.7 BTC in satoshis
    },
    {
      address: 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn',
      amount: 9000000 // 0.09 BTC in satoshis (change)
    }
  ];

  const feeInSatoshis = 1000000; // 0.01 BTC

  console.log('Transaction Inputs:');
  inputs.forEach((input, idx) => {
    console.log(`  Input ${idx}: ${input.amount} satoshis from UTXO ${input.txid}:${input.vout}`);
  });

  console.log('\nTransaction Outputs:');
  outputs.forEach((output, idx) => {
    console.log(`  Output ${idx}: ${output.amount} satoshis to ${output.address}`);
  });

  console.log(`\nFee: ${feeInSatoshis} satoshis`);

  // Build the transaction
  console.log('\nBuilding transaction...');
  const txHex = build_transaction(
    JSON.stringify(inputs),
    JSON.stringify(outputs),
    feeInSatoshis
  );

  console.log(`\nUnsigned Transaction (hex):\n${txHex}\n`);

  // Calculate transaction ID
  console.log('Calculating transaction ID...');
  const txid = calculate_txid(txHex);
  console.log(`Transaction ID: ${txid}`);
}

main().catch(console.error);
