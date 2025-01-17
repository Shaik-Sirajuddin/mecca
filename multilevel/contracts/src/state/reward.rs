use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;


#[derive(BorshSerialize, BorshDeserialize)]
pub struct Reward {
    pub referee: Pubkey,
    pub invested_amount: u64, // amount invested during enroll or upgrade
    pub level: u8,
    pub plan_id: u8,
    pub reward_amount: u64,
    pub reward_time: u64,
    pub plan_entry_time: u64,
}
