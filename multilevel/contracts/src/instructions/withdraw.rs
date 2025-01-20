use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    sysvar::Sysvar,
};

use crate::state::{
    action::{Action, UserAction},
    app_state::AppState,
    token_store::TokenStore,
    user::{UserData, UserStore},
};

use super::pda_validator::{validate_app_state, validate_user_data_acc, validate_user_store_acc};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct WithdrawInstruction {
    pub amount: u64,
}

pub fn validate_accounts(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let user_acc = next_account_info(accounts_iter)?;

    let app_state_acc = next_account_info(accounts_iter)?;
    let user_data_acc = next_account_info(accounts_iter)?;
    let user_store_acc = next_account_info(accounts_iter)?;

    let mint_account = next_account_info(accounts_iter)?;
    let _user_token_account = next_account_info(accounts_iter)?;
    let _app_token_account = next_account_info(accounts_iter)?;
    let app_token_owner = next_account_info(accounts_iter)?;

    validate_app_state(program_id, app_state_acc.key)?;
    validate_user_data_acc(program_id, user_acc.key, user_data_acc.key)?;
    validate_user_store_acc(program_id, user_acc.key, user_store_acc.key)?;

    assert!(
        *mint_account.key == Pubkey::from_str_const(TokenStore::TOKEN_MINT),
        "Mismatched mint account"
    );
    let (derived_app_token_owner, _) =
        Pubkey::find_program_address(&[TokenStore::SEED_PREFIX_HOLDER.as_bytes()], program_id);

    assert!(
        *app_token_owner.key == derived_app_token_owner,
        "Mismatched app token owner account"
    );

    Ok(())
}
pub fn withdraw(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    validate_accounts(program_id, accounts)?;
    let accounts_iter = &mut accounts.iter();
    let user_acc = next_account_info(accounts_iter)?;

    let app_state_acc = next_account_info(accounts_iter)?;
    let user_data_acc = next_account_info(accounts_iter)?;
    let user_store_acc = next_account_info(accounts_iter)?;

    let mint_account = next_account_info(accounts_iter)?;
    let user_token_account = next_account_info(accounts_iter)?;
    let app_token_account = next_account_info(accounts_iter)?;
    let app_token_owner = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let withdraw_instruction = WithdrawInstruction::try_from_slice(instruction_data)?;

    let app_state = &AppState::try_from_slice(&app_state_acc.try_borrow_data().unwrap())?;
    let user_data = &mut UserData::try_from_slice(&user_data_acc.try_borrow_mut_data().unwrap())?;
    let user_store =
        &mut UserStore::try_from_slice(&user_store_acc.try_borrow_mut_data().unwrap())?;

    let cur_time = Clock::get().unwrap().unix_timestamp as u64;
    user_data.reward(cur_time, app_state);

    assert!(
        withdraw_instruction.amount <= user_data.get_withdrawable_amount(),
        "Amount exceeds withdrawable amount"
    );

    user_data.withdrawn_amount += withdraw_instruction.amount;
    user_store.actions.push(UserAction {
        action: Action::WITDHRAW,
        amount: withdraw_instruction.amount,
        plan_id: 10,
    });
    user_store.realloc_and_save(&[user_acc, user_store_acc, system_program])?;
    user_data.save(user_data_acc)?;

    let (_, bump) =
        Pubkey::find_program_address(&[TokenStore::SEED_PREFIX_HOLDER.as_bytes()], program_id);

    //transfer tokens from user
    invoke_signed(
        &spl_token_2022::instruction::transfer_checked(
            token_program.key,
            app_token_account.key,
            mint_account.key,
            user_token_account.key,
            app_token_owner.key,
            &[app_token_owner.key],
            withdraw_instruction.amount,
            *TokenStore::DECIMALS,
        )?,
        &[
            mint_account.clone(),
            app_token_account.clone(),
            user_token_account.clone(),
            app_token_owner.clone(),
            user_acc.clone(),
            token_program.clone(),
        ],
        &[&[TokenStore::SEED_PREFIX_HOLDER.as_bytes(), &[bump]]],
    )?;
    Ok(())
}
