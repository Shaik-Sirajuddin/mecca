use process::process_instruction;
use solana_program::{
    account_info::AccountInfo,
    entrypoint::{entrypoint, ProgramResult},
    pubkey::Pubkey,
};

pub mod process;
pub mod state;
pub mod instructions;

entrypoint!(process_instruction);
