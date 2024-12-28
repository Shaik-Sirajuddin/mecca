use std::str::FromStr;

use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use crate::{
    instructions::{
        enroll_staking::{self, enroll_staking},
        increase_staking::increase_stake,
        initiate_withdrawl_interest::initiate_withdrawl_interest,
        initiate_withdrawl_principal::initiate_withdrawl_principal,
        withdraw::withdraw,
    },
    state::{app_state::AppState, token_store::TokenStore},
};

#[derive(BorshSerialize, BorshDeserialize)]
pub enum InstructionID {
    InitAppState,
    EnrollStaking,
    IncreaseStaking,
    IntiateWithdrawlPrincipal,
    IntiateWithdrawlInterest,
    Withdraw,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let (instruction_id, instruction_data) = instruction_data.split_at(1);
    // init_appstate(program_id, accounts)
    let instruction_id = InstructionID::try_from_slice(instruction_id)?;
    match instruction_id {
        InstructionID::InitAppState => init_appstate(program_id, accounts),
        InstructionID::EnrollStaking => enroll_staking(program_id, accounts, instruction_data),
        InstructionID::IncreaseStaking => increase_stake(program_id, accounts, instruction_data),
        InstructionID::IntiateWithdrawlPrincipal => {
            initiate_withdrawl_principal(program_id, accounts, instruction_data)
        }
        InstructionID::IntiateWithdrawlInterest => {
            initiate_withdrawl_interest(program_id, accounts, instruction_data)
        }
        InstructionID::Withdraw => withdraw(program_id, accounts, instruction_data),
    }
}

fn init_appstate(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
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

fn token_transfer_test(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let from_associated_account = next_account_info(account_iter)?;
    let to_associated_account = next_account_info(account_iter)?;
    let from_owner = next_account_info(account_iter)?;
    let to_pda = next_account_info(account_iter)?;

    let mint_account = next_account_info(account_iter)?;
    let token_program = next_account_info(account_iter)?;

    invoke_signed(
        &spl_token_2022::instruction::transfer_checked(
            token_program.key,
            to_associated_account.key,
            mint_account.key,
            from_associated_account.key,
            to_pda.key,
            &[to_pda.key],
            10,
            9,
        )?,
        &[
            mint_account.clone(),
            to_associated_account.clone(),
            from_associated_account.clone(),
            to_pda.clone(),
            from_owner.clone(),
            token_program.clone(),
        ],
        &[&[TokenStore::OWNER_SEED_PREFIX.as_bytes(), &[255]]],
    )?;

    Ok(())
}
