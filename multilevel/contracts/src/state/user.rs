use std::{string, vec};

use borsh::{BorshDeserialize, BorshSerialize};
use rand::prelude::*;
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    pubkey::{new_rand, Pubkey},
};

use super::{action::UserAction, plan::Plan, reward::Reward};
#[derive(BorshSerialize, BorshDeserialize)]
pub struct ReferralDistributionState {
    pub last_distributed_user: Pubkey, // address of the last receiver
    pub last_level: u8,                //address
    pub completed: bool, //denotes whether the referrals have been distributed till max stage
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UpgradeDeduction {
    pub daily_amount: u64,
    pub days: u32, //no days would decrease with daily distributions
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UserData {
    pub id: string::String,
    pub address: Pubkey,
    pub referral_reward: u64,
    //TODO : check for overflow cases
    pub withdrawn_amount: u64,

    pub is_plan_active: bool,
    pub enrolled_at: u64,
    pub last_accounted_time: u64, //same timestamp for daily bonus , fee
    pub plan_id: u8,
    pub accumulated_daily_reward: u64,
    pub accumulated_fee: u64,
    pub referrer: Pubkey,
    pub referral_distribution: ReferralDistributionState,
    pub upgrade_deduction: UpgradeDeduction,
}

impl UserData {
    pub const SEED_PREFIX: &'static str = "user-data-";

    pub fn new(
        user_id: &String,
        user: &Pubkey,
        referrer: &Pubkey,
        enrolled_at: u64,
        plan: &Plan,
        fee: u64,
    ) -> Self {
        UserData {
            id: user_id.clone(),
            address: user.clone(),
            referral_reward: 0,
            withdrawn_amount: 0,
            is_plan_active: true,
            enrolled_at,
            last_accounted_time: enrolled_at,
            plan_id: plan.id,
            accumulated_daily_reward: plan.daily_reward,
            accumulated_fee: fee,
            referrer: referrer.clone(),
            referral_distribution: ReferralDistributionState {
                completed: false,
                last_distributed_user: user.clone(),
                last_level: 0,
            },
            upgrade_deduction: UpgradeDeduction {
                daily_amount: 0,
                days: 0,
            },
        }
    }

    pub fn save(&self, user_data_acc: &AccountInfo) -> ProgramResult {
        self.serialize(&mut &mut user_data_acc.try_borrow_mut_data()?[..])?;
        Ok(())
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UserStore {
    pub address: Pubkey,

    pub rewards: Vec<Reward>,
    pub actions: Vec<UserAction>,
}

impl UserStore {
    pub const SEED_PREFIX: &'static str = "user-store-";

    pub fn new(user: Pubkey) -> Self {
        UserStore {
            address: user.clone(),
            rewards: vec![],
            actions: vec![],
        }
    }

    pub fn save(&self, user_store_acc: &AccountInfo) -> ProgramResult {
        self.serialize(&mut &mut user_store_acc.try_borrow_mut_data()?[..])?;
        Ok(())
    }
}
