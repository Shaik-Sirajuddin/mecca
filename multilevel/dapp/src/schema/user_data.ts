import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { AppState } from "./app_state";
import { PlanID } from "../enums/plan";
import { Plan } from "./plan";

// Interfaces
export interface IReferralDistributionState {
  last_distributed_user: PublicKey; // Address of the last receiver
  last_level: number; // u8
  completed: boolean; // Whether referrals have been distributed till max stage
  invested_amount: Decimal; // u64
}

export interface IUpgradeDeduction {
  daily_amount: Decimal; // u64
  days: number; // u32
}

export interface IAccumulated {
  daily_reward: Decimal; // u64
  fee: Decimal; // u64
  referral_reward: Decimal; // u64
}

export interface IUserData {
  id: string;
  address: PublicKey;
  referral_reward: Decimal; // u64
  acc_daily_reward: Decimal; // u64
  acc_fee: Decimal; // u64
  withdrawn_amount: Decimal; // u64
  is_plan_active: boolean;
  enrolled_at: Decimal; // u64
  last_accounted_time: Decimal; // u64
  plan_id: number; // u8
  referrer: PublicKey;
  referral_distribution: ReferralDistributionState;
  upgrade_deduction: UpgradeDeduction[];
  accumulated: Accumulated;
}

// Classes
export class ReferralDistributionState implements IReferralDistributionState {
  last_distributed_user: PublicKey;
  last_level: number;
  completed: boolean;
  invested_amount: Decimal;

  constructor(data: any) {
    this.last_distributed_user = new PublicKey(
      data.last_distributed_user || PublicKey.default
    );
    this.last_level = data.last_level || 0;
    this.completed = data.completed || false;
    this.invested_amount = new Decimal((data.invested_amount || 0).toString());
  }

  static schema = borsh.struct([
    borsh.publicKey("last_distributed_user"),
    borsh.u8("last_level"),
    borsh.bool("completed"),
    borsh.u64("invested_amount"),
  ]);
}

export class UpgradeDeduction implements IUpgradeDeduction {
  daily_amount: Decimal;
  days: number;

  constructor(data: any) {
    this.daily_amount = new Decimal((data.daily_amount || 0).toString());
    this.days = data.days || 0;
  }

  static schema = borsh.struct([borsh.u64("daily_amount"), borsh.u32("days")]);
}

export class Accumulated implements IAccumulated {
  daily_reward: Decimal;
  fee: Decimal;
  referral_reward: Decimal;

  constructor(data: any) {
    this.daily_reward = new Decimal((data.daily_reward || 0).toString());
    this.fee = new Decimal((data.fee || 0).toString());
    this.referral_reward = new Decimal((data.referral_reward || 0).toString());
  }

  static schema = borsh.struct([
    borsh.u64("daily_reward"),
    borsh.u64("fee"),
    borsh.u64("referral_reward"),
  ]);
}

export class UserData implements IUserData {
  id: string;
  address: PublicKey;
  referral_reward: Decimal;
  acc_daily_reward: Decimal;
  acc_fee: Decimal;
  withdrawn_amount: Decimal;
  is_plan_active: boolean;
  enrolled_at: Decimal;
  last_accounted_time: Decimal;
  plan_id: PlanID;
  referrer: PublicKey;
  referral_distribution: ReferralDistributionState;
  upgrade_deduction: UpgradeDeduction[];
  accumulated: Accumulated;

  constructor(data: any) {
    this.id = data.id || "";
    this.address = new PublicKey(data.address || PublicKey.default);
    this.referral_reward = new Decimal((data.referral_reward || 0).toString());
    this.acc_daily_reward = new Decimal(
      (data.acc_daily_reward || 0).toString()
    );
    this.acc_fee = new Decimal((data.acc_fee || 0).toString());
    this.withdrawn_amount = new Decimal(
      (data.withdrawn_amount || 0).toString()
    );
    this.is_plan_active = data.is_plan_active || false;
    this.enrolled_at = new Decimal((data.enrolled_at || 0).toString());
    this.last_accounted_time = new Decimal(
      (data.last_accounted_time || 0).toString()
    );
    this.plan_id = data.plan_id || 0;
    this.referrer = new PublicKey(data.referrer || PublicKey.default);
    this.referral_distribution = new ReferralDistributionState(
      data.referral_distribution || {}
    );
    this.upgrade_deduction = (data.upgrade_deduction || []).map(
      (ud: any) => new UpgradeDeduction(ud)
    );
    this.accumulated = new Accumulated(data.accumulated || {});
  }

  applyUpgradeDeduction = (
    index: number,
    unaccountedDays: number,
    plan: Plan
  ) => {
    const deduction = this.upgrade_deduction[index];

    const daysToAccount = Math.min(unaccountedDays, deduction.days);

    return {
      amount: plan.daily_reward.sub(deduction.daily_amount).mul(daysToAccount),
      unaccountedDays: unaccountedDays - daysToAccount,
    };
  };
  availableForWithdraw = (appState: AppState) => {
    const userCurPlan = appState.getPlan(this.plan_id);
    let unaccountedDays = 0;
    let accumulatedReward = new Decimal(0);
    if (userCurPlan) {
      const curTime = new Decimal(Math.floor(Date.now() / 1000));
      unaccountedDays = Decimal.floor(
        Decimal.min(
          curTime,
          this.enrolled_at.add((userCurPlan.validity_days - 1) * 86400)
        )
          .sub(this.last_accounted_time)
          .div(86400)
      ).toNumber();

      const totalUnaccountedDays = unaccountedDays;
      let deductionRes = this.applyUpgradeDeduction(
        0,
        unaccountedDays,
        userCurPlan
      );
      accumulatedReward = accumulatedReward.add(deductionRes.amount); // apply deduction 1
      unaccountedDays = deductionRes.unaccountedDays;

      deductionRes = this.applyUpgradeDeduction(
        1,
        unaccountedDays,
        userCurPlan
      );
      accumulatedReward = accumulatedReward.add(deductionRes.amount); // apply deduction 2
      unaccountedDays = deductionRes.unaccountedDays;

      accumulatedReward = accumulatedReward
        .add(userCurPlan.daily_reward.mul(unaccountedDays)) //consider normal reward rate for remaining days
        .sub(new Decimal(totalUnaccountedDays).mul(appState.daily_fee)); //deduct fee
    }

    return this.acc_daily_reward
      .add(accumulatedReward)
      .add(this.referral_reward)
      .sub(this.acc_fee)
      .add(this.accumulated.daily_reward)
      .add(this.accumulated.referral_reward)
      .sub(this.accumulated.fee)
      .sub(this.withdrawn_amount);
  };

  static dummy() {
    return new UserData({});
  }

  static schema = borsh.struct([
    borsh.str("id"),
    borsh.publicKey("address"),
    borsh.u64("referral_reward"),
    borsh.u64("acc_daily_reward"),
    borsh.u64("acc_fee"),
    borsh.u64("withdrawn_amount"),
    borsh.bool("is_plan_active"),
    borsh.u64("enrolled_at"),
    borsh.u64("last_accounted_time"),
    borsh.u8("plan_id"),
    borsh.publicKey("referrer"),
    ReferralDistributionState.schema.replicate("referral_distribution"),
    borsh.array(UpgradeDeduction.schema, 2, "upgrade_deduction"),
    Accumulated.schema.replicate("accumulated"),
  ]);
}
