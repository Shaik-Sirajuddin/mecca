use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use crate::state::token_store::TokenStore;
use crate::state::user::{Act, Action, User};
use crate::state::{app_state::AppState, user::WithdrawRequest};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct EnrollInstruction {
    pub amount: u64,
}

fn validate_accounts(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let user = next_account_info(account_iter)?;
    let user_data = next_account_info(account_iter)?;

    let app_state = next_account_info(account_iter)?;
    let app_token_account = next_account_info(account_iter)?;
    let app_token_account_owner = next_account_info(account_iter)?;

    let _user_token_account = next_account_info(account_iter)?;

    let mint_account = next_account_info(account_iter)?;
    let _token_program = next_account_info(account_iter)?;

    let (derived_user_pda, _bump) = Pubkey::find_program_address(
        &[User::SEED_PREFIX.as_bytes(), &user.key.to_bytes()],
        program_id,
    );

    // unique account check ->
    //check the provided user data pda matches exepected , only one data pda per user is allowed
    assert!(
        derived_user_pda == *user_data.key,
        "Mismatched user data accounts"
    );

    //new account check
    //TODO : check if its reliable
    assert!(
        user_data.data_is_empty(),
        "User data account already intialized"
    );

    assert!(
        *app_state.key == Pubkey::from_str_const(AppState::PDA),
        "Provided app state account doesn't match with contract"
    );

    assert!(
        *app_token_account.key == Pubkey::from_str_const(TokenStore::ASSOCIATED_TOKEN_ACCOUNT),
        "Provided contract ata doesn't match with contract"
    );

    assert!(
        *app_token_account_owner.key == Pubkey::from_str_const(TokenStore::OWNER_PDA),
        "Provided contract ata owner doesn't match with contract"
    );

    assert!(
        *mint_account.key == Pubkey::from_str_const(TokenStore::TOKEN_MINT),
        "Provided token mint doesn't match with contract"
    );

    Ok(())
}

/**
 *
 */
fn update_app_state(
    stake_time: u64,
    amount: u64,
    app_state: &mut AppState,
    accounts: &[&AccountInfo],
) -> ProgramResult {
    let app_state_account = accounts[0];
    let user_account = accounts[1];
    let system_account = accounts[2];

    let prev_stake_amount = app_state.staked_amount;
    app_state.user_count += 1;
    app_state.total_registered += 1;
    app_state.staked_amount += amount;

    let should_realloc;

    //interest is decreased by 0.2% for every 100 signups
    should_realloc = app_state.adjust_interest(prev_stake_amount, stake_time, true);
    //reallocate is space exceeds

    if should_realloc {
        app_state.realloc_and_save(&[user_account, app_state_account, system_account])?;
    } else {
        app_state.serialize(&mut &mut app_state_account.try_borrow_mut_data()?[..])?;
    }

    Ok(())
}
pub fn enroll_staking(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    validate_accounts(program_id, accounts)?;
    //TODO : Add check for minimum staking amount
    //accounts -> stake account / stake account , app state account , system program
    let account_iter = &mut accounts.iter();
    let user = next_account_info(account_iter)?;
    let user_data_account = next_account_info(account_iter)?;

    let app_state = next_account_info(account_iter)?;
    let app_token_account = next_account_info(account_iter)?;
    let app_token_account_owner = next_account_info(account_iter)?;

    let user_token_account = next_account_info(account_iter)?;

    let mint_account = next_account_info(account_iter)?;
    let token_program = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;

    let (_, bump) = Pubkey::find_program_address(
        &[User::SEED_PREFIX.as_bytes(), &user.key.to_bytes()],
        program_id,
    );

    let enroll_instruction = EnrollInstruction::try_from_slice(instruction_data)?;
    let app_state_data = &mut AppState::try_from_slice(&app_state.data.borrow())?;

    assert!(
        enroll_instruction.amount >= app_state_data.config.min_deposit_user,
        "Amount less than minimum threshould"
    );

    assert!(
        enroll_instruction.amount <= app_state_data.config.max_deposit_user,
        "Amount exceeds maximum threshould"
    );

    //transfer spl tokens from user
    invoke(
        &spl_token_2022::instruction::transfer_checked(
            token_program.key,
            user_token_account.key,
            mint_account.key,
            app_token_account.key,
            user.key,
            &[user.key],
            enroll_instruction.amount,
            TokenStore::TOKEN_DECIMALS.clone(),
        )?,
        &[
            mint_account.clone(),
            user_token_account.clone(),
            app_token_account.clone(),
            user.clone(),
            app_token_account_owner.clone(),
            token_program.clone(),
        ],
    )?;

    let stake_time = Clock::get()?.unix_timestamp as u64;
    //create user pda
    let action = Action {
        action: Act::EnrollStaking,
        amount: enroll_instruction.amount,
        time: stake_time,
    };

    let user_acc_data = User {
        accumulated_interest: 0,
        withdrawn_interest: 0,
        actions: vec![action],
        change_list_index: app_state_data.interest_history.len() as u32 - 1,
        principal_in_stake: enroll_instruction.amount,
        stake_time,
        withdraw_request: WithdrawRequest::new(),
    };

    let space_required = to_vec(&user_acc_data)?.len();

    let rent_required = Rent::get()?.minimum_balance(space_required);

    //create user pda account
    invoke_signed(
        &system_instruction::create_account(
            user.key,
            user_data_account.key,
            rent_required,
            space_required as u64,
            program_id,
        ),
        &[
            user.clone(),
            user_data_account.clone(),
            system_program.clone(),
        ],
        &[&[User::SEED_PREFIX.as_bytes(), &user.key.to_bytes(), &[bump]]],
    )?;

    //store data into pda account
    user_acc_data.serialize(&mut &mut user_data_account.try_borrow_mut_data()?[..])?;

    //update app state
    update_app_state(
        stake_time,
        enroll_instruction.amount,
        app_state_data,
        &[app_state, user, system_program],
    )?;

    Ok(())
}
