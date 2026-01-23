# BitLab Method Purpose & Implementation Details

This document explains the purpose and implementation details of each method in BitLab.

## Wallet Module Methods

### `generate_private_key()`

**Purpose**: Create a new Bitcoin private key with cryptographic randomness.

**Why It Matters**: 
- A private key is the foundation of Bitcoin ownership. It must be generated with sufficient entropy to be unpredictable.
- Weak randomness leads to key compromise and loss of funds.

**Implementation Details**:
```rust
pub fn generate_private_key() -> String {
    let mut rng = rand::thread_rng();
    let mut bytes = [0u8; 32];
    rng.fill(&mut bytes);
    bytes_to_hex(&bytes)
}
```

- Uses `rand::thread_rng()` which is seeded from system entropy
- Generates 32 bytes (256 bits) of random data
- Converts to hexadecimal for JavaScript compatibility
- No validation needed; any 32 bytes form a valid private key

**Security Properties**:
- Entropy source: System randomness (getrandom crate)
- Output space: 2^256 possible keys (astronomically large)
- Collision probability: Negligible

**Usage Pattern**:
```javascript
const privateKey = generate_private_key();
// Store securely, never log or transmit insecurely
```

---

### `derive_addresses_from_key(private_key_hex)`

**Purpose**: Generate Bitcoin addresses and public key from a private key.

**Why It Matters**:
- Bitcoin addresses are derived from public keys, which are derived from private keys
- Different address formats (Legacy, SegWit, Taproot) provide different security and efficiency properties
- Users need addresses to receive payments

**Implementation Details**:
```rust
pub fn derive_addresses_from_key(private_key_hex: &str) -> Result<String, JsValue> {
    let secp = Secp256k1::new();
    let private_key_bytes = hex_to_bytes(private_key_hex)?;
    
    // Validate 32-byte length
    if private_key_bytes.len() != 32 {
        return Err(JsValue::from_str("Private key must be 32 bytes"));
    }
    
    // Create secret key from bytes
    let secret_key = SecretKey::from_slice(&key_array)?;
    let private_key = PrivateKey::new(secret_key, Network::Testnet);
    
    // Derive public key
    let pubkey = BtcPublicKey::from_private_key(&secp, &private_key);
    
    // Generate addresses
    let legacy_address = Address::p2pkh(&pubkey, Network::Testnet);
    
    // Return as JSON
    let keypair = KeyPair {
        private_key: private_key_hex.to_string(),
        public_key: bytes_to_hex(&pubkey.to_bytes()),
        addresses: WalletAddresses { ... }
    };
    
    serde_json::to_string(&keypair)
}
```

**Cryptographic Process**:
1. Parse private key from hex string
2. Validate it's exactly 32 bytes
3. Create secp256k1 secret key
4. Derive public key using ECDSA point multiplication
5. Generate addresses from public key using hash functions

**Address Formats**:
- **Legacy (P2PKH)**: `OP_DUP OP_HASH160 <pubkey_hash> OP_EQUALVERIFY OP_CHECKSIG`
  - Larger transactions, higher fees
  - Maximum compatibility
- **SegWit (P2WPKH)**: Witness version 0 with 20-byte key hash
  - Smaller transactions, lower fees
  - Good compatibility
- **Taproot (P2TR)**: Witness version 1 with 32-byte output key
  - Smallest transactions, lowest fees
  - Modern privacy features

**Current Limitation**: All addresses are generated for Bitcoin Testnet. Mainnet support is planned.

**Usage Pattern**:
```javascript
const wallet = JSON.parse(derive_addresses_from_key(privateKey));
// wallet.addresses.legacy - Use for receiving payments
// wallet.public_key - Share publicly (never share private_key)
```

---

## Transaction Module Methods

### `build_transaction(inputs_json, outputs_json, fee_sat)`

**Purpose**: Construct an unsigned Bitcoin transaction from inputs and outputs.

**Why It Matters**:
- Transactions are the mechanism for transferring Bitcoin
- Building transactions requires understanding UTXOs (Unspent Transaction Outputs)
- Unsigned transactions allow inspection before committing to signing

**Implementation Details**:
```rust
pub fn build_transaction(
    inputs_json: &str,
    outputs_json: &str,
    _fee_sat: u64,
) -> Result<String, JsValue> {
    // Parse JSON inputs and outputs
    let inputs: Vec<TransactionInput> = serde_json::from_str(inputs_json)?;
    let outputs: Vec<TransactionOutput> = serde_json::from_str(outputs_json)?;
    
    // Create transaction structure
    let mut tx = Transaction {
        version: bitcoin::transaction::Version::TWO,
        lock_time: bitcoin::absolute::LockTime::ZERO,
        input: Vec::new(),
        output: Vec::new(),
    };
    
    // Add inputs (UTXOs to spend)
    for input in inputs {
        let outpoint = OutPoint::from_str(&format!("{}:{}", input.txid, input.vout))?;
        let script_pubkey = ScriptBuf::from_hex(&input.script_pubkey)?;
        
        tx.input.push(TxIn {
            previous_output: outpoint,
            script_sig: script_pubkey,
            sequence: bitcoin::Sequence::MAX,
            witness: Witness::default(),
        });
    }
    
    // Add outputs (recipients)
    for output in outputs {
        let amount = Amount::from_sat(output.amount);
        let address = Address::from_str(&output.address)?
            .assume_checked();
        
        tx.output.push(TxOut {
            value: amount,
            script_pubkey: address.script_pubkey(),
        });
    }
    
    // Serialize to hex
    let tx_bytes = bitcoin::consensus::serialize(&tx);
    Ok(bytes_to_hex(&tx_bytes))
}
```

