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

export const setToUTC = (date: Date) => {
  // Set the time of the date object to UTC
  const utcDate = new Date(date); // Create a new date object to preserve the original date
  utcDate.setUTCHours(
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
  return utcDate;
};

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 2) {
    return address; // Return the original address if it's too short to shorten
  }
  const prefix = address.slice(0, chars + 2); // First `chars` + "0x"
  const suffix = address.slice(-chars); // Last `chars`
  return `${prefix}...${suffix}`;
}



/**
 * Copies the given text to the clipboard.
 * @param text - The text to be copied to the clipboard.
 * @returns A Promise that resolves when the text is successfully copied, or rejects with an error.
 */
export const copyToClipboard = async (text: string) => {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Text copied to clipboard:", text);
      return true;
    } catch (error) {
      console.error("Failed to copy text to clipboard:", error);
      return false;
    }
  } else {
    // Fallback for browsers without clipboard API support
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Prevent scrolling to bottom
      textArea.style.left = "-9999px"; // Hide the textarea
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      console.log("Text copied to clipboard (fallback):", text);
      return true;
    } catch (error) {
      console.error("Fallback failed to copy text to clipboard:", error);
      return false;
    }
  }
};