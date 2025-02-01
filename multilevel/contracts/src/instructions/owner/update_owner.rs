use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

use crate::{instructions::pda_validator::validate_app_state, state::app_state::AppState};

pub fn update_owner(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let owner_acc = next_account_info(accounts_iter)?;
    let new_owner_acc = next_account_info(accounts_iter)?;
    let app_state_acc = next_account_info(accounts_iter)?;

    validate_app_state(program_id, app_state_acc.key)?;

    let app_state = &mut AppState::try_from_slice(&app_state_acc.try_borrow_mut_data().unwrap())?;
    assert!(app_state.owner == *owner_acc.key, "Unauthorized");
    assert!(owner_acc.is_signer, "Missing Owner Signature");

    app_state.owner = new_owner_acc.key.clone();

    app_state.save(app_state_acc)?;

    Ok(())
}
