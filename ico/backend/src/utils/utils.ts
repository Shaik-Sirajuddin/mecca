import Decimal from "decimal.js";

export const deci = (value: Decimal.Value) => {
  try {
    return new Decimal(value);
  } catch (e) {
    return null;
  }
};

export const isValidDeci = (value: Decimal.Value) => {
  try {
    let _val = new Decimal(value);
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
    let dec = new Decimal(value);
    if (dec.equals(0)) {
      return null;
    }
    return dec;
  } catch (e) {
    return null;
  }
};
