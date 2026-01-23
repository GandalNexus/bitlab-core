pub fn bytes_to_hex(bytes: &[u8]) -> String {
    bytes.iter()
        .map(|b| format!("{:02x}", b))
        .collect()
}

pub fn hex_to_bytes(hex_str: &str) -> Result<Vec<u8>, String> {
    let hex_str = hex_str.trim();
    if hex_str.len() % 2 != 0 {
        return Err("Hex string must have even length".to_string());
    }

    (0..hex_str.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&hex_str[i..i+2], 16))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Invalid hex character: {}", e))
}
