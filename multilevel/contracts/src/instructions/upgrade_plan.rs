use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    program::invoke,
    pubkey::Pubkey,
    sysvar::Sysvar,
};

use crate::state::{
    action::{Action, UserAction},
    app_state::AppState,
    token_store::TokenStore,
    user::{ReferralDistributionState, UpgradeDeduction, UserData, UserStore},
};

use super::pda_validator::{validate_app_state, validate_user_data_acc, validate_user_store_acc};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UpgradeInstruction {
    pub plan_id: u8,
}
fn validate_accounts(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let user_acc = next_account_info(accounts_iter)?;
    let user_data_acc = next_account_info(accounts_iter)?;
    let user_store_acc = next_account_info(accounts_iter)?;

    let app_state_acc = next_account_info(accounts_iter)?;

    let mint_account = next_account_info(accounts_iter)?;
    let _user_token_account = next_account_info(accounts_iter)?;
    let _app_token_account = next_account_info(accounts_iter)?;
    let app_token_owner = next_account_info(accounts_iter)?;

    validate_app_state(program_id, app_state_acc.key)?;
    validate_user_data_acc(program_id, user_acc.key, user_data_acc.key)?;
    validate_user_store_acc(program_id, user_acc.key, user_store_acc.key)?;

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
pub fn upgrade_plan(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    validate_accounts(_program_id, accounts)?;
    let accounts_iter = &mut accounts.iter();
    let user_acc = next_account_info(accounts_iter)?;
    let user_data_acc = next_account_info(accounts_iter)?;
    let user_store_acc = next_account_info(accounts_iter)?;

    let app_state_acc = next_account_info(accounts_iter)?;

    let mint_account = next_account_info(accounts_iter)?;
    let user_token_account = next_account_info(accounts_iter)?; 
    let app_token_account = next_account_info(accounts_iter)?;
    let app_token_owner = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let user_data = &mut UserData::try_from_slice(&user_data_acc.try_borrow_mut_data().unwrap())?;
    let user_store =
        &mut UserStore::try_from_slice(&user_store_acc.try_borrow_mut_data().unwrap())?;
    let app_state = &AppState::try_from_slice(&app_state_acc.try_borrow_data().unwrap())?;
    let cur_time = Clock::get().unwrap().unix_timestamp as u64;
    user_data.reward(cur_time, app_state);

    assert!(app_state.paused == false, "Upgrades are paused");
    assert!(user_data.is_plan_active, "No current plan in progress");

    let upgrade_instruction = UpgradeInstruction::try_from_slice(instruction_data)?;
    let current_plan = app_state.get_plan(user_data.plan_id).unwrap();
    let plan_to_upgrade = app_state.get_plan(upgrade_instruction.plan_id).unwrap();

    assert!(
        plan_to_upgrade.investment_required > current_plan.investment_required,
        "Downgrade isn't possible"
    );

    let additional_invest_amount =
        plan_to_upgrade.investment_required - current_plan.investment_required;

    let upgrade_deduction = UpgradeDeduction {
        daily_amount: current_plan.daily_reward,
        days: (user_data.acc_daily_reward / current_plan.daily_reward) as u32,
    };

    if user_data.upgrade_deduction[0].days == 0 {
        user_data.upgrade_deduction[0] = upgrade_deduction;
    } else {
        user_data.upgrade_deduction[1] = upgrade_deduction;
    }

    user_data.accumulated.daily_reward += user_data.acc_daily_reward;
    user_data.accumulated.fee += user_data.acc_fee;
    user_data.accumulated.referral_reward += user_data.referral_reward;
    user_data.acc_daily_reward = plan_to_upgrade.daily_reward;
    user_data.acc_fee = app_state.daily_fee;
    user_data.referral_reward = 0;
    user_data.enrolled_at = cur_time;
    user_data.last_accounted_time = cur_time;
    user_data.is_plan_active = true;
    user_data.plan_id = upgrade_instruction.plan_id;
    user_data.referral_distribution = ReferralDistributionState {
        completed: false,
        last_distributed_user: user_acc.key.clone(),
        last_level: 0,
        invested_amount: additional_invest_amount,
    };

    user_data.save(user_data_acc)?;
    user_store.actions.push(UserAction {
        action: Action::UPGRADE,
        amount: additional_invest_amount,
        plan_id: plan_to_upgrade.id,
    });
    user_store.realloc_and_save(&[user_acc, user_store_acc, system_program])?;

    //transfer tokens from user
    invoke(
        &spl_token_2022::instruction::transfer_checked(
            token_program.key,
            user_token_account.key,
            mint_account.key,
            app_token_account.key,
            user_acc.key,
            &[user_acc.key],
            additional_invest_amount,
            *TokenStore::DECIMALS,
        )?,
        &[
            mint_account.clone(),
            user_token_account.clone(),
            app_token_account.clone(),
            user_acc.clone(),
            app_token_owner.clone(),
            token_program.clone(),
        ],
    )?;

    Ok(())
}

// + 1 return
