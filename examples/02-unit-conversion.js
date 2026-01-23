/**
 * Example 2: Unit Conversion
 * 
 * Demonstrates conversion between BTC and satoshis, the fundamental
 * unit of Bitcoin (1 BTC = 100,000,000 satoshis).
 */

import init, { 
  btc_to_satoshi, 
  satoshi_to_btc 
} from '../pkg/bitlab_wasm.js';

async function main() {
  await init();

  console.log('=== BitLab Unit Conversion Example ===\n');

  // Convert BTC to satoshis
  console.log('Converting BTC to Satoshis:');
  const amounts = [0.001, 0.01, 0.1, 1.0, 10.0];
  
  amounts.forEach(btc => {
    const sats = btc_to_satoshi(btc);
    console.log(`  ${btc} BTC = ${sats} satoshis`);
  });

  console.log('\nConverting Satoshis to BTC:');
  const satoshiAmounts = [1000, 10000, 100000, 1000000, 100000000];
  
  satoshiAmounts.forEach(sats => {
    const btc = satoshi_to_btc(sats);
    console.log(`  ${sats} satoshis = ${btc} BTC`);
  });

  // Practical example: Calculate transaction fee
  console.log('\nPractical Example: Transaction Fee Calculation');
  const feeRateSatsPerByte = 10;
  const txSizeBytes = 250;
  const totalFeeSats = feeRateSatsPerByte * txSizeBytes;
  const totalFeeBtc = satoshi_to_btc(totalFeeSats);
  
  console.log(`  Fee rate: ${feeRateSatsPerByte} sat/byte`);
  console.log(`  Transaction size: ${txSizeBytes} bytes`);
  console.log(`  Total fee: ${totalFeeSats} satoshis (${totalFeeBtc} BTC)`);
}

main().catch(console.error);
