import { Connection } from "@solana/web3.js";
export const rpcConnection = new Connection(process.env.RPC_URL!);
