import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";

export interface IAppStore {
  referral_id_map: Map<string, PublicKey>; // Maps referral IDs (strings) to PublicKey instances
}

export class AppStore implements IAppStore {
  referral_id_map: Map<string, PublicKey>;

  constructor(data: any) {
    this.referral_id_map = new Map();
    console.log(data.referral_id_map);
    for (const [key, value] of data.referral_id_map) {
      this.referral_id_map.set(key, value);
    }
  }

  getUserCode = (user: PublicKey) => {
    for (const [key, value] of this.referral_id_map) {
      if (value.equals(user)) {
        return key;
      }
    }
    return null;
  };

  // Static method to parse raw data into AppStore
  static parse(data: IAppStore): AppStore {
    return new AppStore(data);
  }

  // Example dummy AppStore for testing purposes
  static dummy(): AppStore {
    return new AppStore({
      referral_id_map: new Map(),
    });
  }

  // Convert AppStore to JSON
  toJSON(): Record<string, any> {
    return {
      referral_id_map: Object.fromEntries(
        Array.from(this.referral_id_map.entries()).map(([key, value]) => [
          key,
          value.toBase58(), // Convert PublicKey to string
        ])
      ),
    };
  }

  // Convert JSON to AppStore instance
  static fromJSON(json: Record<string, any>): AppStore {
    const referral_id_map = new Map<string, PublicKey>(
      Object.entries(json.referral_id_map || {}).map(([key, value]) => [
        key,
        //@ts-expect-error this
        new PublicKey(value), // Convert string to PublicKey
      ])
    );

    return new AppStore({ referral_id_map });
  }
}

// Define AppStore schema for borsh
export const AppStoreSchema = borsh.struct([
  borsh.map(borsh.str(), borsh.publicKey(), "referral_id_map"), // HashMap<String, Pubkey>
]);
