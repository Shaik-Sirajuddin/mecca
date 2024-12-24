import { baseUrl } from "../utils/constants";
import { IcoState } from "../schema/IcoState";

export const fetchIcoState = async () => {
  try {
    const response = await fetch(`${baseUrl}/public/state`);
    const data = await response.json();
    return data.body as IcoState;
  } catch (error: unknown) {
    console.log("Waste time", error);
  }
};
