import { PublicKey } from "@solana/web3.js";

// export const baseUrl = `http://localhost:3020`;
export const baseUrl = `https://game.meccain.com`;
export const siteUrl = `https://multilevel.meccain.com`;
export const multilevelProgramId = new PublicKey(
  "2epf4awb1hw6FkEHbr5EuvDjsQ86msw9Yu9LEaxD29Sg"
);

export const appStateAcc = new PublicKey(
  "AkHaXNDQV4TT8Fp4394gcSfGJdZh4aFdnjbQWBTNstDZ"
);

export const appStoreAcc = new PublicKey(
  "8w5hoZkYJq5WEPHE5BMRsWV6v3b9sigAEaS5uRMjPc4U"
);

export const tokenMint = new PublicKey(
  "mecySk7eSawDNfAXvW3CquhLyxyKaXExFXgUUbEZE1T"
);

export const tokenHolderOwner = new PublicKey(
  "9A2km878vSdnWBP9RXfCASKxbhd2x3Rmvkm3yUVy44XD"
);

export const tokenHolderATA = new PublicKey(
  "MS7P6R5LXXjKtCuodv1bYStTixwdMxSbCp7Hdamv4wn"
);

export const splToken = {
  decimals: 6,
  symbol: "MEA",
};
