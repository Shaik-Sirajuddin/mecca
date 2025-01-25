use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

use crate::state::app_config::AppConfig;

pub fn update_owner(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let owner_acc = next_account_info(account_iter)?;
    let new_owner_acc = next_account_info(account_iter)?;
    let app_config_acc = next_account_info(account_iter)?;

    assert!(
        *app_config_acc.key == Pubkey::from_str_const(AppConfig::PDA),
        "App state Id doesn't match with program"
    );
    assert!(owner_acc.is_signer, "Owner should sign the tranction");

    let app_state = &mut AppConfig::try_from_slice(&app_config_acc.try_borrow_data().unwrap())?;

    assert!(*owner_acc.key == app_state.owner, "Unauthorized");

    app_state.owner = new_owner_acc.key.clone();

    app_state.serialize(&mut &mut app_config_acc.try_borrow_mut_data()?[..])?;

    Ok(())
}
