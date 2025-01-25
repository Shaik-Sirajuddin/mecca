use process::process_instruction;
use solana_program::entrypoint::entrypoint;

pub mod instructions;
pub mod process;
pub mod state;
entrypoint!(process_instruction);
