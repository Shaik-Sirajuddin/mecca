use solana_program::{entrypoint::ProgramResult, pubkey::Pubkey};

use crate::state::{
    app_state::AppState,
    app_store::AppStore,
    user::{UserData, UserStore},
};

pub fn validate_app_state(program_id: &Pubkey, app_state: &Pubkey) -> ProgramResult {
    let (derived_app_state_acc, _bump) =
        Pubkey::find_program_address(&[AppState::SEED.as_bytes()], program_id);

    assert!(
        derived_app_state_acc == *app_state,
        "Mismatched AppState Acc"
    );

    Ok(())
}

pub fn validate_app_store_acc(program_id: &Pubkey, referral_acc: &Pubkey) -> ProgramResult {
    let (derived_referral_state_acc, _bump) =
        Pubkey::find_program_address(&[AppStore::SEED.as_bytes()], program_id);

    assert!(
        *referral_acc == derived_referral_state_acc,
        "Mismatched App Store Acc"
    );
    Ok(())
}

pub fn validate_user_data_acc(
    program_id: &Pubkey,
    user: &Pubkey,
    user_data_acc: &Pubkey,
) -> ProgramResult {
    let (derived_user_data_acc, _bump) = Pubkey::find_program_address(
        &[UserData::SEED_PREFIX.as_bytes(), &user.to_bytes()],
        program_id,
    );

    assert!(
        *user_data_acc == derived_user_data_acc,
        "Mismatched user data acc"
    );

    Ok(())
}

pub fn validate_user_store_acc(
    program_id: &Pubkey,
    user: &Pubkey,
    user_store_acc: &Pubkey,
) -> ProgramResult {
    let (derived_user_store_acc, _bump) = Pubkey::find_program_address(
        &[UserStore::SEED_PREFIX.as_bytes(), &user.to_bytes()],
        program_id,
    );

    assert!(
        *user_store_acc == derived_user_store_acc,
        "Mismatched user store acc"
    );

    Ok(())
}
