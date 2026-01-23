# BitLab API Reference

Complete API documentation for BitLab WASM library.

## Initialization

### `init()`

Initializes the WASM module. Must be called before using any other functions.

```javascript
import init from './pkg/bitlab_wasm.js';

await init();
```

**Returns**: Promise that resolves when the module is ready.

---

## Wallet Module

### `generate_private_key()`

Generates a cryptographically secure random private key.

```javascript
const privateKey = generate_private_key();
// Returns: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6"
```

**Returns**: String - 64-character hexadecimal string representing a 32-byte private key.

**Throws**: JsValue - If random number generation fails.

**Security Note**: This function uses system entropy. The returned key should be stored securely and never logged or transmitted insecurely.

---

### `derive_addresses_from_key(private_key_hex)`

Derives wallet addresses and public key from a private key.

```javascript
const walletJson = derive_addresses_from_key(privateKey);
const wallet = JSON.parse(walletJson);

console.log(wallet);
// {
//   private_key: "a1b2c3d4...",
//   public_key: "02a1b2c3d4...",
//   addresses: {
//     legacy: "mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn",
//     segwit: "mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn",
//     taproot: "mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn"
//   }
// }
```

**Parameters**:
- `private_key_hex` (string): 64-character hexadecimal string from `generate_private_key()`.

**Returns**: String - JSON-serialized KeyPair object containing:
- `private_key`: The input private key (hex string)
- `public_key`: Derived public key (hex string)
- `addresses`: Object with three address formats:
  - `legacy`: P2PKH address (starts with 'm' or 'n' on testnet)
  - `segwit`: P2WPKH address (starts with '2' on testnet)
  - `taproot`: P2TR address (starts with 'tb1' on testnet)

**Throws**: JsValue - If private key is invalid or not 32 bytes.

**Note**: Currently generates Testnet addresses. Mainnet support is planned.

---

## Transaction Module

### `build_transaction(inputs_json, outputs_json, fee_sat)`

Constructs an unsigned Bitcoin transaction.

```javascript
const inputs = [
  {
    txid: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
    vout: 0,
    amount: 50000000,
    script_pubkey: "76a91462e907b15cbf27d5425399ebf6f0fb50ebb88f1888ac"
  }
];

const outputs = [
  {
    address: "mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn",
    amount: 49000000
  }
];

const txHex = build_transaction(
  JSON.stringify(inputs),
  JSON.stringify(outputs),
  1000000
);
```

**Parameters**:
- `inputs_json` (string): JSON array of transaction inputs (UTXOs to spend)
  - `txid` (string): Previous transaction ID (64-char hex)
  - `vout` (number): Output index in previous transaction
  - `amount` (number): Amount in satoshis
  - `script_pubkey` (string): Previous output script (hex)
- `outputs_json` (string): JSON array of transaction outputs
  - `address` (string): Recipient Bitcoin address
  - `amount` (number): Amount in satoshis
- `fee_sat` (number): Transaction fee in satoshis (currently unused, for future fee calculation)

**Returns**: String - Serialized transaction in hexadecimal format.

**Throws**: JsValue - If JSON is invalid, addresses are malformed, or serialization fails.

**Important**: The returned transaction is unsigned. Use `sign_transaction()` to authorize spending.

---

### `sign_transaction(tx_hex, private_key_hex, input_index, script_pubkey_hex, satoshi_value)`

Signs a transaction input with ECDSA signature.

```javascript
const signedTxHex = sign_transaction(
  txHex,
  privateKey,
  0,
  "76a91462e907b15cbf27d5425399ebf6f0fb50ebb88f1888ac",
  50000000
);
```

**Parameters**:
- `tx_hex` (string): Unsigned transaction from `build_transaction()` (hex)
- `private_key_hex` (string): Private key from `generate_private_key()` (hex)
- `input_index` (number): Index of the input to sign (0-based)
- `script_pubkey_hex` (string): Script pubkey of the input being signed (hex)
- `satoshi_value` (number): Amount of the input in satoshis

**Returns**: String - Signed transaction in hexadecimal format.

**Throws**: JsValue - If private key is invalid, transaction is malformed, or signing fails.

