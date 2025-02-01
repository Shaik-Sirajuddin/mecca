use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
    rent::Rent,
    system_instruction, system_program,
    sysvar::Sysvar,
};

use crate::{
    instructions::pda_validator::{validate_app_state, validate_app_store_acc},
    state::{
        action::{Action, UserAction},
        app_state::AppState,
        app_store::AppStore,
        token_store::TokenStore,
        user::{ReferralDistributionState, UserData, UserStore},
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

    let _referrer_data_acc = next_account_info(accounts_iter)?;
    let mint_account = next_account_info(accounts_iter)?;
    let _user_token_account = next_account_info(accounts_iter)?;
    let _app_token_account = next_account_info(accounts_iter)?;
    let app_token_owner = next_account_info(accounts_iter)?;
    let _token_program = next_account_info(accounts_iter)?;
    let _system_program = next_account_info(accounts_iter)?;

    validate_app_state(program_id, app_state_acc.key)?;
    validate_app_store_acc(program_id, app_store_acc.key)?;
    validate_user_data_acc(program_id, payer_acc.key, user_data_acc.key)?;
    validate_user_store_acc(program_id, payer_acc.key, user_store_acc.key)?;

    assert!(
        *mint_account.key == Pubkey::from_str_const(TokenStore::TOKEN_MINT),
        "Mismatched mint account"
    );
    let (derived_app_token_owner, _) =
        Pubkey::find_program_address(&[TokenStore::SEED_PREFIX_HOLDER.as_bytes()], program_id);

    assert!(
        *app_token_owner.key == derived_app_token_owner,
        "Mismatched app token owner account"
    );

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

    assert!(app_state.paused == false, "New enrollments are paused");

    msg!("Reached here");
    if join_instruction.referrer != *payer_acc.key {
        //check if referrer data account provided match the provided referrer
        validate_user_data_acc(
            program_id,
            &join_instruction.referrer,
            referrer_data_acc.key,
        )?;

        //check if referrer already has an account created
        //will throw an error if user data account is not created
        //TODO : test
        UserData::try_from_slice(&referrer_data_acc.try_borrow_data().unwrap())?;
    }

    let plan = app_state.get_plan(join_instruction.plan_id).unwrap();
    //check if user data account already exists
    let new_user = user_data_acc.lamports() == 0 || *user_data_acc.owner == system_program::ID;

    let cur_time = Clock::get().unwrap().unix_timestamp as u64;
    let user_data = if new_user {
        assert!(
            is_valid_id(join_instruction.user_id.as_str()),
            "UserId in invalid format"
        );
        assert!(
            app_store
                .referral_id_map
                .contains_key(join_instruction.user_id.as_str())
                == false,
            "User with id already exists"
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
        let mut user = UserData::try_from_slice(&user_data_acc.try_borrow_data().unwrap())?;
        user.reward(cur_time, &app_state);
        user.accumulated.daily_reward += user.acc_daily_reward;
        user.accumulated.fee += user.acc_fee;
        user.accumulated.referral_reward += user.referral_reward;
        user.acc_daily_reward = plan.daily_reward;
        user.acc_fee = app_state.daily_fee;
        user.referral_reward = 0;
        user.enrolled_at = cur_time;
        user.last_accounted_time = cur_time;
        user.is_plan_active = true;
        user.plan_id = join_instruction.plan_id;
        user.referral_distribution = ReferralDistributionState {
            completed: false,
            last_distributed_user: payer_acc.key.clone(),
            last_level: 0,
            invested_amount: plan.investment_required,
        };
        user
    };
    assert!(
        new_user || user_data.referral_distribution.completed,
        "Distribution not completed for previous enrollments"
    );
    let mut user_store = if new_user {
        UserStore::new(payer_acc.key.clone())
    } else {
        UserStore::try_from_slice(&user_store_acc.try_borrow_data().unwrap())?
    };

    user_store.actions.push(UserAction {
        action: Action::JOIN,
        amount: plan.investment_required,
        plan_id: plan.id,
    });

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

        let (_, bump) = Pubkey::find_program_address(
            &[UserStore::SEED_PREFIX.as_bytes(), &payer_acc.key.to_bytes()],
            program_id,
        );

        let space_required = to_vec(&user_store)?.len();
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

        app_store
            .referral_id_map
            .insert(join_instruction.user_id.clone(), payer_acc.key.clone());
        app_store.realloc_and_save(&[payer_acc, app_store_acc, system_program])?
    }

    user_data.save(user_data_acc)?;
    user_store.realloc_and_save(&[payer_acc, user_store_acc, system_program])?;

    //transfer tokens from user
    msg!("Token Program {}", token_program.key.to_string());
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
