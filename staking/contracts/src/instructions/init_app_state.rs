use borsh::{to_vec, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use crate::state::app_state::AppState;

pub fn init_appstate(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let payer = next_account_info(account_iter)?;
    let app_state_account = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;

    assert!(
        *payer.key == Pubkey::from_str_const(AppState::OWNER),
        "Payer as owner not allowed"
    );

    assert!(
        *app_state_account.key == Pubkey::from_str_const(AppState::PDA),
        "Mismatched app state account pda"
    );

    assert!(
        app_state_account.data_is_empty(),
        "State account is intialized"
    );

    let app_state = AppState::new(payer.key);

    let space_required = to_vec(&app_state)?.len();

    let rent_required = Rent::get()?.minimum_balance(space_required);

    //create user pda account
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            app_state_account.key,
            rent_required,
            space_required as u64,
            program_id,
        ),
        &[
            payer.clone(),
            app_state_account.clone(),
            system_program.clone(),
        ],
        &[&[AppState::SEED_PREFIX.as_bytes(), &[*AppState::BUMP]]],
    )?;

    app_state.serialize(&mut &mut app_state_account.try_borrow_mut_data()?[..])?;

    Ok(())
}
