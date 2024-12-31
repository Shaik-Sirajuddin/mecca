pub struct TokenStore {}
impl TokenStore {
    pub const OWNER_SEED_PREFIX: &'static str = "token-store-owner-pda";
    pub const BUMP: &'static u8 = &253;

    pub const TOKEN_MINT: &'static str = "tkdZ2grPbhAcZ9W1gXaWhoNf6rJdCgqs9St7DFxdy7A";
    pub const TOKEN_DECIMALS: &'static u8 = &6;
    pub const OWNER_PDA: &'static str = "FCmcef9GAQQGbKfNaJwfNnwUVh44XTJhWmGsUp3HgP7k";
    pub const ASSOCIATED_TOKEN_ACCOUNT: &'static str =
        "3EyUcJoQYbAvFyhZkZMCWAqkfj55t5TVCkh5AJxMBrVF";
}
