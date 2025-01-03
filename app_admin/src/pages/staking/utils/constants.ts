import { PublicKey } from "@solana/web3.js";
export const baseUrl = `https://apistaking.meccain.com`;
//TODO : take token program as string inputs
export const stakeProgramId = new PublicKey(
  "4XEWqwbKe2jq6A85QzTZr34M4eoc2hPzyFrwePPgeP7X"
);
export const tokenProgramId = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);
export const tokenMint = new PublicKey(
  "mecySk7eSawDNfAXvW3CquhLyxyKaXExFXgUUbEZE1T"
);
export const appStateId = new PublicKey(
  "GaWai5NwaAeLe87PYaWU5YN5GiXEDCmXGBxKEhKn2aWT"
);
export const appTokenStoreOwnerId = new PublicKey(
  "FCmcef9GAQQGbKfNaJwfNnwUVh44XTJhWmGsUp3HgP7k"
);
export const appTokenStoreAtaId = new PublicKey(
  "3shZjSPWCeos5Cpoj1FEqu1ws1tNarET5gN4zNQCPnDs"
);
export const splToken = {
  decimals: 6,
};
