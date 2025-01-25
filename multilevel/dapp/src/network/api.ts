import { PublicKey } from "@solana/web3.js";
import { baseUrl } from "../utils/constants";

export const userJoined = async (user: PublicKey) => {
  try {
    const url = `${baseUrl}/public/join`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: user.toString(),
      }),
    });
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};
