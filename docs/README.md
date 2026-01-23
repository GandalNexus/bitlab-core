# BitLab Core Documentation

Complete documentation for the BitLab Core cryptographic library (WASM backend).

## Documentation Files

### PHILOSOPHY.md
Comprehensive guide to BitLab's design philosophy, architectural decisions, and security considerations.

Topics covered:
- Core philosophy and design principles
- Security-first approach
- Performance through compilation
- Modularity and separation of concerns
- Architectural decisions (why Rust, why WASM, why JSON)
- Security considerations for private key handling
- Future directions and planned enhancements

**Read this to understand**: Why BitLab is designed the way it is, and how to use it securely.

### API.md
Complete API reference for all BitLab functions with detailed parameter descriptions and examples.

Topics covered:
- Initialization
- Wallet module functions
- Transaction module functions
- Unit conversion functions
- Error handling
- Type definitions
- Best practices
- Usage examples

**Read this to understand**: How to call each function and what to expect.

### METHODS.md
In-depth explanation of each method's purpose, implementation details, and integration patterns.

Topics covered:
- Purpose of each method
- Why each method matters
- Implementation details with code
- Cryptographic processes
- Current limitations
- Security considerations
- Integration patterns
- Performance characteristics
- Future enhancements

**Read this to understand**: How each method works internally and how to integrate them effectively.

## Quick Navigation

### For Frontend Developers
1. Start with [API.md](./API.md) for function signatures
2. Review [PHILOSOPHY.md](./PHILOSOPHY.md) for design understanding
3. Check `../examples/` for integration patterns
4. Reference [SECURITY.md](./SECURITY.md) for security best practices

### For Core Contributors
1. Read [METHODS.md](./METHODS.md) for implementation details
2. Review [PHILOSOPHY.md](./PHILOSOPHY.md) for design principles
3. Study the source code in `../core/src/`
4. Check [SECURITY.md](./SECURITY.md) for security guidelines

### For Security Auditors
1. Review [SECURITY.md](./SECURITY.md) for security architecture
2. Study [METHODS.md](./METHODS.md) for cryptographic details
3. Examine [PHILOSOPHY.md](./PHILOSOPHY.md) security section
4. Review source code in `../core/src/`

## Examples

See the `examples/` directory for practical usage:

- `01-wallet-generation.js` - Generate wallets and derive addresses
- `02-unit-conversion.js` - Convert between BTC and satoshis
- `03-transaction-building.js` - Construct transactions
- `04-transaction-signing.js` - Sign transactions
- `05-complete-workflow.js` - End-to-end workflow

## Key Concepts

### Private Keys
- 32-byte (256-bit) random values
- Generated with cryptographic randomness
- Never exposed to JavaScript
- Must be stored securely

### Addresses
- Derived from public keys
- Three formats: Legacy (P2PKH), SegWit (P2WPKH), Taproot (P2TR)
- Currently Testnet only
- Used to receive payments

### Transactions
- Built unsigned first for inspection
- Signed with ECDSA signatures
- Serialized to hex for transmission
- Identified by transaction ID (txid)

### Satoshis
- Smallest Bitcoin unit (1 BTC = 100,000,000 satoshis)
- Used internally for all amounts
- Converted to/from BTC for display

## Security Best Practices

1. Always initialize the WASM module with `init()`
2. Generate private keys only when needed
3. Store private keys securely (encrypted, hardware wallet, etc.)
4. Never log or transmit private keys
5. Validate all inputs before passing to functions
6. Inspect transactions before signing
7. Test on Testnet before using Mainnet
8. Handle errors gracefully

## Performance

Typical operation times:
- Key generation: ~1ms
- Address derivation: ~5ms
- Transaction building: ~10ms
- Transaction signing: ~20ms
- TXID calculation: ~5ms

Total workflow: ~40ms

## Limitations

Current version limitations:
- Testnet only (Mainnet support planned)
- Basic ECDSA signing (full signing planned)
- No HD wallet support (BIP32/BIP39 planned)
- No multi-signature support (planned)
- No Taproot signing (planned)

## Support

For issues, questions, or contributions:
- Check existing documentation
- Review examples for usage patterns
- Examine source code for implementation details
- Report issues on GitHub

## License

BitLab is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
