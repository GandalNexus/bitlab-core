mod utils;
mod wallet;
mod transaction;

pub use wallet::{generate_private_key, derive_addresses_from_key};
pub use transaction::{build_transaction, sign_transaction, calculate_txid};
pub use utils::wasm_log;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn satoshi_to_btc(satoshi: u64) -> f64 {
    satoshi as f64 / 100_000_000.0
}

#[wasm_bindgen]
pub fn btc_to_satoshi(btc: f64) -> u64 {
    (btc * 100_000_000.0) as u64
}

#[wasm_bindgen]
pub fn test_wasm() -> String {
    "BitLab WASM module loaded successfully!".to_string()
}
