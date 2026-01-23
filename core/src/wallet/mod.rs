use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use bitcoin::secp256k1::{Secp256k1, SecretKey};
use bitcoin::{PrivateKey, PublicKey as BtcPublicKey, Address, Network};
use rand::Rng;
use crate::utils::bytes_to_hex;

#[derive(Serialize, Deserialize)]
pub struct WalletAddresses {
    pub legacy: String,
    pub segwit: String,
    pub taproot: String,
}

#[derive(Serialize, Deserialize)]
pub struct KeyPair {
    pub private_key: String,
    pub public_key: String,
    pub addresses: WalletAddresses,
}

#[wasm_bindgen]
pub fn generate_private_key() -> String {
    let mut rng = rand::thread_rng();
    let mut bytes = [0u8; 32];
    rng.fill(&mut bytes);
    bytes_to_hex(&bytes)
}

#[wasm_bindgen]
pub fn derive_addresses_from_key(private_key_hex: &str) -> Result<String, JsValue> {
    use crate::utils::hex_to_bytes;
    
    let secp = Secp256k1::new();
    let private_key_bytes: Vec<u8> = hex_to_bytes(private_key_hex)
        .map_err(|e| JsValue::from_str(&format!("Invalid private key hex: {}", e)))?;

    if private_key_bytes.len() != 32 {
        return Err(JsValue::from_str("Private key must be 32 bytes"));
    }

    let mut key_array = [0u8; 32];
    key_array.copy_from_slice(&private_key_bytes);

    let secret_key = SecretKey::from_slice(&key_array)
        .map_err(|e| JsValue::from_str(&format!("Invalid secret key: {}", e)))?;

    let private_key = PrivateKey::new(secret_key, Network::Testnet);
    let pubkey = BtcPublicKey::from_private_key(&secp, &private_key);

    let legacy_address = Address::p2pkh(&pubkey, Network::Testnet);
    let legacy_str = legacy_address.to_string();

    let addresses = WalletAddresses {
        legacy: legacy_str.clone(),
        segwit: legacy_str.clone(),
        taproot: legacy_str,
    };

    let keypair = KeyPair {
        private_key: private_key_hex.to_string(),
        public_key: bytes_to_hex(&pubkey.to_bytes()),
        addresses,
    };

    serde_json::to_string(&keypair)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize: {}", e)))
}
