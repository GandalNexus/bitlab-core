# BitLab Core - Bitcoin WASM Library

<div align="center">

**Core cryptographic library for BitLab - High-performance Bitcoin operations compiled to WebAssembly using Rust**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](LICENSE)
[![Bitcoin](https://img.shields.io/badge/Bitcoin-Testnet-orange.svg)](https://testnet.bitcoin.org)
[![Rust](https://img.shields.io/badge/Rust-1.70%2B-red.svg)](https://www.rust-lang.org)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-Ready-brightgreen.svg)](https://webassembly.org)

</div>

## Overview

BitLab Core is the cryptographic backend library for the BitLab Bitcoin wallet frontend. It provides secure, high-performance Bitcoin operations compiled to WebAssembly, enabling safe key generation, address derivation, and transaction signing directly in the browser without compromising security or speed.

**Note**: This is the core library only. The complete BitLab project includes a frontend application that consumes this library.

### Project Status

| Component | Status | Progress |
|-----------|--------|----------|
| Wallet Generation | ✓ Complete | ████████░░ 100% |
| Address Derivation | ✓ Complete | ████████░░ 100% |
| Transaction Building | ✓ Complete | ████████░░ 100% |
| Transaction Signing | ⚠ Basic | ██████░░░░ 60% |
| Unit Conversion | ✓ Complete | ████████░░ 100% |
| HD Wallets (BIP32/39) | ⏳ Planned | ░░░░░░░░░░ 0% |
| Multi-Signature | ⏳ Planned | ░░░░░░░░░░ 0% |
| Taproot Support | ⏳ Planned | ░░░░░░░░░░ 0% |
| Mainnet Support | ⏳ Planned | ░░░░░░░░░░ 0% |
| Security Audit | ⏳ Planned | ░░░░░░░░░░ 0% |

## Key Features

- **Secure Key Generation**: Cryptographically secure random private key generation using system entropy
- **Multi-Address Derivation**: Generate Legacy (P2PKH), SegWit (P2WPKH), and Taproot (P2TR) addresses from a single private key
- **Transaction Building**: Construct Bitcoin transactions with multiple inputs and outputs
- **Transaction Signing**: Sign transactions with ECDSA signatures
- **Transaction ID Calculation**: Compute transaction IDs (txids) for verification
- **Unit Conversion**: Seamless conversion between satoshis and BTC
- **Browser & Node.js Compatible**: Works in both environments via WASM

## Architecture

```
core/
├── src/
│   ├── lib.rs              # Main entry point, exports public API
│   ├── wallet/             # Wallet generation and key derivation
│   │   └── mod.rs
│   ├── transaction/        # Transaction building and signing
│   │   └── mod.rs
│   └── utils/              # Utilities (encoding, logging)
│       ├── mod.rs
│       ├── encoding.rs     # Hex encoding/decoding
│       └── logging.rs      # WASM logging utilities
├── Cargo.toml              # Rust dependencies
└── Cargo.lock
```

## Core Modules

### Wallet Module (`wallet/mod.rs`)

Handles cryptographic key generation and address derivation.

- `generate_private_key()` - Generates a random 32-byte private key using system entropy
- `derive_addresses_from_key(private_key_hex)` - Derives wallet addresses from a private key, returning a KeyPair structure containing the private key, public key, and all address formats

### Transaction Module (`transaction/mod.rs`)

Manages Bitcoin transaction lifecycle from construction to signing.

- `build_transaction(inputs_json, outputs_json, fee_sat)` - Constructs an unsigned Bitcoin transaction from input and output specifications
- `sign_transaction(tx_hex, private_key_hex, input_index, script_pubkey_hex, satoshi_value)` - Signs a transaction input with ECDSA signature
- `calculate_txid(tx_hex)` - Computes the transaction ID (double SHA-256 hash) for a serialized transaction

### Utils Module (`utils/`)

Provides encoding and logging utilities.

- `bytes_to_hex()` - Converts byte arrays to hexadecimal strings
- `hex_to_bytes()` - Converts hexadecimal strings to byte arrays
- `wasm_log()` - Logs messages to browser console for debugging

## Dependencies

- **bitcoin** (0.32) - Bitcoin protocol implementation with consensus rules
- **wasm-bindgen** (0.2) - Rust-JavaScript bindings for WASM interoperability
- **serde** (1.0) - Serialization/deserialization framework
- **serde_json** (1.0) - JSON serialization support
- **rand** (0.8) - Cryptographically secure random number generation
- **web-sys** (0.3) - Web APIs for browser integration

## Building

### Prerequisites

1. Install Rust with rustup:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

2. Add WASM target:
```bash
rustup target add wasm32-unknown-unknown
```

3. Install wasm-bindgen-cli:
```bash
cargo install wasm-bindgen-cli
```

### Build Commands

#### Development Build
```bash
cargo build --target wasm32-unknown-unknown --manifest-path core/Cargo.toml
wasm-bindgen core/target/wasm32-unknown-unknown/debug/bitlab_wasm.wasm --out-dir pkg --target web
```

#### Production Build
```bash
cargo build --target wasm32-unknown-unknown --release --manifest-path core/Cargo.toml
wasm-bindgen core/target/wasm32-unknown-unknown/release/bitlab_wasm.wasm --out-dir pkg --target web
```

#### Run Tests
```bash
cargo test --manifest-path core/Cargo.toml
```

### Output Files

After building, you'll find these files in the `pkg/` directory:
- `bitlab_wasm.js` - JavaScript bindings
- `bitlab_wasm_bg.wasm` - WebAssembly binary
- `bitlab_wasm.d.ts` - TypeScript definitions
- `bitlab_wasm_bg.wasm.d.ts` - WASM type definitions

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bitlab-core
```

2. Build the WASM module:
```bash
cargo build --target wasm32-unknown-unknown --release --manifest-path core/Cargo.toml
wasm-bindgen core/target/wasm32-unknown-unknown/release/bitlab_wasm.wasm --out-dir pkg --target web
```

## Quick Start

```javascript
import init, { 
  generate_private_key, 
  derive_addresses_from_key,
  build_transaction,
  sign_transaction,
  calculate_txid,
  btc_to_satoshi,
  satoshi_to_btc
} from './pkg/bitlab_wasm.js';

// Initialize WASM module
await init();

// Generate a new private key
const privKey = generate_private_key();
console.log('Private Key:', privKey);

// Derive addresses from the private key
const wallet = JSON.parse(derive_addresses_from_key(privKey));
console.log('Wallet:', wallet);

// Convert units
const satoshis = btc_to_satoshi(0.5);
const btc = satoshi_to_btc(50000000);
```

For detailed usage examples, see the `examples/` directory.

## Development

The codebase follows these principles:

- **Modularity**: Each module handles a specific domain (wallet, transaction, utils)
- **Error Handling**: Rust's Result type is converted to JsValue for WASM, providing clear error messages
- **WASM Interop**: All public functions are marked with `#[wasm_bindgen]` for JavaScript accessibility
- **Performance**: Release builds use aggressive optimization flags (LTO, code generation units = 1, wasm-opt -Oz)
- **Security**: Uses established Bitcoin libraries and cryptographic primitives

## Documentation

- [Philosophy & Design](./docs/PHILOSOPHY.md) - Design principles and architectural decisions
- [API Reference](./docs/API.md) - Detailed API documentation
- [Method Details](./docs/METHODS.md) - In-depth method implementation and integration
- [Security Policy](./docs/SECURITY.md) - Security practices and guidelines
- [Examples](./examples/) - Practical usage examples
- [Documentation Index](./docs/README.md) - Complete documentation guide

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE file for details.
