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
