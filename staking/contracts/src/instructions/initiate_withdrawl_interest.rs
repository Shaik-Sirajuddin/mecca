use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    sysvar::Sysvar,
};

use crate::state::{
    app_state::AppState,
    user::{self, Action, User, WithdrawRequest},
};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct InstructionWithdrawInterest {
    pub amount: u64,
    pub complete_withdrawl: bool,
}

fn validate_accounts(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let user_data_acc = next_account_info(account_iter)?;
    let app_state_acc = next_account_info(account_iter)?;

    let (derived_user_pda, _bump) = Pubkey::find_program_address(
        &[User::SEED_PREFIX.as_bytes(), &user_acc.key.to_bytes()],
        program_id,
    );

    assert!(user_acc.is_signer, "Unauthorized");
    // unique account check ->
    //check the provided user data pda matches exepected , only one data pda per user is allowed
    assert!(
        derived_user_pda == *user_data_acc.key,
        "Mismatched user data accounts"
    );

    //new account check
    //TODO : check if its reliable
    assert!(
        !user_data_acc.data_is_empty(),
        "User data account doesn't exist"
    );

    assert!(
        *app_state_acc.key == Pubkey::from_str_const(AppState::PDA),
        "Provided app state account doesn't match with contract"
    );

    Ok(())
}

pub fn initiate_withdrawl_interest(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    validate_accounts(program_id, accounts)?;
    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let user_data_acc = next_account_info(account_iter)?;
    let app_state_acc = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;

    let user_data = &mut User::try_from_slice(&user_data_acc.data.try_borrow().unwrap())?;
    let app_state = &AppState::try_from_slice(&app_state_acc.data.borrow())?;
    let instruction_withdrawl = InstructionWithdrawInterest::try_from_slice(instruction_data)?;

    let mut amount = instruction_withdrawl.amount;
    let is_complete_withdrawl = instruction_withdrawl.complete_withdrawl;
    assert!(
        user_data.withdraw_request.is_under_progress == false,
        "A withdraw request is in progress"
    );
    assert!(
        is_complete_withdrawl || amount > 0,
        "Amount not provided"
    );

    let cur_time_s = Clock::get()?.unix_timestamp as u64;

    //update user total interest so far
    let interest_unaccounted = user_data.calculate_unaccounted_interest(app_state, cur_time_s);
    user_data.accumulated_interest += interest_unaccounted;

    let available_for_withdrawl = user_data.accumulated_interest - user_data.withdrawn_interest;

    if is_complete_withdrawl {
        amount = available_for_withdrawl;
    }

    assert!(
        amount <= available_for_withdrawl,
        "Amount exceeds accounted interest"
    );

    let withdraw_request = WithdrawRequest {
        amount,
        is_principal: false,
        is_under_progress: true,
        request_time_ms: cur_time_s,
    };
    let action = Action {
        action: user::Act::IntiateWithdrawInterest,
        amount,
        time: cur_time_s,
    };

    //update user staking entries
    user_data.withdraw_request = withdraw_request;
    user_data.stake_time = cur_time_s;
    user_data.change_list_index = app_state.interest_history.len() as u32 - 1;
    user_data.actions.push(action);
    //save user data
    user_data.realloc_and_save(&[user_acc, user_data_acc, system_program])?;

    Ok(())
}
