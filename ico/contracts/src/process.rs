use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

use crate::instructions::{init_state::init_state, purchase::purchase, update_owner::update_owner};

#[derive(BorshSerialize, BorshDeserialize)]
enum InstructionID {
    InitState,
    Purchase,
    UpdateOwner,
}
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let (instruction_id, instruction_data) = instruction_data.split_at(1);
    let instruction_id = InstructionID::try_from_slice(instruction_id)?;

    match instruction_id {
        InstructionID::InitState => init_state(program_id, accounts, instruction_data),
        InstructionID::Purchase => purchase(program_id, accounts, instruction_data),
        InstructionID::UpdateOwner => update_owner(program_id, accounts, instruction_data),
    }
}
