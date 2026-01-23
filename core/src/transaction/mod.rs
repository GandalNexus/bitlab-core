use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use bitcoin::{Transaction, TxIn, TxOut, OutPoint, ScriptBuf, Witness, Amount, Address, EcdsaSighashType, PrivateKey, Network};
use bitcoin::secp256k1::{Secp256k1, SecretKey};
use std::str::FromStr;
use crate::utils::{bytes_to_hex, hex_to_bytes};

#[derive(Serialize, Deserialize)]
pub struct TransactionInput {
    pub txid: String,
    pub vout: u32,
    pub amount: u64,
    pub script_pubkey: String,
}

#[derive(Serialize, Deserialize)]
pub struct TransactionOutput {
    pub address: String,
    pub amount: u64,
}

#[wasm_bindgen]
pub fn build_transaction(
    inputs_json: &str,
    outputs_json: &str,
    _fee_sat: u64,
) -> Result<String, JsValue> {
    let inputs: Vec<TransactionInput> = serde_json::from_str(inputs_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid inputs JSON: {}", e)))?;

    let outputs: Vec<TransactionOutput> = serde_json::from_str(outputs_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid outputs JSON: {}", e)))?;

    let mut tx = Transaction {
        version: bitcoin::transaction::Version::TWO,
        lock_time: bitcoin::absolute::LockTime::ZERO,
        input: Vec::new(),
        output: Vec::new(),
    };

    for input in inputs {
        let outpoint = OutPoint::from_str(&format!("{}:{}", input.txid, input.vout))
            .map_err(|e| JsValue::from_str(&format!("Invalid outpoint: {}", e)))?;

        let script_pubkey: ScriptBuf = ScriptBuf::from_hex(&input.script_pubkey)
            .map_err(|e| JsValue::from_str(&format!("Invalid script pubkey: {}", e)))?;

        tx.input.push(TxIn {
            previous_output: outpoint,
            script_sig: script_pubkey,
            sequence: bitcoin::Sequence::MAX,
            witness: Witness::default(),
        });
    }

    for output in outputs {
        let amount = Amount::from_sat(output.amount);
        let address = Address::from_str(&output.address)
            .map_err(|e| JsValue::from_str(&format!("Invalid address: {}", e)))?
            .assume_checked();

        tx.output.push(TxOut {
            value: amount,
            script_pubkey: address.script_pubkey(),
        });
    }

    let tx_bytes = bitcoin::consensus::serialize(&tx);
    Ok(bytes_to_hex(&tx_bytes))
}

#[wasm_bindgen]
pub fn sign_transaction(
    tx_hex: &str,
    private_key_hex: &str,
    input_index: usize,
    _script_pubkey_hex: &str,
    _satoshi_value: u64,
) -> Result<String, JsValue> {
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

    let tx_bytes: Vec<u8> = hex_to_bytes(tx_hex)
        .map_err(|e| JsValue::from_str(&format!("Invalid tx hex: {}", e)))?;

    let mut tx: Transaction = bitcoin::consensus::deserialize(&tx_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize tx: {}", e)))?;

    let pub_key_bytes = private_key.public_key(&secp).to_bytes();
    let sig_bytes = vec![0u8; 64];
    let mut sig_with_sighash = sig_bytes;
    sig_with_sighash.push(EcdsaSighashType::All as u8);

    let witness_items: Vec<Vec<u8>> = vec![sig_with_sighash, pub_key_bytes];
    tx.input[input_index].witness = Witness::from_slice(&witness_items);

    let signed_tx_bytes = bitcoin::consensus::serialize(&tx);
    Ok(bytes_to_hex(&signed_tx_bytes))
}

#[wasm_bindgen]
pub fn calculate_txid(tx_hex: &str) -> Result<String, JsValue> {
    let tx_bytes: Vec<u8> = hex_to_bytes(tx_hex)
        .map_err(|e| JsValue::from_str(&format!("Invalid tx hex: {}", e)))?;

    let tx: Transaction = bitcoin::consensus::deserialize(&tx_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize tx: {}", e)))?;

    Ok(tx.compute_txid().to_string())
}
