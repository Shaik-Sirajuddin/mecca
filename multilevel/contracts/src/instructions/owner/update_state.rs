use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

use crate::{instructions::pda_validator::validate_app_state, state::app_state::AppState};

/**
 * When status is paused , new enrollments , upgrades aren't possible
 */

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UpdateStateInstruction {
    pub paused: bool,
    pub owner: Pubkey,
}
pub fn update_state(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let owner_acc = next_account_info(accounts_iter)?;
    let app_state_acc = next_account_info(accounts_iter)?;

    validate_app_state(program_id, app_state_acc.key)?;

    let app_state = &mut AppState::try_from_slice(&app_state_acc.try_borrow_mut_data().unwrap())?;
    assert!(app_state.owner == *owner_acc.key, "Unauthorized");
    assert!(owner_acc.is_signer, "Missing Owner Signature");

    let update_state_instruction = UpdateStateInstruction::try_from_slice(instruction_data)?;

    app_state.owner = update_state_instruction.owner;
    app_state.paused = update_state_instruction.paused;

    app_state.save(app_state_acc)?;

    Ok(())
}
