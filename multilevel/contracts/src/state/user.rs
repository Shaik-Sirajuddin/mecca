use std::{string, vec};

use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program::invoke, pubkey::Pubkey,
    rent::Rent, system_instruction, sysvar::Sysvar,
};

use super::{action::UserAction, app_state::AppState, plan::Plan, reward::Reward};
#[derive(BorshSerialize, BorshDeserialize)]
pub struct ReferralDistributionState {
    pub last_distributed_user: Pubkey, // address of the last receiver
    pub last_level: u8,                //address
    pub completed: bool, //denotes whether the referrals have been distributed till max stage
    pub invested_amount: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UpgradeDeduction {
    pub daily_amount: u64,
    pub days: u32, //no days would decrease with daily distributions
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Accumulated {
    pub daily_reward: u64,
    pub fee: u64,
    pub referral_reward: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UserData {
    pub id: string::String,
    pub address: Pubkey,
    pub referral_reward: u64,  //referral rewards accounted in active plan
    pub acc_daily_reward: u64, //daily reward accounted in active plan
    pub acc_fee: u64,          //fee accounted in active plan

    //TODO : check for overflow cases
    pub withdrawn_amount: u64,

    pub is_plan_active: bool,
    pub enrolled_at: u64,
    pub last_accounted_time: u64, //same timestamp for daily bonus , fee
    pub plan_id: u8,
    pub referrer: Pubkey,
    pub referral_distribution: ReferralDistributionState,
    pub upgrade_deduction: [UpgradeDeduction; 2],
    pub accumulated: Accumulated,
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
            acc_daily_reward: plan.daily_reward,
            acc_fee: fee,
            referrer: referrer.clone(),
            referral_distribution: ReferralDistributionState {
                completed: false,
                last_distributed_user: user.clone(),
                last_level: 0,
                invested_amount: plan.investment_required,
            },
            upgrade_deduction: [
                UpgradeDeduction {
                    daily_amount: 0,
                    days: 0,
                },
                UpgradeDeduction {
                    daily_amount: 0,
                    days: 0,
                },
            ],
            accumulated: Accumulated {
                daily_reward: 0,
                fee: 0,
                referral_reward: 0,
            },
        }
    }

    pub fn save(&self, user_data_acc: &AccountInfo) -> ProgramResult {
        self.serialize(&mut &mut user_data_acc.try_borrow_mut_data()?[..])?;
        Ok(())
    }
    fn apply_upgrade_deductions(
        &mut self,
        index: usize,
        mut unaccounted_days: u64,
        plan: &Plan,
    ) -> u64 {
        let upgrade_deduction = &mut self.upgrade_deduction[index];
        let reduced_reward_days = (upgrade_deduction.days as u64).min(unaccounted_days);
        upgrade_deduction.days -= reduced_reward_days as u32;
        self.acc_daily_reward +=
            reduced_reward_days * (plan.daily_reward - upgrade_deduction.daily_amount);
        unaccounted_days -= reduced_reward_days;
        return unaccounted_days;
    }
    /**
     * Charge fee and provide daily reward until specified time if applicable
     */
    pub fn reward(&mut self, time: u64, app_state: &AppState) {
        if !self.is_plan_active || !self.referral_distribution.completed {
            return;
        }
        let plan = app_state.get_plan(self.plan_id).unwrap();
        let plan_expiry_date = self.enrolled_at + (86400u64 * (plan.validity_days - 1) as u64);

        if self.last_accounted_time == plan_expiry_date || self.last_accounted_time >= time {
            return;
        }

        let mut account_at = time.min(plan_expiry_date);
        let unaccounted_days = (account_at - self.last_accounted_time) / 86400;

        if unaccounted_days > 0 {
            account_at = self.last_accounted_time + (86400 * unaccounted_days);

            //reward considering upgrade decutions
            let mut normal_reward_days = self.apply_upgrade_deductions(0, unaccounted_days, plan);
            normal_reward_days = self.apply_upgrade_deductions(1, normal_reward_days, plan);

            self.acc_daily_reward += normal_reward_days * plan.daily_reward;
            self.acc_fee += app_state.daily_fee * unaccounted_days;
            self.last_accounted_time = account_at;
        }

        if time >= (plan_expiry_date + 86400) {
            self.is_plan_active = false;
        }
    }

    pub fn get_withdrawable_amount(&self) -> u64 {
        //todo possible overflow
        self.acc_daily_reward + self.referral_reward - self.acc_fee
            + self.accumulated.daily_reward
            + self.accumulated.referral_reward
            - self.accumulated.fee
            - self.withdrawn_amount
    }

    pub fn get_receivable_reward_percentage(
        &mut self,
        time: u64,
        app_state: &AppState,
        level: u8,
    ) -> u8 {
        self.reward(time, app_state);
        if !self.is_plan_active {
            return 0;
        }
        let plan = app_state.get_plan(self.plan_id).unwrap();
        if level > plan.max_level {
            return 0;
        }
        let receivable_percentage = if level == 1 {
            plan.direct_referral_percentage
        } else if level >= 2 && level <= 6 {
            plan.active_referral_percentage
        } else {
            plan.deep_referral_percentage
        };
        receivable_percentage
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

    pub fn realloc_and_save(&self, accounts: &[&AccountInfo]) -> ProgramResult {
        let payer_account = accounts[0];
        let user_store_acc = accounts[1];
        let system_account = accounts[2];

        let item_size = to_vec(self).unwrap().len();
        let rent = (Rent::get()?).minimum_balance(item_size);
        if user_store_acc.lamports() < rent {
            let diff = rent - user_store_acc.lamports();
            invoke(
                &system_instruction::transfer(payer_account.key, user_store_acc.key, diff),
                &[
                    payer_account.clone(),
                    user_store_acc.clone(),
                    system_account.clone(),
                ],
            )?;
        }

        user_store_acc.realloc(item_size, false)?;

        self.serialize(&mut &mut user_store_acc.try_borrow_mut_data()?[..])?;

        Ok(())
    }
}