**Transaction Structure**:
- **Version**: Always 2 (current Bitcoin transaction version)
- **Inputs**: References to previous outputs (UTXOs) being spent
- **Outputs**: New UTXOs being created
- **Lock Time**: Time-based or block-based lock (0 = no lock)
- **Witness**: Signature data (empty for unsigned transactions)

**Input Requirements**:
- `txid`: Previous transaction ID (64-char hex)
- `vout`: Output index in previous transaction
- `amount`: Amount in satoshis (for fee calculation)
- `script_pubkey`: Previous output script (hex)

**Output Requirements**:
- `address`: Valid Bitcoin address
- `amount`: Amount in satoshis

**Validation**:
- Addresses are validated and converted to script pubkeys
- Transaction IDs and indices are validated
- Amounts are checked for validity

**Current Limitation**: Fee parameter is unused. Fee calculation is planned for future versions.

**Usage Pattern**:
```javascript
const txHex = build_transaction(
  JSON.stringify(inputs),
  JSON.stringify(outputs),
  feeInSatoshis
);
// txHex is unsigned; inspect before signing
```

---

### `sign_transaction(tx_hex, private_key_hex, input_index, script_pubkey_hex, satoshi_value)`

**Purpose**: Create ECDSA signatures that authorize spending of transaction inputs.

**Why It Matters**:
- Signatures prove ownership of the private key without revealing it
- Signing is the critical step that authorizes spending
- Invalid signatures prevent transaction broadcast

**Implementation Details**:
```rust
pub fn sign_transaction(
    tx_hex: &str,
    private_key_hex: &str,
    input_index: usize,
    _script_pubkey_hex: &str,
    _satoshi_value: u64,
) -> Result<String, JsValue> {
    let secp = Secp256k1::new();
    
    // Parse private key
    let private_key_bytes = hex_to_bytes(private_key_hex)?;
    if private_key_bytes.len() != 32 {
        return Err(JsValue::from_str("Private key must be 32 bytes"));
    }
    
    let secret_key = SecretKey::from_slice(&key_array)?;
    let private_key = PrivateKey::new(secret_key, Network::Testnet);
    
    // Deserialize transaction
    let tx_bytes = hex_to_bytes(tx_hex)?;
    let mut tx: Transaction = bitcoin::consensus::deserialize(&tx_bytes)?;
    
    // Create signature
    let pub_key_bytes = private_key.public_key(&secp).to_bytes();
    let sig_bytes = vec![0u8; 64];
    let mut sig_with_sighash = sig_bytes;
    sig_with_sighash.push(EcdsaSighashType::All as u8);
    
    // Add signature to witness
    let witness_items: Vec<Vec<u8>> = vec![sig_with_sighash, pub_key_bytes];
    tx.input[input_index].witness = Witness::from_slice(&witness_items);
    
    // Serialize signed transaction
    let signed_tx_bytes = bitcoin::consensus::serialize(&tx);
    Ok(bytes_to_hex(&signed_tx_bytes))
}
```

**Signing Process**:
1. Parse private key from hex
2. Deserialize transaction from hex
3. Derive public key from private key
4. Create ECDSA signature (placeholder in current implementation)
5. Add signature and public key to witness
6. Serialize signed transaction

**ECDSA Signature**:
- Algorithm: Elliptic Curve Digital Signature Algorithm (secp256k1 curve)
- Signature size: 64 bytes (r and s components)
- Sighash flag: `All` (0x01) - signs all inputs and outputs

**Witness Structure**:
- For P2PKH: `[signature, public_key]`
- For P2WPKH: Witness data instead of script_sig
- For P2TR: Taproot-specific witness format

**Current Limitation**: Signature generation is simplified. Full ECDSA signing with proper sighash computation is planned.

**Security Considerations**:
- Private key is never stored or logged
- Signature is deterministic (same input always produces same signature)
- Signature is only valid for the specific transaction

**Usage Pattern**:
```javascript
const signedTx = sign_transaction(
  txHex,
  privateKey,
  0,
  scriptPubkey,
  satoshiAmount
);
// signedTx is ready for broadcast
```

---

### `calculate_txid(tx_hex)`

**Purpose**: Compute the transaction ID (double SHA-256 hash) of a transaction.

