use std::vec;

use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program::invoke, pubkey::Pubkey,
    rent::Rent, system_instruction, sysvar::Sysvar,
};

//maximum sales possible ~ 32000 ( max size of account 10mb)
#[derive(BorshSerialize, BorshDeserialize)]
pub struct Sale {
    pub token_amount: u64,
    pub paid_amount: u64,
    pub is_usdt: bool,
    pub user: Pubkey,
}

//TODO : split sales to store in another account , speeding up required data fetch
#[derive(BorshSerialize, BorshDeserialize)]
pub struct AppState {
    pub tokens_sold: u64,
    pub usdt_raised: u64,
    pub sol_raised: u64,
    pub owner: Pubkey,
    pub sales: Vec<Sale>,
}

impl AppState {
    pub const SEED_PREFIX: &'static str = "app-state";
    pub const BUMP: &'static u8 = &255;
    //appstate pda
    pub const PDA: &'static str = "3YGG6YyGiyZnWEZeoxYbeNzXt2eVq3qeABbgBvLopaBn";
    pub const OWNER: &'static str = "12VKkD7Rs9CxCkC3EJ8uwiuXBAKmRM4ANHjJoEKLFehu";

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

    pub fn new(owner: &Pubkey) -> Self {
        AppState {
            sales: vec![],
            sol_raised: 0,
            tokens_sold: 0,
            usdt_raised: 0,
            owner: owner.clone(),
        }
    }
}
