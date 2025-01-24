import * as borsh from "@coral-xyz/borsh";
import Decimal from "decimal.js";

export enum Action {
  JOIN,
  UPGRADE,
  WITHDRAW,
}

export interface IUserAction {
  action: Action;
  amount: Decimal; // u64
  plan_id: number; // u8
}

export class UserAction implements IUserAction {
  action: Action;
  amount: Decimal;
  plan_id: number;

  constructor(data: any) {
    this.action = data.action || Action.JOIN;
    this.amount = new Decimal((data.amount || 0).toString());
    this.plan_id = data.plan_id || 0;
  }

  // Static method to parse raw data into UserAction
  static parse(data: IUserAction): UserAction {
    return new UserAction(data);
  }

  // Example dummy UserAction for testing
  static dummy(): UserAction {
    return new UserAction({
      action: Action.JOIN,
      amount: new Decimal(1000),
      plan_id: 1,
    });
  }
}

// Define the schema for the Action enum
export const ActionEnumSchema = new Map<Action, number>([
  [Action.JOIN, 0],
  [Action.UPGRADE, 1],
  [Action.WITHDRAW, 2],
]);

// Define UserAction schema for borsh
export const UserActionSchema = borsh.struct([
  borsh.u8("action"), // Enum mapped to u8
  borsh.u64("amount"), // u64
  borsh.u8("plan_id"), // u8
]);

// Custom serialization/deserialization for Action enum
export const serializeAction = (action: Action): number => {
  const value = ActionEnumSchema.get(action);
  if (value === undefined) throw new Error(`Unknown Action: ${action}`);
  return value;
};

export const deserializeAction = (value: number): Action => {
  const entry = [...ActionEnumSchema.entries()].find(([_, v]) => v === value);
  if (!entry) throw new Error(`Unknown Action value: ${value}`);
  return entry[0];
};
