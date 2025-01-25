pub struct TokenStore {}
impl TokenStore {
    pub const OWNER_SEED_PREFIX: &'static str = "token-store-owner-pda";
    pub const BUMP: &'static u8 = &253;

    pub const TOKEN_MINT: &'static str = "mecySk7eSawDNfAXvW3CquhLyxyKaXExFXgUUbEZE1T";
    pub const USDT_MINT: &'static str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
    pub const TOKEN_DECIMALS: &'static u8 = &6; //token decimals and usdt have same decimals 
    pub const USDT_DECIMALS: &'static u8 = &6; 
    pub const OWNER_PDA: &'static str = "7BZA3CtyqF1vjCWbXKugamH4XKoGrHkH5t5j5TBXSvt3";
    pub const ASSOCIATED_TOKEN_ACCOUNT: &'static str =
        "Avk4o4zBHaRC5LNyHMgDE4XVxjKBjJAh7CiJyiDjy6NE";
}
