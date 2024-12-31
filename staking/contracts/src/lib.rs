use process::process_instruction;
use solana_program::entrypoint::entrypoint;

pub mod process;
pub mod state;
pub mod instructions;

entrypoint!(process_instruction);
