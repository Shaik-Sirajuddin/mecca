use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

use crate::state::app_config::{AppConfig, Round};

pub fn update_round(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let app_config_acc = next_account_info(account_iter)?;

    let update_instruction = Round::try_from_slice(instruction_data)?;
    let app_config = &mut AppConfig::try_from_slice(&app_config_acc.try_borrow_data().unwrap())?;

    assert!(
        *app_config_acc.key == Pubkey::from_str_const(AppConfig::PDA),
        "Address doesn't match 1"
    );
    assert!(app_config.owner == *user_acc.key, "Unauthorized");

    let idx = update_instruction.idx as usize;

    app_config.rounds[idx] = update_instruction;

    app_config.serialize(&mut &mut app_config_acc.try_borrow_mut_data()?[..])?;

    Ok(())
}
