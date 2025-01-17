use borsh::{BorshDeserialize, BorshSerialize};


#[derive(BorshSerialize, BorshDeserialize)]
pub enum Action {
    JOIN,
    UPGRADE,
    WITDHRAW,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UserAction {
    pub action: Action,
    pub amount: u64,
    pub plan_id: u8,
}
