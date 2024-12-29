import { PublicKey } from "@solana/web3.js";
export const baseUrl = `http://localhost:3030`;
//TODO : take token program as string inputs
export const stakeProgramId = new PublicKey(
  "4XEWqwbKe2jq6A85QzTZr34M4eoc2hPzyFrwePPgeP7X"
);
export const tokenProgramId = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);
export const tokenMint = new PublicKey(
  "tkdZ2grPbhAcZ9W1gXaWhoNf6rJdCgqs9St7DFxdy7A"
);
export const appStateId = new PublicKey(
  "GaWai5NwaAeLe87PYaWU5YN5GiXEDCmXGBxKEhKn2aWT"
);
export const appTokenStoreOwnerId = new PublicKey(
  "FCmcef9GAQQGbKfNaJwfNnwUVh44XTJhWmGsUp3HgP7k"
);
export const appTokenStoreAtaId = new PublicKey(
  "3EyUcJoQYbAvFyhZkZMCWAqkfj55t5TVCkh5AJxMBrVF"
);
export const splToken = {
  decimals: 6,
};
