use anchor_lang::{prelude::*, pubkey};

#[constant]
pub const PRESALE_SEED: &[u8] = b"PRESALE_SEED";
pub const USER_SEED: &[u8] = b"USER_SEED";
pub const PRESALE_VAULT: &[u8] = b"PRESALE_VAULT";
pub const RENT_MINIMUM: u64 = 1_000_000;


pub const USDC: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
pub const USDT: Pubkey = pubkey!("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");