import * as borsh from "@coral-xyz/borsh";
import { Action, ActionSchema } from "./action";
import { WithdrawRequest, WithdrawRequestSchema } from "./withdrawl_request";
import { AppState } from "./app_state_schema";
import Decimal from "decimal.js";
import { splToken } from "../constants";

export interface IUser {
  accumulated_interest: Decimal; // u64
  withdrawn_interest: Decimal; // u64
  principal_in_stake: Decimal; // u64
  stake_time: Decimal; // u64
  withdraw_request: WithdrawRequest;
  change_list_index: number; // u32
  actions: Action[];
}

export class User implements IUser {
  accumulated_interest: Decimal; // u64
  withdrawn_interest: Decimal; // u64
  principal_in_stake: Decimal; // u64
  stake_time: Decimal; // u64
  withdraw_request: WithdrawRequest;
  change_list_index: number; // u32
  actions: Action[];

  constructor(data: any) {
    this.accumulated_interest = new Decimal(
      (data.accumulated_interest || 0).toString()
    );
    this.withdrawn_interest = new Decimal(
      (data.withdrawn_interest || 0).toString()
    );
    this.principal_in_stake = new Decimal(
      (data.principal_in_stake || 0).toString()
    );
    this.stake_time = new Decimal((data.stake_time || 0).toString());
    this.withdraw_request = WithdrawRequest.parse(
      (data.withdraw_request && data.withdraw_request.length
        ? data.withdraw_request[0]
        : {}) || {}
    );
    this.change_list_index = data.change_list_index || 0;
    this.actions = (data.actions || []).map((action: any) =>
      Action.parse(action)
    );
  }

  static parse(data: IUser): User {
    return new User(data);
  }

  calculateInterest(
    time: Decimal,
    amount: Decimal,
    interestRate: number
  ): Decimal {
    const SECONDS_IN_YEAR = 365 * 86400;
    const PERCENTAGE_DIVISOR = 100;

    return new Decimal(
      new Decimal(interestRate)
        .mul(time)
        .mul(amount)
        .div(SECONDS_IN_YEAR * PERCENTAGE_DIVISOR)
        .div(Math.pow(10, splToken.decimals))
        .toFixed(0)
    );
  }

  calculateUnaccountedInterest(appState: AppState): Decimal {
    if (appState.interest_history.length == 0) {
      return new Decimal(0);
    }
    const curTimeS = parseInt((Date.now() / 1000).toString());
    let unaccountedInterest = new Decimal(0);
    let lastAccountedTime = this.stake_time;

    let curSlotInterest =
      appState.interest_history[this.change_list_index].rate;
    let idx = this.change_list_index + 1;

    // Iterate through interest history to calculate interest for each rate change period
    while (idx < appState.interest_history.length) {
      const curRateChange = appState.interest_history[idx];
      const diffTime = curRateChange.time.sub(lastAccountedTime);

      unaccountedInterest = unaccountedInterest.add(
        this.calculateInterest(
          diffTime,
          this.principal_in_stake,
          curSlotInterest
        )
      );

      lastAccountedTime = curRateChange.time;
      curSlotInterest = curRateChange.rate;
      idx++;
    }

    // Calculate remaining interest for the period up to the current time
    const diffTime = new Decimal(curTimeS).sub(lastAccountedTime);

    unaccountedInterest = unaccountedInterest.add(
      this.calculateInterest(
        diffTime,
        this.principal_in_stake,
        Number(curSlotInterest)
      )
    );

    return unaccountedInterest;
  }

  availableInterest(appState: AppState) {
    return this.calculateUnaccountedInterest(appState)
      .add(this.accumulated_interest)
      .sub(this.withdrawn_interest);
  }
}

export const UserSchema = borsh.struct([
  borsh.u64("accumulated_interest"),
  borsh.u64("withdrawn_interest"),
  borsh.u64("principal_in_stake"),
  borsh.u64("stake_time"),
  borsh.array(WithdrawRequestSchema, 1, "withdraw_request"),
  borsh.u32("change_list_index"),
  borsh.vec(ActionSchema, "actions"),
]);
