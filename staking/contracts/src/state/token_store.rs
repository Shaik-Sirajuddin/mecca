pub struct TokenStore {}
impl TokenStore {
    pub const OWNER_SEED_PREFIX: &'static str = "token-store-owner-pda";
    pub const BUMP: &'static u8 = &255;

    pub const TOKEN_MINT: &'static str = "14fc91h6hcx6S9kghYGmxdDaTScg1yFohL1WMAt79SZm";
    pub const TOKEN_DECIMALS: &'static u8 = &6;
    pub const OWNER_PDA: &'static str = "7bK3FuPayvPSJ5drDSVPX45cWectFoWAyfsmQ5F9Cv1T";
    pub const ASSOCIATED_TOKEN_ACCOUNT: &'static str =
        "AUu2MTz41kiJiBGLFXnepMTHrho3RTUafFHmerVxum7f";
}
