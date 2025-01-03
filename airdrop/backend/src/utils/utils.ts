import Decimal from "decimal.js";
import { Request } from "express";

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

export function getStartOfDayUTC() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export function getDayStartAndEnd(date: Date) {
  // Create a new Date object from the given date

  // Set the start of the day (00:00:00)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Set the end of the day (23:59:59.999)
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}


export const getIPFromRequest = (req:Request) => {
  let ipHeader = req.headers['x-forwarded-for']

  if(!ipHeader){
    return ''
  }

  if(Array.isArray(ipHeader)){
    if(ipHeader.length > 0){
      return ipHeader[0]
    }
    return ''
  }

  return ipHeader
}