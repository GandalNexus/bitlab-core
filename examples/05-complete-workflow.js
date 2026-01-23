/**
 * Example 5: Complete Workflow
 * 
 * A comprehensive example showing the complete workflow from wallet
 * generation through transaction signing and broadcast preparation.
 */

import init, { 
  generate_private_key,
  derive_addresses_from_key,
  build_transaction,
  sign_transaction,
  calculate_txid,
  btc_to_satoshi,
  satoshi_to_btc
} from '../pkg/bitlab_wasm.js';

async function main() {
  await init();

  console.log('=== BitLab Complete Workflow Example ===\n');

  // Phase 1: Wallet Setup
  console.log('PHASE 1: Wallet Setup');
  console.log('─'.repeat(50));
  
  const privateKey = generate_private_key();
  const walletJson = derive_addresses_from_key(privateKey);
  const wallet = JSON.parse(walletJson);

  console.log(`Generated new wallet:`);
  console.log(`  Private Key: ${privateKey.substring(0, 16)}...`);
  console.log(`  Public Key: ${wallet.public_key.substring(0, 16)}...`);
  console.log(`  Address: ${wallet.addresses.legacy}\n`);

  // Phase 2: Transaction Planning
  console.log('PHASE 2: Transaction Planning');
  console.log('─'.repeat(50));

  const sendAmount = 0.25; // BTC
  const feeRate = 10; // sat/byte
  const estimatedTxSize = 250; // bytes
  
  const sendAmountSats = btc_to_satoshi(sendAmount);
  const feeSats = feeRate * estimatedTxSize;
  const totalSpend = sendAmountSats + feeSats;

  console.log(`Send Amount: ${sendAmount} BTC (${sendAmountSats} satoshis)`);
  console.log(`Fee Rate: ${feeRate} sat/byte`);
  console.log(`Estimated Size: ${estimatedTxSize} bytes`);
  console.log(`Estimated Fee: ${feeSats} satoshis (${satoshi_to_btc(feeSats)} BTC)`);
  console.log(`Total Spend: ${totalSpend} satoshis (${satoshi_to_btc(totalSpend)} BTC)\n`);

  // Phase 3: Transaction Construction
  console.log('PHASE 3: Transaction Construction');
  console.log('─'.repeat(50));

  const inputs = [
    {
      txid: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
      vout: 0,
      amount: btc_to_satoshi(1.0), // 1 BTC UTXO
      script_pubkey: '76a91462e907b15cbf27d5425399ebf6f0fb50ebb88f1888ac'
    }
  ];

  const recipientAddress = 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn';
  const changeAmount = inputs[0].amount - totalSpend;

  const outputs = [
    {
      address: recipientAddress,
      amount: sendAmountSats
    },
    {
      address: wallet.addresses.legacy, // Change back to sender
      amount: changeAmount
    }
  ];

  console.log(`Input: ${satoshi_to_btc(inputs[0].amount)} BTC`);
  console.log(`Output 1 (Recipient): ${satoshi_to_btc(sendAmountSats)} BTC`);
  console.log(`Output 2 (Change): ${satoshi_to_btc(changeAmount)} BTC`);
  console.log(`Fee: ${satoshi_to_btc(feeSats)} BTC\n`);

  const txHex = build_transaction(
    JSON.stringify(inputs),
    JSON.stringify(outputs),
    feeSats
  );

  console.log(`Unsigned Transaction: ${txHex.substring(0, 40)}...`);
  console.log(`Transaction Size: ${txHex.length / 2} bytes\n`);

  // Phase 4: Transaction Signing
  console.log('PHASE 4: Transaction Signing');
  console.log('─'.repeat(50));

  const signedTxHex = sign_transaction(
    txHex,
    privateKey,
    0,
    inputs[0].script_pubkey,
    inputs[0].amount
  );

  console.log(`Signed Transaction: ${signedTxHex.substring(0, 40)}...`);
  console.log(`Signed Size: ${signedTxHex.length / 2} bytes\n`);

  // Phase 5: Verification
  console.log('PHASE 5: Verification');
  console.log('─'.repeat(50));

  const txid = calculate_txid(signedTxHex);
  console.log(`Transaction ID: ${txid}`);
  console.log(`Status: Ready for broadcast\n`);

  // Summary
  console.log('SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Wallet Address: ${wallet.addresses.legacy}`);
  console.log(`Transaction ID: ${txid}`);
  console.log(`Amount Sent: ${sendAmount} BTC`);
  console.log(`Fee Paid: ${satoshi_to_btc(feeSats)} BTC`);
  console.log(`Change Returned: ${satoshi_to_btc(changeAmount)} BTC`);
}

main().catch(console.error);
