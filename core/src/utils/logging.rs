use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub fn wasm_log(message: &str) {
    console::log_1(&JsValue::from_str(message));
}
