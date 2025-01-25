use borsh::{to_vec, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use crate::state::{
    app_config::AppConfig,
    sale_data::SaleData,
};

pub fn init_state(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let payer = next_account_info(account_iter)?;
    let sale_data_acc = next_account_info(account_iter)?;
    let app_config_acc = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;

    assert!(
        *payer.key == Pubkey::from_str_const(AppConfig::OWNER),
        "Payer as owner not allowed"
    );

    assert!(
        *sale_data_acc.key == Pubkey::from_str_const(SaleData::PDA),
        "Mismatched sale data account pda"
    );

    assert!(
        *app_config_acc.key == Pubkey::from_str_const(AppConfig::PDA),
        "Mismatched app config pda"
    );

    assert!(app_config_acc.data_is_empty(), "Sale config is intialized");
    assert!(sale_data_acc.data_is_empty(), "Sale Data is intialized");

    let sale_data = SaleData::new();

    let space_required = to_vec(&sale_data)?.len();

    let rent_required = Rent::get()?.minimum_balance(space_required);

    //create user pda account
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            sale_data_acc.key,
            rent_required,
            space_required as u64,
            program_id,
        ),
        &[payer.clone(), sale_data_acc.clone(), system_program.clone()],
        &[&[SaleData::SEED_PREFIX.as_bytes(), &[*SaleData::BUMP]]],
    )?;

    sale_data.serialize(&mut &mut sale_data_acc.try_borrow_mut_data()?[..])?;

    let app_config = AppConfig::new(payer.key);
    let space_required = to_vec(&app_config)?.len();

    let rent_required = Rent::get()?.minimum_balance(space_required);

    //create user pda account
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            app_config_acc.key,
            rent_required,
            space_required as u64,
            program_id,
        ),
        &[
            payer.clone(),
            app_config_acc.clone(),
            system_program.clone(),
        ],
        &[&[AppConfig::SEED_PREFIX.as_bytes(), &[*AppConfig::BUMP]]],
    )?;

    app_config.serialize(&mut &mut app_config_acc.try_borrow_mut_data()?[..])?;

    Ok(())
}
