import * as borsh from "@coral-xyz/borsh";
import { Round, RoundSchema } from "./Round";
import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { icoProgramId } from "../../pages/Ico/utils/constants";

export interface IAppConfig {
  start_time: Date; // u64
  paused: boolean; // bool
  tokens_sold: Decimal; // u64
  usdt_raised: Decimal; // u64
  sol_raised: Decimal; // u64
  owner: PublicKey; // Pubkey (32 bytes)
  deposit_acc: PublicKey; // Pubkey (32 bytes)
  rounds: Round[]; // Vec<Round>
}

export class AppConfig implements IAppConfig {
  start_time: Date;
  paused: boolean;
  tokens_sold: Decimal;
  usdt_raised: Decimal;
  sol_raised: Decimal;
  owner: PublicKey;
  deposit_acc: PublicKey;
  rounds: Round[];

  constructor(data: any) {
    this.start_time = new Date((data.start_time || 0) * 1000);
    this.paused = data.paused || false;
    this.tokens_sold = new Decimal((data.tokens_sold || 0).toString());
    this.usdt_raised = new Decimal((data.usdt_raised || 0).toString());
    this.sol_raised = new Decimal((data.sol_raised || 0).toString());
    this.owner = new PublicKey(data.owner || icoProgramId);
    this.deposit_acc = new PublicKey(data.deposit_acc || icoProgramId);
    this.rounds = (data.rounds || []).map(Round.parse);
  }

  // Static method to parse raw data into AppConfig
  static parse(data: IAppConfig): AppConfig {
    return new AppConfig(data);
  }

  static dummy() {
    return new AppConfig({
      rounds: [
        {
          end_time: new Date(Date.now() + 10000),
        },
      ],
    });
  }
}

// Define AppConfig schema
export const AppConfigSchema = borsh.struct([
  borsh.u64("start_time"), // u64
  borsh.bool("paused"), // bool
  borsh.u64("tokens_sold"), // u64
  borsh.u64("usdt_raised"), // u64
  borsh.u64("sol_raised"), // u64
  borsh.publicKey("owner"), // Pubkey (32 bytes)
  borsh.publicKey("deposit_acc"), // Pubkey (32 bytes)
  borsh.vec(RoundSchema, "rounds"), // Vec<Round>
]);
