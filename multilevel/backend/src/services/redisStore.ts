import { PublicKey } from "@solana/web3.js";
import {
  getCacheData,
  setCacheData,
  setCacheDataWithoutExpiration,
} from "../config/redis";
import { CACHE_KEY } from "../enums/CacheKeys";
import { UserStore } from "../schema/user_store";
import { fetchUserStoreFromNode } from "../utils/web3";

export const storeUserStoreInCache = async (
  user: PublicKey,
  userStore: UserStore
) => {
  setCacheDataWithoutExpiration(
    CACHE_KEY.USER_STORE(user.toString()),
    userStore
  );
};