**Security Note**: Signing authorizes spending of the input. Verify transaction details before signing.

**Limitation**: Currently implements basic ECDSA signing. Multi-signature and Taproot signing are planned.

---

### `calculate_txid(tx_hex)`

Computes the transaction ID (double SHA-256 hash) of a serialized transaction.

```javascript
const txid = calculate_txid(signedTxHex);
// Returns: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1"
```

**Parameters**:
- `tx_hex` (string): Serialized transaction (hex)

**Returns**: String - Transaction ID (64-character hex string).

**Throws**: JsValue - If transaction hex is invalid or deserialization fails.

**Note**: Transaction ID is computed from the serialized transaction bytes. For SegWit transactions, this is the wtxid (witness transaction ID).

---

## Unit Conversion Module

### `btc_to_satoshi(btc)`

Converts Bitcoin (BTC) to satoshis.

```javascript
const sats = btc_to_satoshi(0.5);
// Returns: 50000000
```

**Parameters**:
- `btc` (number): Amount in Bitcoin

**Returns**: Number - Amount in satoshis (1 BTC = 100,000,000 satoshis)

**Note**: Uses floating-point arithmetic. For precise calculations, consider rounding.

---

### `satoshi_to_btc(satoshi)`

Converts satoshis to Bitcoin (BTC).

```javascript
const btc = satoshi_to_btc(50000000);
// Returns: 0.5
```

**Parameters**:
- `satoshi` (number): Amount in satoshis

**Returns**: Number - Amount in Bitcoin

**Note**: Uses floating-point arithmetic. Results may have precision limitations for very large amounts.

---

## Utility Functions

### `test_wasm()`

Tests that the WASM module is loaded and functional.

```javascript
const message = test_wasm();
// Returns: "BitLab WASM module loaded successfully!"
```

**Returns**: String - Confirmation message.

**Use Case**: Verify module initialization in tests or debugging.

---

## Error Handling

All functions that can fail return a Result type, converted to JavaScript exceptions:

```javascript
try {
  const wallet = derive_addresses_from_key("invalid_key");
} catch (error) {
  console.error("Error:", error.message);
  // Error: Invalid private key hex: ...
}
```

Common error messages:

- "Invalid private key hex: ..." - Private key is not valid hexadecimal
- "Private key must be 32 bytes" - Private key is not 32 bytes (64 hex characters)
- "Invalid secret key: ..." - Private key cannot be used for cryptographic operations
- "Invalid address: ..." - Bitcoin address is malformed
- "Invalid tx hex: ..." - Transaction hex is not valid hexadecimal
- "Failed to deserialize tx: ..." - Transaction cannot be parsed

---

## Type Definitions

### KeyPair

```typescript
interface KeyPair {
  private_key: string;      // 64-char hex string
  public_key: string;       // Compressed public key (hex)
  addresses: {
    legacy: string;         // P2PKH address
    segwit: string;         // P2WPKH address
    taproot: string;        // P2TR address
  };
}
```

### TransactionInput

```typescript
interface TransactionInput {
  txid: string;             // 64-char hex string
  vout: number;             // Output index
  amount: number;           // Satoshis
  script_pubkey: string;    // Hex string
}
```

### TransactionOutput

```typescript
interface TransactionOutput {
  address: string;          // Bitcoin address
  amount: number;           // Satoshis
}
```

---

## Best Practices

1. **Always initialize**: Call `init()` before using any functions.
2. **Validate inputs**: Check that addresses and transaction IDs are valid before passing to functions.
3. **Handle errors**: Wrap function calls in try-catch blocks.
4. **Secure key storage**: Never store private keys in plain text or local storage.
5. **Verify before signing**: Always inspect transaction details before calling `sign_transaction()`.
6. **Use testnet first**: Test your application on Bitcoin Testnet before using Mainnet.

---

## Examples

See the `examples/` directory for complete working examples:

- `01-wallet-generation.js` - Generate wallets and derive addresses
- `02-unit-conversion.js` - Convert between BTC and satoshis
- `03-transaction-building.js` - Construct transactions
- `04-transaction-signing.js` - Sign transactions
- `05-complete-workflow.js` - End-to-end workflow
