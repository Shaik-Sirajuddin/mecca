import Decimal from "decimal.js";
import { token } from "./constants";

export const deci = (value: Decimal.Value) => {
  try {
    return new Decimal(value);
  } catch (e) {
    return null;
  }
};

export const isValidDeci = (value: Decimal.Value) => {
  try {
    new Decimal(value);
    return true;
  } catch (e) {
    return false;
  }
};
/**
 * @returns null if value is 0
 */
export const deciNZ = (value: Decimal.Value) => {
  try {
    const dec = new Decimal(value);
    if (dec.equals(0)) {
      return null;
    }
    return dec;
  } catch (e) {
    return null;
  }
};

/**
 * Returns formatted amount with decimal point representaion
 */
export const formatBalance = (amount: Decimal, decimals = token.decimals) => {
  return formatNum(amount.div(Math.pow(10, decimals)).toString());
};
export const formatNum = (amount: string, decimals = token.decimals) => {
  const formattedNum = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  if (formattedNum == "NaN") {
    return "--";
  }
  return formattedNum;
};

export function isValidNumber(str: string) {
  const regex = /^-?\d+(\.\d+)?$|^-?\d+\.$/;
  return regex.test(str);
}
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

export function isValidNoDecimalNum(str: string) {
  const regex = /^\d+$/;
  return regex.test(str);
}
export const updateIfValidNoDecimal = (
  value: string,
  trigger: (value: string) => void
) => {
  if (isValidNoDecimalNum(value) || value.length === 0) {
    console.log("valid", value);
    trigger(value);
  } else {
    console.log("notvalid", value);
  }
};
export const convertToLocalISOString = (date: Date | string) => {
  // Ensure date is a Date object
  const localDate = new Date(date);

  // Get local time offset in minutes and adjust the date
  const localTimeOffset = localDate.getTimezoneOffset();
  localDate.setMinutes(localDate.getMinutes() - localTimeOffset);

  // Manually construct the ISO string with the adjusted date
  const localISOString = localDate.toISOString().slice(0, -1); // Remove 'Z' to avoid UTC output
  return localISOString;
};