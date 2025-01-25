import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";

export interface IAppStore {
  referral_id_map: Record<string, PublicKey>; // Maps referral IDs (strings) to PublicKey instances
}

export class AppStore implements IAppStore {
  referral_id_map: Record<string, PublicKey>;

  constructor(data: any) {
    this.referral_id_map = {};
    Object.entries(data.referral_id_map || {}).forEach(([key, value]) => {
      //@ts-expect-error this
      this.referral_id_map[key] = new PublicKey(value);
    });
  }

  // Static method to parse raw data into AppStore
  static parse(data: IAppStore): AppStore {
    return new AppStore(data);
  }

  // Example dummy AppStore for testing purposes
  static dummy(): AppStore {
    return new AppStore({
      referral_id_map: {
        user1: new PublicKey("6u...example_pubkey"),
        user2: new PublicKey("7v...another_pubkey"),
      },
    });
  }
}

// Define AppStore schema for borsh
export const AppStoreSchema = borsh.struct([
  borsh.map(borsh.str(), borsh.publicKey(), "referral_id_map"), // HashMap<String, Pubkey>
]);
