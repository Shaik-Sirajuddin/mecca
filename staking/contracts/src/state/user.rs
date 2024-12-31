use std::ops::{Div, Mul};

use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, clock::Clock, entrypoint::ProgramResult, msg, program::invoke,
    rent::Rent, system_instruction, sysvar::Sysvar,
};

use super::{app_state::AppState, token_store::TokenStore};

#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub enum Act {
    EnrollStaking,
    IncreaseStake,
    IntiateWithdrawPricipal,
    IntiateWithdrawInterest,
    WithdrawPrincipal,
    WithdrawInterest,
    Withdraw,
}

#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub struct Action {
    //represent a user action ->
    pub action: Act,
    pub time: u64,
    pub amount: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct WithdrawRequest {
    pub amount: u64,
    pub request_time_ms: u64,
    pub is_principal: bool,
    pub is_under_progress: bool,
}
impl WithdrawRequest {
    /**
     Check whether the lock time has been passed for user to be able to withdraw
     also ensures an uncompleted withdrawl request exists
    */
    pub fn can_withdraw(&self, lock_time_ms: u64) -> bool {
        //prevent attacks by not allowing any possibility for overflow/underflow cases
        self.is_under_progress
            && (self.request_time_ms.checked_add(lock_time_ms).unwrap()
                <= Clock::get().unwrap().unix_timestamp as u64)
    }
    pub fn is_interest(&self) -> bool {
        !self.is_principal
    }

    pub fn new() -> Self {
        WithdrawRequest {
            amount: 0,
            request_time_ms: 0,
            is_principal: false,
            is_under_progress: false,
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct User {
    pub accumulated_interest: u64,
    pub withdrawn_interest: u64,
    pub principal_in_stake: u64,
    /*
       most recent staking time ,
       increasing/decreasing staking amount would change stake_time
    */
    pub stake_time: u64,
    pub withdraw_request: WithdrawRequest,
    pub change_list_index: u32,
    pub actions: Vec<Action>,
    //the size of pool_change array -1 during stake start
}

/**
 * User pda address derivation seeds SEED_PREFIX + public_key
 */
impl User {
    pub const SEED_PREFIX: &'static str = "user-data-";

    fn calculate_interest(&self, time: u64, amount: u64, interest_rate: u64) -> u64 {
        (interest_rate as u128) //interest per year
            .mul(time as u128) // no of seconds
            .mul(amount as u128) //stake amount
            .div((365u128 * 86400 * 100) as u128)
            .div(10u128.pow(*TokenStore::TOKEN_DECIMALS as u32)) as u64
    }

    pub fn calculate_unaccounted_interest(&self, app_state: &AppState, cur_time_s: u64) -> u64 {
        let mut unaccounted_interest = 0;

        let mut last_accounted_time = self.stake_time;
        let mut cur_slot_interest = app_state
            .interest_history
            .get(self.change_list_index as usize)
            .unwrap()
            .rate as u64;

        let mut idx = self.change_list_index + 1;

        while idx < app_state.interest_history.len() as u32 {
            let cur_rate_change = app_state.interest_history.get(idx as usize).unwrap();
            let diff_time = cur_rate_change.time - last_accounted_time;
            unaccounted_interest +=
                self.calculate_interest(diff_time, self.principal_in_stake, cur_slot_interest);

            last_accounted_time = cur_rate_change.time;
            cur_slot_interest = cur_rate_change.rate as u64;
            idx += 1;
        }

        let diff_time = cur_time_s - last_accounted_time;

        unaccounted_interest +=
            self.calculate_interest(diff_time, self.principal_in_stake, cur_slot_interest);

        unaccounted_interest
    }

    /**
     * reallocates data to expand or shrink data bytes held by user associated account ,
     * transfers lamports for sufficient fee for rent
     * calls realloc
     * saves data
     */
    pub fn realloc_and_save(&self, accounts: &[&AccountInfo]) -> ProgramResult {
        let payer_account = accounts[0];
        let user_data_account = accounts[1];
        let system_account = accounts[2];

        let item_size = to_vec(self).unwrap().len();
        let rent = (Rent::get()?).minimum_balance(item_size);
        if user_data_account.lamports() < rent {
            let diff = rent - user_data_account.lamports();
            invoke(
                &system_instruction::transfer(payer_account.key, user_data_account.key, diff),
                &[
                    payer_account.clone(),
                    user_data_account.clone(),
                    system_account.clone(),
                ],
            )?;
        }

        user_data_account.realloc(item_size, false)?;

        self.serialize(&mut &mut user_data_account.try_borrow_mut_data()?[..])?;
        Ok(())
    }
}
