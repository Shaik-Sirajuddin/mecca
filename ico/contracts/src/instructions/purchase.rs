use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

use crate::state::app_state::{AppState, Sale};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct PurchaseInstruction {
    pub token_amount: u64,
    pub paid_amount: u64,
    pub is_usdt: bool,
}

pub fn purchase(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let owner_acc = next_account_info(account_iter)?;
    let app_state_acc = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;

    assert!(
        *app_state_acc.key == Pubkey::from_str_const(AppState::PDA),
        "App state Id doesn't match wit program"
    );

    assert!(user_acc.is_signer, "User should sign the tranction");
    assert!(owner_acc.is_signer, "Owner should sign the tranction");

    let purchase_instruction = PurchaseInstruction::try_from_slice(instruction_data)?;

    let app_state = &mut AppState::try_from_slice(&app_state_acc.try_borrow_data().unwrap())?;

    assert!(*owner_acc.key == app_state.owner, "Unauthorized");

    let sale = Sale {
        is_usdt: purchase_instruction.is_usdt,
        paid_amount: purchase_instruction.paid_amount,
        token_amount: purchase_instruction.token_amount,
        user: user_acc.key.clone(),
    };

    app_state.sales.push(sale);
    app_state.tokens_sold += purchase_instruction.token_amount;
    if purchase_instruction.is_usdt {
        app_state.usdt_raised += purchase_instruction.paid_amount;
    } else {
        app_state.sol_raised += purchase_instruction.paid_amount;
    }
    
    app_state.realloc_and_save(&[user_acc, app_state_acc, system_program])?;

    Ok(())
}
