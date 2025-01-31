import Decimal from "decimal.js";
import { splToken } from "./constants";
import { PublicKey } from "@solana/web3.js";

export function isValidNumber(str: string) {
  const regex = /^-?\d+(\.\d+)?$|^-?\d+\.$/;
  return regex.test(str);
}

export const formatToDecimal = (amount: Decimal) => {
  return amount.div(Math.pow(10, splToken.decimals));
};
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

//includes of both min , max
function randomInRange(min: number, max: number) {
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNum.toString().padStart(8, "0"); // Ensure the result has 8 digits
}
export const generateReferralCode = (referralMap: Map<string, PublicKey>) => {
  while (true) {
    const referralId = "MC" + randomInRange(1, 99999999).padStart(8, "0");
    if (!referralMap.has(referralId)) {
      return referralId;
    }
  }
};

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

export const getClipBoardText = async () => {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
};
