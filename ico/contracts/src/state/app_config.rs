use std::vec;

//TODO : split sales to store in another account , speeding up required data fetch
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{clock::Clock, pubkey::Pubkey, sysvar::Sysvar};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Round {
    pub idx: u32,
    pub round_price: u64,
    pub price_decimals: u8,
    pub end_time: u64,
}
#[derive(BorshSerialize, BorshDeserialize)]
pub struct AppConfig {
    pub start_time: u64,
    pub paused: bool,
    pub tokens_sold: u64,
    pub usdt_raised: u64,
    pub sol_raised: u64,
    pub owner: Pubkey,
    pub deposit_acc: Pubkey,
    pub rounds: Vec<Round>,
}

impl AppConfig {
    pub const SEED_PREFIX: &'static str = "app-config";
    pub const BUMP: &'static u8 = &255;
    //appstate pda
    pub const PDA: &'static str = "8tnDWu7nddS7xzWcncuD9CzdBVBnmpkSobV6TFTREQM5";
    pub const OWNER: &'static str = "9tFmeBvKhr3PhgdUYYSUuVZTzSrFDB5GzkD8H2DnmMhG";
    //sol-usd price feed
    pub const PRICE_FEED: &'static str = "CH31Xns5z3M1cTAbKW34jcxPPciazARpijcHj9rxtemt";

    pub const PRICE_FEED_CONTRACT: &'static str = "HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny";

    pub fn new(owner: &Pubkey) -> Self {
        AppConfig {
            owner: owner.clone(),
            paused: false,
            sol_raised: 0,
            tokens_sold: 0,
            usdt_raised: 0,
            start_time: Clock::get().unwrap().unix_timestamp as u64,
            deposit_acc: owner.clone(),
            rounds: vec![
                Round {
                    end_time: 1740787140,
                    round_price: 20,
                    idx: 0,
                    price_decimals: 3,
                },
                Round {
                    end_time: 1743465540,
                    round_price: 27,
                    idx: 1,
                    price_decimals: 3,
                },
                Round {
                    end_time: 1746057540,
                    round_price: 34,
                    idx: 2,
                    price_decimals: 3,
                },
            ],
        }
    }
}
