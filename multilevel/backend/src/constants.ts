import { PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
dotenv.config();

export const rpcUrl = process.env.RPC_URL || '';
export const multilevelProgramId = new PublicKey(
  "2epf4awb1hw6FkEHbr5EuvDjsQ86msw9Yu9LEaxD29Sg"
);

export const appStateId = new PublicKey(
  "AkHaXNDQV4TT8Fp4394gcSfGJdZh4aFdnjbQWBTNstDZ"
);

export const appStoreId = new PublicKey(
  "8w5hoZkYJq5WEPHE5BMRsWV6v3b9sigAEaS5uRMjPc4U"
);

export const payerAcc = new PublicKey(
  "ahSUozSv5vWRrX79wqGrfQzJwugrbKdMu6PBgEkLhnT"
);

export const splToken = {
  decimals: 6,
};
