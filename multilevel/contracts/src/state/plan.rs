use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Plan {
    pub id: u8,
    pub investment_required: u64,
    pub validity_days: u32, // no of days plan is valid (daily reward receivable days)
    pub daily_reward: u64,
    pub max_level: u64, // max level from which referral reward is receivable
    pub direct_referral_percentage: u32,
    pub active_referral_percentage: u32, //level 2 - 6 ,
    pub deep_referral_percentage: u32,   //level 7 - max level
}
