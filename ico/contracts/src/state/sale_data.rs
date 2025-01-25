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
    pub time: u64,
}

//TODO : split sales to store in another account , speeding up required data fetch
#[derive(BorshSerialize, BorshDeserialize)]
pub struct SaleData {
    pub sales: Vec<Sale>,
}

impl SaleData {
    pub const SEED_PREFIX: &'static str = "sale-data";
    pub const BUMP: &'static u8 = &255;
    //appstate pda
    pub const PDA: &'static str = "7fSHz2oFtvTg2CCQDNpZ7uqhETmKgPygsXH2wKALfYHG";

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

    pub fn new() -> Self {
        SaleData { sales: vec![] }
    }
}
