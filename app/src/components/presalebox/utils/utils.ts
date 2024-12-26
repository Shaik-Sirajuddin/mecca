import { Decimal } from "decimal.js";
import { token } from "./constants";
export const deci = (value: Decimal.Value) => {
  try {
    return new Decimal(value);
  } catch (error: unknown) {
    console.log(error);
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

function isValidNumber(str: string) {
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

export const presaleStates = {
  IN_FUTURE: 0,
  RUNNING: 1,
  PAUSED: 2,
  SOLD_OUT: 3,
  EXPIRED: 4,
};
