import { PublicKey } from "@solana/web3.js";

export const getParsedPublicKey = (key: string) => {
  try {
    return new PublicKey(key);
  } catch (error) {
    return null;
  }
};
