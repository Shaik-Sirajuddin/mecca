import { PublicKey } from "@solana/web3.js";
export const baseUrl = `http://localhost:3030`;
//TODO : take token program as string inputs
export const stakeProgramId = new PublicKey(
  "3E9NMdemLBEYYJYsHGT25n1n6LG6A2h6jWBCSEMePrCV"
);
export const tokenProgramId = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);
export const tokenMint = new PublicKey(
  "14fc91h6hcx6S9kghYGmxdDaTScg1yFohL1WMAt79SZm"
);
export const appStateId = new PublicKey(
  "Frga5CNcEaiwcjSwz8Bt8v8QBjqkQdj52Mg2LQzoHjwc"
);
export const appTokenStoreOwnerId = new PublicKey(
  "7bK3FuPayvPSJ5drDSVPX45cWectFoWAyfsmQ5F9Cv1T"
);
export const appTokenStoreAtaId = new PublicKey(
  "AUu2MTz41kiJiBGLFXnepMTHrho3RTUafFHmerVxum7f"
);
export const splToken = {
  decimals: 6,
};
