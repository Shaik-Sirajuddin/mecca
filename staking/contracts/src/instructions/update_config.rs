use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

use crate::state::app_state::{AppState, Config};

pub fn update_config(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let app_state_acc = next_account_info(account_iter)?;

    assert!(
        *app_state_acc.key == Pubkey::from_str_const(AppState::PDA),
        "Mismatched app state account pda"
    );

    let app_state = &mut AppState::try_from_slice(&app_state_acc.data.borrow())?;
    let new_config = Config::try_from_slice(instruction_data).unwrap();

    assert!(*user_acc.key == app_state.authority, "Unauthorized");

    app_state.config = new_config;
    app_state.serialize(&mut &mut app_state_acc.try_borrow_mut_data()?[..])?;

    Ok(())
}
