use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, pubkey::Pubkey};

use super::{plan::Plan, token_store::TokenStore};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct AppState {
    pub daily_fee: u64,   //amount of fee charged on daily basis
    pub paused: bool,     //when paused joins , upgrade aren't possible
    pub plans: Vec<Plan>, //fixed size of 3 should be present (3 plans)
    pub owner: Pubkey,
}

impl AppState {
    pub const SEED: &'static str = "app-state-";
    pub const OWNER: &'static str = "9tFmeBvKhr3PhgdUYYSUuVZTzSrFDB5GzkD8H2DnmMhG";

    pub fn new(owner: &Pubkey) -> Self {
        AppState {
            daily_fee: 1 * 10u64.pow(*TokenStore::DECIMALS as u32),
            paused: false,
            //plans are fixed , cannot be modified by admin
            plans: vec![
                Plan {
                    id: 0,
                    investment_required: 2000 * 10u64.pow(*TokenStore::DECIMALS as u32),
                    active_referral_percentage: 3,
                    deep_referral_percentage: 1,
                    direct_referral_percentage: 10,
                    validity_days: 2000,
                    daily_reward: 2 * 10u64.pow(*TokenStore::DECIMALS as u32),
                    max_level: 10,
                },
                Plan {
                    id: 1,
                    investment_required: 10000 * 10u64.pow(*TokenStore::DECIMALS as u32),
                    active_referral_percentage: 4,
                    deep_referral_percentage: 1,
                    direct_referral_percentage: 20,
                    validity_days: 2000,
                    daily_reward: 10 * 10u64.pow(*TokenStore::DECIMALS as u32),
                    max_level: 20,
                },
                Plan {
                    id: 2,
                    investment_required: 30000 * 10u64.pow(*TokenStore::DECIMALS as u32),
                    active_referral_percentage: 5,
                    deep_referral_percentage: 1,
                    direct_referral_percentage: 30,
                    validity_days: 2000,
                    daily_reward: 30 * 10u64.pow(*TokenStore::DECIMALS as u32),
                    max_level: 30,
                },
            ],
            owner: owner.clone(),
        }
    }

    pub fn save(&self, app_state_acc: &AccountInfo) -> ProgramResult {
        self.serialize(&mut &mut app_state_acc.try_borrow_mut_data()?[..])?;
        Ok(())
    }

    pub fn get_plan(&self, id: u8) -> Option<&Plan> {
        for plan in &self.plans {
            if plan.id == id {
                return Some(plan);
            }
        }
        None
    }
}
