use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
};

use crate::state::{app_state::AppState, token_store::TokenStore, user::User};

fn validate_accounts(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let user_data_acc = next_account_info(account_iter)?;
    let app_state_acc = next_account_info(account_iter)?;

    let _user_ata = next_account_info(account_iter)?;
    let app_token_ata = next_account_info(account_iter)?;
    let app_token_owner_acc = next_account_info(account_iter)?;

    let mint_account = next_account_info(account_iter)?;

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

    assert!(
        *app_token_ata.key == Pubkey::from_str_const(TokenStore::ASSOCIATED_TOKEN_ACCOUNT),
        "Provided app token account doesn't match with contract"
    );

    assert!(
        *app_token_owner_acc.key == Pubkey::from_str_const(TokenStore::OWNER_PDA),
        "Provided app token account owner doesn't match with contract"
    );

    assert!(
        *mint_account.key == Pubkey::from_str_const(TokenStore::TOKEN_MINT),
        "Provided token mint doesn't match with contract"
    );
    Ok(())
}

pub fn withdraw(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    validate_accounts(program_id, accounts)?;

    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let user_data_acc = next_account_info(account_iter)?;
    let app_state_acc = next_account_info(account_iter)?;

    let user_ata = next_account_info(account_iter)?;
    let app_token_ata = next_account_info(account_iter)?;
    let app_token_owner_acc = next_account_info(account_iter)?;

    let mint_account = next_account_info(account_iter)?;
    let token_program = next_account_info(account_iter)?;

    let user_data = &mut User::try_from_slice(&user_data_acc.data.try_borrow().unwrap())?;
    let app_state = &AppState::try_from_slice(&app_state_acc.data.borrow())?;

    let withdrawl_request = &mut user_data.withdraw_request;

    let lock_time = if withdrawl_request.is_principal {
        app_state.config.lock_time_principal
    } else {
        app_state.config.lock_time_interest
    };

    assert!(
        withdrawl_request.can_withdraw(lock_time),
        "No withdrawl request in progress or lock period hasn't passed"
    );

    withdrawl_request.is_under_progress = false;
    if withdrawl_request.is_interest() {
        user_data.withdrawn_interest += withdrawl_request.amount;
    }

    invoke_signed(
        &spl_token_2022::instruction::transfer_checked(
            token_program.key,
            app_token_ata.key,
            mint_account.key,
            user_ata.key,
            app_token_owner_acc.key,
            &[app_token_owner_acc.key],
            withdrawl_request.amount,
            *TokenStore::TOKEN_DECIMALS,
        )?,
        &[
            mint_account.clone(),
            app_token_ata.clone(),
            user_ata.clone(),
            app_token_owner_acc.clone(),
            user_acc.clone(),
            token_program.clone(),
        ],
        &[&[
            TokenStore::OWNER_SEED_PREFIX.as_bytes(),
            &[*TokenStore::BUMP],
        ]],
    )?;

    Ok(())
}
