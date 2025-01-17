use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
    rent::Rent,
    system_instruction, system_program,
    sysvar::Sysvar,
};

use crate::{
    instructions::pda_validator::{validate_app_state, validate_app_store_acc},
    state::{
        app_state::AppState,
        app_store::AppStore,
        plan::Plan,
        token_store::TokenStore,
        user::{UserData, UserStore},
    },
};

use super::pda_validator::{validate_user_data_acc, validate_user_store_acc};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct JoinInstruction {
    pub plan_id: u8,
    pub referrer: Pubkey,
    pub user_id: String, //unique referral code for user
}

fn is_valid_id(s: &str) -> bool {
    // Check if the length is exactly 10
    if s.len() != 10 {
        return false;
    }

    // Check if the first two characters are "MC"
    if &s[0..2] != "MC" {
        return false;
    }

    // Check if the remaining 8 characters are all digits
    s[2..].chars().all(|c| c.is_ascii_digit())
}

fn validate_accounts(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();
    let payer_acc = next_account_info(accounts_iter)?;
    let app_state_acc = next_account_info(accounts_iter)?;
    let app_store_acc = next_account_info(accounts_iter)?;

    let user_data_acc = next_account_info(accounts_iter)?;
    let user_store_acc = next_account_info(accounts_iter)?;

    validate_app_state(program_id, app_state_acc.key)?;
    validate_app_store_acc(program_id, app_store_acc.key)?;
    validate_user_data_acc(program_id, payer_acc.key, user_data_acc.key)?;
    validate_user_store_acc(program_id, payer_acc.key, user_store_acc.key)?;

    Ok(())
}

pub fn join(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    validate_accounts(program_id, accounts)?;

    let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();
    let payer_acc = next_account_info(accounts_iter)?;
    let app_state_acc = next_account_info(accounts_iter)?;
    let app_store_acc = next_account_info(accounts_iter)?;

    let user_data_acc = next_account_info(accounts_iter)?;
    let user_store_acc = next_account_info(accounts_iter)?;

    let referrer_data_acc = next_account_info(accounts_iter)?;
    let mint_account = next_account_info(accounts_iter)?;
    let user_token_account = next_account_info(accounts_iter)?;
    let app_token_account = next_account_info(accounts_iter)?;
    let app_token_owner = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let join_instruction = &mut JoinInstruction::try_from_slice(instruction_data)?;

    let app_state = AppState::try_from_slice(&app_state_acc.try_borrow_data().unwrap())?;
    let app_store = &mut AppStore::try_from_slice(&app_store_acc.try_borrow_mut_data().unwrap())?;

    if join_instruction.referrer != *payer_acc.key {
        //check if referrer data account provided match the provided referrer
        validate_user_data_acc(
            program_id,
            &join_instruction.referrer,
            referrer_data_acc.key,
        )?;

        //check if referrer is valid
        //will throw an error if user data account is not created
        UserData::try_from_slice(&referrer_data_acc.try_borrow_data().unwrap())?;
    }

    let plan = app_state.get_plan(join_instruction.plan_id).unwrap();
    //check if user data account already exists
    let new_user = !(user_data_acc.lamports() == 0 || *user_data_acc.owner == system_program::ID);

    let cur_time = Clock::get().unwrap().unix_timestamp as u64;
    let user_data: UserData = if new_user {
        assert!(
            is_valid_id(join_instruction.user_id.as_str()),
            "UserId in invalid format"
        );
        assert!(
            app_store
                .referral_id_map
                .contains_key(join_instruction.user_id.as_str())
                == false,
            "User with Id already exists"
        );
        UserData::new(
            &join_instruction.user_id,
            payer_acc.key,
            &join_instruction.referrer,
            cur_time,
            plan,
            app_state.daily_fee,
        )
    } else {
        let res = UserData::try_from_slice(&user_data_acc.try_borrow_data().unwrap())?;
        res
    };

    let user_store = if new_user {
        UserStore::new(payer_acc.key.clone())
    } else {
        UserStore::try_from_slice(&user_store_acc.try_borrow_data().unwrap())?
    };

    //create accounts for new user
    if new_user {
        //create accounts

        let (_, bump) = Pubkey::find_program_address(
            &[UserData::SEED_PREFIX.as_bytes(), &payer_acc.key.to_bytes()],
            program_id,
        );

        let space_required = to_vec(&user_data)?.len();
        let rent_required = Rent::get()?.minimum_balance(space_required);

        //create app state pda
        invoke_signed(
            &system_instruction::create_account(
                payer_acc.key,
                user_data_acc.key,
                rent_required,
                space_required as u64,
                program_id,
            ),
            &[
                payer_acc.clone(),
                user_data_acc.clone(),
                system_program.clone(),
            ],
            &[&[
                UserData::SEED_PREFIX.as_bytes(),
                &payer_acc.key.to_bytes(),
                &[bump],
            ]],
        )?;
        user_data.save(user_data_acc)?;

        let (_, bump) = Pubkey::find_program_address(
            &[UserStore::SEED_PREFIX.as_bytes(), &payer_acc.key.to_bytes()],
            program_id,
        );

        let space_required = to_vec(&user_data)?.len();
        let rent_required = Rent::get()?.minimum_balance(space_required);

        //create app state pda
        invoke_signed(
            &system_instruction::create_account(
                payer_acc.key,
                user_store_acc.key,
                rent_required,
                space_required as u64,
                program_id,
            ),
            &[
                payer_acc.clone(),
                user_store_acc.clone(),
                system_program.clone(),
            ],
            &[&[
                UserStore::SEED_PREFIX.as_bytes(),
                &payer_acc.key.to_bytes(),
                &[bump],
            ]],
        )?;
        user_store.save(user_store_acc)?;

        app_store
            .referral_id_map
            .insert(join_instruction.user_id.clone(), payer_acc.key.clone());
        app_store.realloc_and_save(&[payer_acc, app_store_acc, system_program])?
    }

    //transfer tokens from user
    invoke(
        &spl_token_2022::instruction::transfer_checked(
            token_program.key,
            user_token_account.key,
            mint_account.key,
            app_token_account.key,
            payer_acc.key,
            &[payer_acc.key],
            plan.investment_required,
            TokenStore::DECIMALS.clone(),
        )?,
        &[
            mint_account.clone(),
            user_token_account.clone(),
            app_token_account.clone(),
            payer_acc.clone(),
            app_token_owner.clone(),
            token_program.clone(),
        ],
    )?;

    Ok(())
}
