use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, pubkey::Pubkey};

use crate::instructions::{
    enroll_staking::enroll_staking, increase_staking::increase_stake,
    init_app_state::init_appstate, initiate_withdrawl_interest::initiate_withdrawl_interest,
    initiate_withdrawl_principal::initiate_withdrawl_principal, update_config::update_config,
    update_owner::update_owner, withdraw::withdraw, withdraw_tokens::withdraw_tokens,
};

#[derive(BorshSerialize, BorshDeserialize)]
pub enum InstructionID {
    InitAppState,
    EnrollStaking,
    IncreaseStaking,
    IntiateWithdrawlPrincipal,
    IntiateWithdrawlInterest,
    Withdraw,
    UpdateConfig,
    UpdateOwner,
    WithdrawTokens,
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
        InstructionID::UpdateConfig => update_config(program_id, accounts, instruction_data),
        InstructionID::UpdateOwner => update_owner(program_id, accounts, instruction_data),
        InstructionID::WithdrawTokens => withdraw_tokens(program_id, accounts, instruction_data)
    }
}
