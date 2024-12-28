use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    program::invoke,
    pubkey::Pubkey,
    sysvar::Sysvar,
};

use crate::state::app_state::AppState;
use crate::state::token_store::TokenStore;
use crate::state::user::{Act, Action, User};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct IncreaseInstruction {
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
        !user_data.data_is_empty(),
        "User data account doesn't exist"
    );

    assert!(
        *app_state.key == Pubkey::from_str_const(AppState::PDA),
        "Provided app state account doesn't match with contract"
    );

    assert!(
        *app_token_account.key == Pubkey::from_str_const(TokenStore::ASSOCIATED_TOKEN_ACCOUNT),
        "Provided app token account doesn't match with contract"
    );

    assert!(
        *app_token_account_owner.key == Pubkey::from_str_const(TokenStore::OWNER_PDA),
        "Provided app token account owner doesn't match with contract"
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
    previous_amount: u64,
    amount: u64,
    app_state: &mut AppState,
    accounts: &[&AccountInfo],
) -> ProgramResult {
    let app_state_account = accounts[0];
    let user_account = accounts[1];
    let system_account = accounts[2];

    let prev_stake_amount = app_state.staked_amount;

    if previous_amount == 0 {
        app_state.user_count += 1;
    }
    app_state.staked_amount += amount;

    //interest is decreased by 0.2% for every 10_000_000 stake amount
    let should_realloc = app_state.adjust_interest(prev_stake_amount, stake_time, true);

    //reallocate if space exceeds

    if should_realloc {
        app_state.realloc_and_save(&[user_account, app_state_account, system_account])?;
    } else {
        app_state.serialize(&mut &mut app_state_account.try_borrow_mut_data()?[..])?;
    }

    Ok(())
}

fn update_user(user: &mut User, amount: u64, cur_time_s: u64, app_state: &mut AppState) {
    let action = Action {
        action: Act::IncreaseStake,
        amount,
        time: cur_time_s,
    };
    let cur_time_s = Clock::get().unwrap().unix_timestamp as u64;
    let unaccounted_interest = user.calculate_unaccounted_interest(app_state, cur_time_s);
    user.accumulated_interest += unaccounted_interest;
    user.stake_time = cur_time_s;
    user.principal_in_stake += amount;
    user.change_list_index = (app_state.interest_history.len() as u32) - 1;
    user.actions.push(action);
}

pub fn increase_stake(
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

    let increase_instruction = IncreaseInstruction::try_from_slice(instruction_data)?;
    let app_state_data = &mut AppState::try_from_slice(&app_state.data.try_borrow().unwrap())?;
    let user_acc_data = &mut User::try_from_slice(&user_data_account.data.try_borrow().unwrap())?;

    assert!(
        increase_instruction.amount >= app_state_data.min_deposit_user,
        "Amount less than minimum threshould"
    );

    assert!(
        user_acc_data.principal_in_stake + increase_instruction.amount
            <= app_state_data.max_deposit_user,
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
            increase_instruction.amount,
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

    let previous_stake_amount = user_acc_data.principal_in_stake;
    update_user(
        user_acc_data,
        increase_instruction.amount,
        stake_time,
        app_state_data,
    );

    user_acc_data.realloc_and_save(&[user, user_data_account, system_program])?;

    //update app state
    update_app_state(
        stake_time,
        previous_stake_amount,
        increase_instruction.amount,
        app_state_data,
        &[app_state, user, system_program],
    )?;

    Ok(())
}
