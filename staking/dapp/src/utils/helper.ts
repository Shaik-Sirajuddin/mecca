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