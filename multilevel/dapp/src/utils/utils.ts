import Decimal from "decimal.js";
import { splToken } from "./constants";

export function isValidNumber(str: string) {
  const regex = /^-?\d+(\.\d+)?$|^-?\d+\.$/;
  return regex.test(str);
}
/**
 * Returns formatted amount with decimal point representaion
 */
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

export const updateIfValid = (
  value: string,
  trigger: (value: string) => void
) => {
  if (isValidNumber(value) || value.length === 0) {
    console.log("valid", value);
    trigger(value);
  } else {
    console.log("notvalid", value);
  }
};

export const deci = (value: Decimal.Value) => {
  try {
    return new Decimal(value);
  } catch {
    return null;
  }
};

export function formatLocalDateString(date: Date): string {
  // Use toLocaleDateString with the desired locale and options
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getDaysDifference(date1: Date, date2: Date): number {
  // Get the timestamps for both dates
  const time1 = date1.getTime();
  const time2 = date2.getTime();

  // Calculate the difference in milliseconds
  const diffInMs = Math.abs(time1 - time2);

  // Convert milliseconds to days
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 2) {
    return address; // Return the original address if it's too short to shorten
  }
  const prefix = address.slice(0, chars + 2); // First `chars` + "0x"
  const suffix = address.slice(-chars); // Last `chars`
  return `${prefix}...${suffix}`;
}
