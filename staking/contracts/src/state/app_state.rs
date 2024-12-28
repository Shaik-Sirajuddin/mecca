use std::ops::Mul;

use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, clock::Clock, entrypoint::ProgramResult, program::invoke,
    pubkey::Pubkey, rent::Rent, system_instruction, sysvar::Sysvar,
};

use super::token_store::TokenStore;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct RateChange {
    pub time: u64,
    pub rate: u32,
}
#[derive(BorshSerialize, BorshDeserialize)]
pub struct Config {
    pub lock_time_principal: u64,
    pub lock_time_interest: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct AppState {
    pub user_count: u32,
    pub total_registered: u32,
    pub staked_amount: u64,
    //the interest rate would not drop if principal is above the specified threshould
    pub deposit_threshould: u64,
    pub min_interest_rate: u32,
    pub cur_interest_rate: u32,
    pub min_deposit_user: u64,
    pub max_deposit_user: u64,
    pub interest_history: Vec<RateChange>,
    pub config: Config,
    pub authority: Pubkey,
}

impl AppState {
    pub const SEED_PREFIX: &'static str = "app-state";
    pub const BUMP: &'static u8 = &254;
    //set address to a pda dervied
    pub const PDA: &'static str = "Frga5CNcEaiwcjSwz8Bt8v8QBjqkQdj52Mg2LQzoHjwc";

    pub const OWNER: &'static str = "12VKkD7Rs9CxCkC3EJ8uwiuXBAKmRM4ANHjJoEKLFehu";

    pub fn new(authority: &Pubkey) -> Self {
        //TODO : check when can unix timestamp be negative
        let rate_change = RateChange {
            rate: 20 * 10u32.pow(*TokenStore::TOKEN_DECIMALS as u32),
            time: Clock::get().unwrap().unix_timestamp as u64,
        };
        AppState {
            user_count: 0,
            total_registered: 0,
            staked_amount: 0,
            min_interest_rate: 5 * 10u32.pow(*TokenStore::TOKEN_DECIMALS as u32),
            cur_interest_rate: 30 * 10u32.pow(*TokenStore::TOKEN_DECIMALS as u32),
            min_deposit_user: 1_000 * 10u64.pow(*TokenStore::TOKEN_DECIMALS as u32),
            max_deposit_user: 10_000_000 * 10u64.pow(*TokenStore::TOKEN_DECIMALS as u32),
            interest_history: vec![rate_change],
            authority: authority.clone(),
            config: Config {
                lock_time_principal: 86400 * 30, //applicable f
                lock_time_interest: 0,           //applicable f
            },
            deposit_threshould: 10_000_000 * 13, // calculated based on min interest , cur interest , for every 100 users interest change
        }
    }

    pub fn realloc_and_save(&self, accounts: &[&AccountInfo]) -> ProgramResult {
        let payer_account = accounts[0];
        let app_state_account = accounts[1];
        let system_account = accounts[2];

        let item_size = to_vec(self).unwrap().len();
        let rent = (Rent::get()?).minimum_balance(item_size);
        if app_state_account.lamports() < rent {
            let diff = rent - app_state_account.lamports();
            invoke(
                &system_instruction::transfer(payer_account.key, app_state_account.key, diff),
                &[
                    payer_account.clone(),
                    app_state_account.clone(),
                    system_account.clone(),
                ],
            )?;
        }

        app_state_account.realloc(item_size, false)?;

        self.serialize(&mut &mut app_state_account.try_borrow_mut_data()?[..])?;

        Ok(())
    }

    /**
     * Note : Only to call on stake and unstake , i.e stake amount change
     * Only to call when user count is increased ( new user or stake amount from 0 to positive)
     * or decreased
     */
    pub fn adjust_interest(
        &mut self,
        prev_stake_amount: u64,
        stake_time_s: u64,
        is_stake: bool,
    ) -> bool {
        let denom = 10_000_000 * 10u64.pow(*TokenStore::TOKEN_DECIMALS as u32);
        let prev_div = prev_stake_amount / denom;
        let cur_div = self.staked_amount / denom;

        if prev_div == cur_div {
            return false;
        }

        if is_stake {
            let previous_interset = self.cur_interest_rate;
            self.cur_interest_rate -=
                //2 % change 
                2 * 10u32.pow(*TokenStore::TOKEN_DECIMALS as u32) * (cur_div - prev_div) as u32;

            if self.cur_interest_rate < self.min_interest_rate {
                self.cur_interest_rate = self.min_interest_rate;
            }

            if previous_interset != self.cur_interest_rate {
                //change in interest rate , push into history
                let rate_change = RateChange {
                    rate: self.cur_interest_rate,
                    time: stake_time_s,
                };

                self.interest_history.push(rate_change);
                return true;
            }
        } else {
            if self.staked_amount < self.deposit_threshould {
                //2 % change
                self.cur_interest_rate += 2
                    * 10u32.pow((*TokenStore::TOKEN_DECIMALS) as u32)
                    * (prev_div - cur_div) as u32;
                //change in interest rate , push into history
                let rate_change = RateChange {
                    rate: self.cur_interest_rate,
                    time: stake_time_s,
                };

                self.interest_history.push(rate_change);
                return true;
            }
        }

        false
    }
}