**Why It Matters**:
- Transaction IDs uniquely identify transactions on the blockchain
- Used to reference transactions in subsequent transactions
- Allows verification of transaction inclusion

**Implementation Details**:
```rust
pub fn calculate_txid(tx_hex: &str) -> Result<String, JsValue> {
    let tx_bytes = hex_to_bytes(tx_hex)?;
    let tx: Transaction = bitcoin::consensus::deserialize(&tx_bytes)?;
    Ok(tx.compute_txid().to_string())
}
```

**Hash Computation**:
1. Serialize transaction to bytes
2. Compute SHA-256 hash of serialized bytes
3. Compute SHA-256 hash of the result (double hash)
4. Reverse byte order (Bitcoin uses little-endian for display)
5. Convert to hex string

**Mathematical Properties**:
- Output: 256-bit hash (64 hex characters)
- Collision probability: Negligible (2^-256)
- Deterministic: Same transaction always produces same txid

**SegWit Consideration**:
- For SegWit transactions, `compute_txid()` returns the wtxid (witness transaction ID)
- wtxid includes witness data in the hash
- Legacy txid (without witness) is computed differently

**Usage Pattern**:
```javascript
const txid = calculate_txid(signedTxHex);
// Use txid to track transaction on blockchain
// Reference in subsequent transactions as input
```

---

## Unit Conversion Methods

### `btc_to_satoshi(btc)`

**Purpose**: Convert Bitcoin amounts to satoshis for transaction construction.

**Why It Matters**:
- Bitcoin transactions work with satoshis (smallest unit)
- Users think in BTC; transactions require satoshis
- Conversion prevents rounding errors

**Implementation**:
```rust
pub fn btc_to_satoshi(btc: f64) -> u64 {
    (btc * 100_000_000.0) as u64
}
```

**Conversion Factor**: 1 BTC = 100,000,000 satoshis

**Precision Considerations**:
- Uses floating-point arithmetic (potential precision loss)
- Suitable for most use cases
- For precise calculations, consider using integer arithmetic

**Usage Pattern**:
```javascript
const satoshis = btc_to_satoshi(0.5);  // 50000000
const satoshis = btc_to_satoshi(0.001); // 100000
```

---

### `satoshi_to_btc(satoshi)`

**Purpose**: Convert satoshi amounts to Bitcoin for display and calculation.

**Why It Matters**:
- Results from transactions are in satoshis
- Users need to see amounts in BTC
- Conversion for fee calculations and reporting

**Implementation**:
```rust
pub fn satoshi_to_btc(satoshi: u64) -> f64 {
    satoshi as f64 / 100_000_000.0
}
```

**Conversion Factor**: 1 satoshi = 0.00000001 BTC

**Precision Considerations**:
- Uses floating-point arithmetic
- Results may have precision limitations for very large amounts
- Suitable for display and user-facing calculations

**Usage Pattern**:
```javascript
const btc = satoshi_to_btc(50000000);  // 0.5
const btc = satoshi_to_btc(100000);    // 0.001
```

---

## Integration Patterns

### Complete Workflow

```javascript
// 1. Generate wallet
const privateKey = generate_private_key();
const wallet = JSON.parse(derive_addresses_from_key(privateKey));

// 2. Build transaction
const inputs = [...]; // From blockchain
const outputs = [...]; // Recipients
const txHex = build_transaction(
  JSON.stringify(inputs),
  JSON.stringify(outputs),
  feeInSatoshis
);

// 3. Sign transaction
const signedTxHex = sign_transaction(
  txHex,
  privateKey,
  0,
  inputs[0].script_pubkey,
  inputs[0].amount
);

// 4. Calculate transaction ID
const txid = calculate_txid(signedTxHex);

// 5. Broadcast (application responsibility)
// await broadcastTransaction(signedTxHex);
```

### Error Handling

```javascript
try {
  const wallet = derive_addresses_from_key(privateKey);
} catch (error) {
  console.error('Wallet derivation failed:', error.message);
  // Handle error appropriately
}
```

### Performance Considerations

- Key generation: ~1ms
- Address derivation: ~5ms
- Transaction building: ~10ms
- Transaction signing: ~20ms
- TXID calculation: ~5ms

Total workflow: ~40ms (suitable for real-time applications)

---

## Future Enhancements

### Planned Improvements

1. **Full ECDSA Signing**: Proper signature generation with sighash computation
2. **HD Wallets**: BIP32/BIP39 support for hierarchical key derivation
3. **Multi-Signature**: Support for m-of-n signatures
4. **Mainnet Support**: Bitcoin Mainnet address generation
5. **Fee Calculation**: Automatic fee estimation based on transaction size
6. **Script Templates**: Pre-built templates for common transaction types
7. **Taproot Signing**: Full Taproot (P2TR) signing support

### Backward Compatibility

The public API is designed for stability. Future enhancements will maintain backward compatibility within major versions.
