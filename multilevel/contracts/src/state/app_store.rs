use std::collections::HashMap;

use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program::invoke, pubkey::Pubkey,
    rent::Rent, system_instruction, sysvar::Sysvar,
};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct AppStore {
    pub referral_id_map: HashMap<String, Pubkey>,
}

impl AppStore {
    pub const SEED: &'static str = "app-store";
    pub fn new() -> Self {
        AppStore {
            referral_id_map: HashMap::new(),
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
}
