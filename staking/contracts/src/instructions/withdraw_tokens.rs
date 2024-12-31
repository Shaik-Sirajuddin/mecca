use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
};

use crate::state::{app_state::AppState, token_store::TokenStore};


#[derive(BorshSerialize, BorshDeserialize)]
pub struct WithdrawTokensInstruction {
    pub amount: u64,
}

pub fn withdraw_tokens(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let app_state_acc = next_account_info(account_iter)?;

    let app_token_ata = next_account_info(account_iter)?;
    let app_token_owner_acc = next_account_info(account_iter)?;

    let user_ata = next_account_info(account_iter)?;
    let token_mint = next_account_info(account_iter)?;
    let token_program = next_account_info(account_iter)?;

    let withdraw_instruction = WithdrawTokensInstruction::try_from_slice(instruction_data)?;
    let app_state = &mut AppState::try_from_slice(&app_state_acc.try_borrow_data().unwrap())?;

    assert!(
        *app_state_acc.key == Pubkey::from_str_const(AppState::PDA),
        "Address doesn't match 1"
    );

    assert!(app_state.authority == *user_acc.key, "Unauthorized");

    invoke_signed(
        &spl_token_2022::instruction::transfer_checked(
            token_program.key,
            app_token_ata.key,
            token_mint.key,
            user_ata.key,
            app_token_owner_acc.key,
            &[app_token_owner_acc.key],
            withdraw_instruction.amount,
            TokenStore::TOKEN_DECIMALS.clone(),
        )?,
        &[
            token_mint.clone(),
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
