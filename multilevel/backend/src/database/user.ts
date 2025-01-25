import { PublicKey } from "@solana/web3.js";
import { UserData } from "../schema/user_data";
import MUserData from "../models/user_data";

import { getCacheData, setCacheDataWithoutExpiration } from "../config/redis";
import { CACHE_KEY } from "../enums/CacheKeys";
import { fetchUserDataFromNode } from "../utils/web3";

export const storeUserData = async (user: PublicKey, userData: UserData) => {
  await setCacheDataWithoutExpiration(
    CACHE_KEY.USER_DATA(user.toString()),
    userData
  );
  let [userDataEntry, created] = await MUserData.findOrCreate({
    where: {
      address: user.toString(),
    },
    defaults: {
      address: user.toString(),
      data: JSON.stringify({ data: userData }),
    },
  });
  if (!created) {
    await MUserData.create({
      address: user.toString(),
      data: JSON.stringify({ data: userData }),
    });
  }
};

export const getUserData = async (user: PublicKey) => {
  let userData = await getCacheData(CACHE_KEY.USER_DATA(user.toString()));

  if (!userData) {
    let userDataJson = (
      await MUserData.findOne({
        where: {
          address: user.toString(),
        },
      })
    )?.dataValues.data;
    if (userDataJson) {
      userData = JSON.parse(userDataJson).data;
    }
  }
  //TODO : if not found fetch account info from solana

  if (!userData) {
    userData = await fetchUserDataFromNode(user);
    storeUserData(user, userData);
  }
  return userData as UserData;
};
