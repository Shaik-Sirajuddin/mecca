use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use crate::state::{app_state::AppState, app_store::AppStore};

#[derive(BorshSerialize, BorshDeserialize)]
pub enum InstructionID {
    JOIN,
    UPGRADE,
    WITDHRAW,
}

pub fn process_instruction(
    program_id: &Pubkey, //TODO : check if a user can send different program address than defined
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let (instruction_id, instruction_data) = instruction_data.split_at(1);
    // init_appstate(program_id, accounts)
    let instruction_id = InstructionID::try_from_slice(instruction_id)?;
    Ok(())
}

pub fn init_state(
    program_id: &Pubkey, //TODO : check if a user can send different program address than defined
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let app_state_acc = next_account_info(accounts_iter)?;
    let app_store_acc = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    assert!(
        *payer.key == Pubkey::from_str_const(AppState::OWNER),
        "Unauthorized"
    );

    let (derived_app_state_acc, bump) =
        Pubkey::find_program_address(&[AppState::SEED.as_bytes()], program_id);

    assert!(
        derived_app_state_acc == *app_state_acc.key,
        "Mismatched app state acc"
    );

    let (derived_app_store_acc, bump) =
        Pubkey::find_program_address(&[AppStore::SEED.as_bytes()], program_id);

    assert!(
        derived_app_store_acc == *app_store_acc.key,
        "Mismatched app store acc"
    );

    let app_state = AppState::new(payer.key);
    let space_required = to_vec(&app_state)?.len();
    let rent_required = Rent::get()?.minimum_balance(space_required);

    //create app state pda
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            app_state_acc.key,
            rent_required,
            space_required as u64,
            program_id,
        ),
        &[payer.clone(), app_state_acc.clone(), system_program.clone()],
        &[&[AppState::SEED.as_bytes(), &[bump]]],
    )?;
    app_state.save(app_state_acc)?;

    let app_store = AppStore::new();
    let space_required = to_vec(&app_state)?.len();
    let rent_required = Rent::get()?.minimum_balance(space_required);

    //create app store pda
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            app_store_acc.key,
            rent_required,
            space_required as u64,
            program_id,
        ),
        &[payer.clone(), app_store_acc.clone(), system_program.clone()],
        &[&[AppStore::SEED.as_bytes(), &[bump]]],
    )?;

    app_store.serialize(&mut &mut app_store_acc.try_borrow_mut_data()?[..])?;
    Ok(())
}
