use std::{
    io::{Cursor, Write},
    ops::Div,
};

use borsh::{BorshDeserialize, BorshSerialize};

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
    system_instruction,
    sysvar::Sysvar,
};

use crate::state::{
    app_config::{AppConfig, Round},
    sale_data::{Sale, SaleData},
    token_store::TokenStore,
};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct PurchaseInstruction {
    pub paid_amount: u64,
    pub is_usdt: bool,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct PriceInfo {
    /// The round id.
    pub round_id: u32,
    /// Slot at the time the report was received on chain.
    pub slot: u64,
    /// Round timestamp, as reported by the oracle.
    pub timestamp: u32,
    /// Current answer, formatted to `decimals` decimal places.
    pub answer: i128,
}

fn get_usd_equivalent_sol(lamports: u64, price_account_info: &AccountInfo) -> u64 {
    const QUERY_INSTRUCTION_DISCRIMINATOR: &[u8] =
        &[0x27, 0xfb, 0x82, 0x9f, 0x2e, 0x88, 0xa4, 0xa9];

    const MAX_SIZE: usize = QUERY_INSTRUCTION_DISCRIMINATOR.len() + std::mem::size_of::<Pubkey>();

    let mut data = Cursor::new(Vec::with_capacity(MAX_SIZE));
    data.write_all(QUERY_INSTRUCTION_DISCRIMINATOR).unwrap();
    4u8.serialize(&mut data).unwrap();

    let ix = Instruction {
        program_id: Pubkey::from_str_const(AppConfig::PRICE_FEED_CONTRACT),
        accounts: vec![AccountMeta::new_readonly(*price_account_info.key, false)],
        data: data.into_inner(),
    };
    invoke(&ix, &[price_account_info.clone()]).unwrap();

    let (_key, data) =
        solana_program::program::get_return_data().expect("chainlink store had no return_data!");

    let data = PriceInfo::try_from_slice(&data).unwrap();

    let price = data.answer as u128;
    //solana 9 decimals , usd 6 decimals -> 3 places to be removed from calculation, 8 decimals price feed
    let usd_equivalent = (lamports as u128 * price) / 10u128.pow(11);
    usd_equivalent as u64
}

fn validate_accounts(_program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let _user_acc = next_account_info(account_iter)?;
    let app_config_acc = next_account_info(account_iter)?;
    let sale_data_acc = next_account_info(account_iter)?;

    let _user_usdt_ata = next_account_info(account_iter)?;
    let _user_token_ata = next_account_info(account_iter)?;

    let app_token_ata = next_account_info(account_iter)?;
    let app_token_owner_acc = next_account_info(account_iter)?;

    let usdt_mint = next_account_info(account_iter)?;
    let token_mint = next_account_info(account_iter)?;

    let price_feed_acc = next_account_info(account_iter)?;

    assert!(
        *app_config_acc.key == Pubkey::from_str_const(AppConfig::PDA),
        "Address doesn't match 1"
    );

    assert!(
        *sale_data_acc.key == Pubkey::from_str_const(SaleData::PDA),
        "Address doesn't match 2"
    );

    assert!(
        *app_token_owner_acc.key == Pubkey::from_str_const(TokenStore::OWNER_PDA),
        "Address doesn't match 3"
    );

    assert!(
        *app_token_ata.key == Pubkey::from_str_const(TokenStore::ASSOCIATED_TOKEN_ACCOUNT),
        "Address doesn't match 4"
    );

    assert!(
        *usdt_mint.key == Pubkey::from_str_const(TokenStore::USDT_MINT),
        "Address doesn't match 5"
    );

    assert!(
        *token_mint.key == Pubkey::from_str_const(TokenStore::TOKEN_MINT),
        "Address doesn't match 6"
    );

    assert!(
        *price_feed_acc.key == Pubkey::from_str_const(AppConfig::PRICE_FEED),
        "Address doesn't match 7"
    );

    Ok(())
}

pub fn fetch_current_round(app_config: &AppConfig) -> Option<&Round> {
    let cur_time_s = Clock::get().unwrap().unix_timestamp as u64;

    let mut idx = 0;

    while idx < app_config.rounds.len() {
        if app_config.rounds[idx].end_time > cur_time_s {
            return Some(&app_config.rounds[idx]);
        }

        idx += 1;
    }
    None
}

pub fn purchase(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    validate_accounts(_program_id, accounts)?;

    let account_iter = &mut accounts.iter();
    let user_acc = next_account_info(account_iter)?;
    let app_config_acc = next_account_info(account_iter)?;
    let sale_data_acc = next_account_info(account_iter)?;

    let user_usdt_ata = next_account_info(account_iter)?;
    let user_token_ata = next_account_info(account_iter)?;

    let app_token_ata = next_account_info(account_iter)?;
    let app_token_owner_acc = next_account_info(account_iter)?;

    let usdt_mint = next_account_info(account_iter)?;
    let token_mint = next_account_info(account_iter)?;

    let price_feed_acc = next_account_info(account_iter)?;

    let usdt_receivable_ata = next_account_info(account_iter)?;
    let recievable_acc = next_account_info(account_iter)?;

    let usdt_program = next_account_info(account_iter)?;
    let token_program = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;

    //TODO : check if its required to check for valid usdt_receivable_ata

    let purchase_instruction = PurchaseInstruction::try_from_slice(instruction_data)?;

    let app_config = &mut AppConfig::try_from_slice(&app_config_acc.try_borrow_data().unwrap())?;
    let sale_data = &mut SaleData::try_from_slice(&sale_data_acc.try_borrow_data().unwrap())?;

    assert!(
        *recievable_acc.key == app_config.deposit_acc,
        "Depoisit account doesn't match"
    );

    assert!(app_config.paused == false, "Sale is paused");
    let cur_time_s = Clock::get().unwrap().unix_timestamp as u64;

    assert!(
        cur_time_s >= app_config.start_time,
        "Sale hasn't started yet"
    );

    //panic if no round found
    let cur_round = fetch_current_round(app_config).unwrap();

    let mut usdt_value = purchase_instruction.paid_amount;

    if !purchase_instruction.is_usdt {
        usdt_value = get_usd_equivalent_sol(purchase_instruction.paid_amount, price_feed_acc);
    }

    let user_receivable = (usdt_value as u128)
        .checked_mul(10u128.pow(cur_round.price_decimals as u32))
        .unwrap()
        .div(cur_round.round_price as u128) as u64; //TODO : make sure no overflow

    //transfer sol or usdt from user

    if purchase_instruction.is_usdt {
        invoke(
            &spl_token_2022::instruction::transfer_checked(
                usdt_program.key,
                user_usdt_ata.key,
                usdt_mint.key,
                usdt_receivable_ata.key,
                user_acc.key,
                &[user_acc.key],
                usdt_value,
                TokenStore::USDT_DECIMALS.clone(),
            )?,
            &[
                usdt_mint.clone(),
                user_usdt_ata.clone(),
                usdt_receivable_ata.clone(),
                user_acc.clone(),
                recievable_acc.clone(),
                usdt_program.clone(),
            ],
        )?;
    } else {
        invoke(
            &system_instruction::transfer(
                user_acc.key,
                recievable_acc.key,
                purchase_instruction.paid_amount,
            ),
            &[
                user_acc.clone(),
                recievable_acc.clone(),
                system_program.clone(),
            ],
        )?;
    }

    //transfer tokens to user
    invoke_signed(
        &spl_token_2022::instruction::transfer_checked(
            token_program.key,
            app_token_ata.key,
            token_mint.key,
            user_token_ata.key,
            app_token_owner_acc.key,
            &[app_token_owner_acc.key],
            user_receivable,
            TokenStore::TOKEN_DECIMALS.clone(),
        )?,
        &[
            token_mint.clone(),
            app_token_ata.clone(),
            user_token_ata.clone(),
            app_token_owner_acc.clone(),
            user_acc.clone(),
            token_program.clone(),
        ],
        &[&[
            TokenStore::OWNER_SEED_PREFIX.as_bytes(),
            &[*TokenStore::BUMP],
        ]],
    )?;

    let sale = Sale {
        is_usdt: purchase_instruction.is_usdt,
        paid_amount: purchase_instruction.paid_amount,
        token_amount: user_receivable,
        user: user_acc.key.clone(),
        time: cur_time_s,
    };

    sale_data.sales.push(sale);
    app_config.tokens_sold += user_receivable;
    if purchase_instruction.is_usdt {
        app_config.usdt_raised += purchase_instruction.paid_amount;
    } else {
        app_config.sol_raised += purchase_instruction.paid_amount;
    }

    sale_data.realloc_and_save(&[user_acc, sale_data_acc, system_program])?;
    app_config.serialize(&mut &mut app_config_acc.try_borrow_mut_data()?[..])?;

    //save app config
    Ok(())
}
