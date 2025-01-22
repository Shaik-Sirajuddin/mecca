import { PublicKey } from "@solana/web3.js";
import { getCacheData, setCacheDataWithoutExpiration } from "../config/redis";
import { CACHE_KEY } from "../enums/CacheKeys";
import { UserData } from "../schema/user_data";
import { UserStore } from "../schema/user_store";

export const getUserList = async () => {
  let userList = (await getCacheData(CACHE_KEY.USER_LIST)) as string[];
  let parsedUserList: PublicKey[] = [];
  for (let i = 0; i < userList.length; i++) {
    parsedUserList.push(new PublicKey(userList[i]));
  }
  return parsedUserList;
};

export const getUserData = async (user: PublicKey) => {
  let userData = await getCacheData(CACHE_KEY.USER_DATA(user.toString()));
  return userData as UserData;
};

export const storeUser = async (user: PublicKey) => {
  let userList = await getUserList();
  userList.push(user);
  let parsedUserList: string[] = [];

  //return if user is already present
  let hasUser = userList.find((item) => item === user);
  if (hasUser) return;

  for (let i = 0; i < userList.length; i++) {
    parsedUserList.push(userList[i].toString());
  }
  await setCacheDataWithoutExpiration(CACHE_KEY.USER_LIST, parsedUserList);
};

export const storeUserData = async (user: PublicKey, userData: UserData) => {
  setCacheDataWithoutExpiration(CACHE_KEY.USER_DATA(user.toString()), userData);
};

export const storeUserStore = async (user: PublicKey, userStore: UserStore) => {
  setCacheDataWithoutExpiration(
    CACHE_KEY.USER_STORE(user.toString()),
    userStore
  );
};
