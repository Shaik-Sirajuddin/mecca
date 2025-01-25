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

export const getUserStore = async (user: PublicKey) => {
  let userStore = await getCacheData(CACHE_KEY.USER_STORE(user.toString()));
  if (!userStore) {
    //fetch from node
    userStore = await fetchUserStoreFromNode(user);
    setCacheData(CACHE_KEY.USER_STORE(user.toString()), userStore);
  }
  return userStore as UserStore;
};
