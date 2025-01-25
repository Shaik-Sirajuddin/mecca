use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

use crate::state::app_config::AppConfig;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UpdateConfigInstruction {
    pub paused: bool,
    pub start_time: u64,
    pub deposit_acc: Pubkey,
}

pub fn update_config(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let app_config_acc = next_account_info(account_iter)?;

    let update_instruction = UpdateConfigInstruction::try_from_slice(instruction_data)?;
    let app_config = &mut AppConfig::try_from_slice(&app_config_acc.try_borrow_data().unwrap())?;

    assert!(
        *app_config_acc.key == Pubkey::from_str_const(AppConfig::PDA),
        "Address doesn't match 1"
    );

    assert!(app_config.owner == *user_acc.key, "Unauthorized");

    app_config.deposit_acc = update_instruction.deposit_acc;
    app_config.paused = update_instruction.paused;
    app_config.start_time = update_instruction.start_time;

    app_config.serialize(&mut &mut app_config_acc.try_borrow_mut_data()?[..])?;

    Ok(())
}
