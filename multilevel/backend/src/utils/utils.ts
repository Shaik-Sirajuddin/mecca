import Decimal from "decimal.js";
import { splToken } from "../constants";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const formatBalance = (amount: Decimal) => {
  return formatNum(amount.div(Math.pow(10, splToken.decimals)).toString());
};
export const formatNum = (amount: string) => {
  const formattedNum = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: splToken.decimals,
  });
  if (formattedNum == "NaN") {
    return "--";
  }
  return formattedNum;
};

export function getDaysDifference(date1: Date, date2: Date): number {
  // Get the timestamps for both dates
  const time1 = date1.getTime();
  const time2 = date2.getTime();

  // Calculate the difference in milliseconds
  const diffInMs = Math.abs(time1 - time2);

  // Convert milliseconds to days
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}
