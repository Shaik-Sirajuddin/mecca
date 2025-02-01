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

use crate::{
    instructions::{
        distribute_referral_rewards::distribute_referral_rewards,
        join::join,
        owner::{update_owner::update_owner, update_state::update_state},
        upgrade_plan::upgrade_plan,
        withdraw::withdraw,
    },
    state::{app_state::AppState, app_store::AppStore},
};

#[derive(BorshSerialize, BorshDeserialize)]
pub enum InstructionID {
    InitState,
    Join,
    Upgrade,
    Withdraw,
    Distribute,
    UpdateState,
    UpdateOwner,
}

pub fn process_instruction(
    program_id: &Pubkey, //TODO : check if a user can send different program address than defined
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let (instruction_id, instruction_data) = instruction_data.split_at(1);
    // init_appstate(program_id, accounts)
    let instruction_id = InstructionID::try_from_slice(instruction_id)?;

    match instruction_id {
        InstructionID::InitState => re_init_state(program_id, accounts, instruction_data),
        InstructionID::Distribute => distribute_referral_rewards(program_id, accounts),
        InstructionID::Join => join(program_id, accounts, instruction_data),
        InstructionID::UpdateState => update_state(program_id, accounts, instruction_data),
        InstructionID::UpdateOwner => update_owner(program_id, accounts, instruction_data),
        InstructionID::Upgrade => upgrade_plan(program_id, accounts, instruction_data),
        InstructionID::Withdraw => withdraw(program_id, accounts, instruction_data),
    }
}

pub fn re_init_state(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let app_state_acc = next_account_info(accounts_iter)?;

    assert!(
        *payer.key == Pubkey::from_str_const(AppState::OWNER),
        "Unauthorized"
    );

    let (derived_app_state_acc, _) =
        Pubkey::find_program_address(&[AppState::SEED.as_bytes()], program_id);

    assert!(
        derived_app_state_acc == *app_state_acc.key,
        "Mismatched app state acc"
    );

    let app_state = AppState::new(payer.key);
    app_state.save(app_state_acc)?;

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

    let (derived_app_state_acc, app_state_bump) =
        Pubkey::find_program_address(&[AppState::SEED.as_bytes()], program_id);

    assert!(
        derived_app_state_acc == *app_state_acc.key,
        "Mismatched app state acc"
    );

    let (derived_app_store_acc, app_store_bump) =
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
        &[&[AppState::SEED.as_bytes(), &[app_state_bump]]],
    )?;
    app_state.save(app_state_acc)?;

    let app_store = AppStore::new();
    let space_required = to_vec(&app_store)?.len();
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
        &[&[AppStore::SEED.as_bytes(), &[app_store_bump]]],
    )?;

    app_store.serialize(&mut &mut app_store_acc.try_borrow_mut_data()?[..])?;
    Ok(())
}
