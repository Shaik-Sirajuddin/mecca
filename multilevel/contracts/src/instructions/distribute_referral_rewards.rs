use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    sysvar::Sysvar,
};

use crate::{
    instructions::pda_validator::validate_app_state,
    state::{
        app_state::{self, AppState},
        reward::Reward,
        user::{UserData, UserStore},
    },
};
fn distribute_rewards_to_user(
    accounts: &[&AccountInfo],
    cur_level: u8,
    cur_time: u64,
    app_state: &AppState,
    user_data: &UserData,
) -> ProgramResult {
    let payer_acc = accounts[0];
    let user_to_dis_data_acc = accounts[1];
    let user_to_dis_store_acc = accounts[2];
    let system_program = accounts[3];

    let user_to_dis_data =
        &mut UserData::try_from_slice(&user_to_dis_data_acc.try_borrow_mut_data().unwrap())?;
    let user_to_dis_store =
        &mut UserStore::try_from_slice(&user_to_dis_store_acc.try_borrow_mut_data().unwrap())?;

    let receivable_percentage =
        user_to_dis_data.get_receivable_reward_percentage(cur_time, &app_state, cur_level);

    if receivable_percentage > 0 {
        let receivable_amount = (user_data.referral_distribution.invested_amount
            * (receivable_percentage as u64))
            / 100;
        user_to_dis_data.referral_reward += receivable_amount;
        user_to_dis_store.rewards.reserve_exact(1);
        user_to_dis_store.rewards.push(Reward {
            invested_amount: user_data.referral_distribution.invested_amount,
            level: cur_level,
            plan_entry_time: user_data.enrolled_at,
            user: user_data.address,
            plan_id: user_data.plan_id,
            reward_amount: receivable_amount,
            reward_time: cur_time,
        });
        user_to_dis_store.realloc_and_save(&[payer_acc, user_to_dis_store_acc, system_program])?;
    }
    user_to_dis_data.save(user_to_dis_data_acc)?;
    Ok(())
}
//the function should be called for users in order of first plan join by oracle
pub fn distribute_referral_rewards(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer_acc = next_account_info(accounts_iter)?;

    let user_data_acc = next_account_info(accounts_iter)?;
    let previous_distributed_user_acc = next_account_info(accounts_iter)?;

    let app_state_acc = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    validate_app_state(program_id, app_state_acc.key)?;

    let app_state = AppState::try_from_slice(&app_state_acc.try_borrow_data().unwrap())?;
    let user_data = &mut UserData::try_from_slice(&user_data_acc.try_borrow_mut_data().unwrap())?;

    let previous_distributed_user =
        &UserData::try_from_slice(&previous_distributed_user_acc.try_borrow_data().unwrap())?;

    assert!(
        user_data_acc.owner == program_id,
        "Invalid account passed : not owned by program"
    );
    assert!(
        previous_distributed_user.address == user_data.referral_distribution.last_distributed_user,
        "Mismatch last distribution account"
    );
    assert!(user_data.is_plan_active, "User not enrolled in plan");
    assert!(
        !user_data.referral_distribution.completed,
        "Distribution already completed"
    );

    let mut previous_distributed_referrer = previous_distributed_user.referrer;
    let mut previous_distributed_user = previous_distributed_user.address;

    let cur_time = Clock::get().unwrap().unix_timestamp as u64;
    for _ in 1..=2 {
        if previous_distributed_user == previous_distributed_referrer {
            user_data.referral_distribution.completed = true;
            break;
        }

        let user_to_dis_data_acc = next_account_info(accounts_iter)?;
        let user_to_dis_store_acc = next_account_info(accounts_iter)?;

        let user_to_dis_data =
            &mut UserData::try_from_slice(&user_to_dis_data_acc.try_borrow_mut_data().unwrap())?;
        let cur_level = user_data.referral_distribution.last_level + 1;

        distribute_rewards_to_user(
            &[
                payer_acc,
                user_to_dis_data_acc,
                user_to_dis_store_acc,
                system_program,
            ],
            cur_level,
            cur_time,
            &app_state,
            user_data,
        )?;

        previous_distributed_user = user_to_dis_data.address;
        previous_distributed_referrer = user_to_dis_data.referrer;
        user_data.referral_distribution.last_distributed_user = previous_distributed_user.clone();
        user_data.referral_distribution.last_level = cur_level;
        if cur_level == 30 || previous_distributed_user == previous_distributed_referrer {
            user_data.referral_distribution.completed = true;
        }
    }
    user_data.save(user_data_acc)?;
    Ok(())
}
