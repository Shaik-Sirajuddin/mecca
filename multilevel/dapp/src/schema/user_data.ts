import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { AppState } from "./app_state";
import { PlanID } from "../enums/plan";
import { Plan } from "./plan";
import { getDaysDifference } from "../utils/utils";
import { UserStore } from "./user_store";
import { CREW } from "../enums/crew";

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

  toJSON() {
    return {
      last_distributed_user: this.last_distributed_user.toBase58(),
      last_level: this.last_level,
      completed: this.completed,
      invested_amount: this.invested_amount.toString(),
    };
  }

  static fromJSON(data: any): ReferralDistributionState {
    return new ReferralDistributionState({
      last_distributed_user: data.last_distributed_user,
      last_level: data.last_level,
      completed: data.completed,
      invested_amount: data.invested_amount,
    });
  }
}

export class UpgradeDeduction implements IUpgradeDeduction {
  daily_amount: Decimal;
  days: number;

  constructor(data: any) {
    this.daily_amount = new Decimal((data.daily_amount || 0).toString());
    this.days = data.days || 0;
  }

  static schema = borsh.struct([borsh.u64("daily_amount"), borsh.u32("days")]);

  toJSON() {
    return {
      daily_amount: this.daily_amount.toString(),
      days: this.days,
    };
  }

  static fromJSON(data: any): UpgradeDeduction {
    return new UpgradeDeduction({
      daily_amount: data.daily_amount,
      days: data.days,
    });
  }
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

  toJSON() {
    return {
      daily_reward: this.daily_reward.toString(),
      fee: this.fee.toString(),
      referral_reward: this.referral_reward.toString(),
    };
  }

  static fromJSON(data: any): Accumulated {
    return new Accumulated({
      daily_reward: data.daily_reward,
      fee: data.fee,
      referral_reward: data.referral_reward,
    });
  }
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
    console.log(data.upgrade_deduction, "here");
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
  totalFeePaid = (appState: AppState) => {
    const userCurPlan = appState.getPlan(this.plan_id);
    let unaccountedDays = 0;
    let accumulatedFee = new Decimal(0);
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

      accumulatedFee = new Decimal(totalUnaccountedDays).mul(
        appState.daily_fee
      ); //deduct fee
    }

    return accumulatedFee.add(this.acc_fee).add(this.accumulated.fee);
  };
  totalDailyReward = (appState: AppState) => {
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

      accumulatedReward = accumulatedReward.add(
        userCurPlan.daily_reward.mul(unaccountedDays)
      ); //consider normal reward rate for remaining days
    }

    return this.acc_daily_reward
      .add(accumulatedReward)
      .add(this.accumulated.daily_reward);
  };

  availableForWithdraw = (appState: AppState) => {
    const accumulatedReward = this.totalDailyReward(appState);
    const accumulatedFee = this.totalFeePaid(appState);
    return accumulatedReward
      .sub(accumulatedFee)
      .add(this.referral_reward)
      .add(this.accumulated.referral_reward)
      .sub(this.withdrawn_amount);
  };

  getRemainingDays = (appState: AppState) => {
    if (!this.is_plan_active) {
      return 0;
    }
    const userPlan = appState.getPlan(this.plan_id)!;
    const passedDays = getDaysDifference(
      new Date(),
      new Date(this.enrolled_at.toNumber() * 1000)
    );
    return Math.max(0, userPlan?.validity_days - passedDays);
  };

 

  static getUserCrew(level: number) {
    if (level === 1) {
      return CREW.DIRECT;
    } else if (level <= 7) {
      return CREW.ACTIVE;
    } else {
      return CREW.DEEP;
    }
  }

  static dummy() {
    return new UserData({
      upgrade_deduction: [
        {
          daily_amount: 0,
          days: 0,
        },
        {
          daily_amount: 0,
          days: 0,
        },
      ],
    });
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

  toJSON() {
    return {
      id: this.id,
      address: this.address.toBase58(),
      referral_reward: this.referral_reward.toString(),
      acc_daily_reward: this.acc_daily_reward.toString(),
      acc_fee: this.acc_fee.toString(),
      withdrawn_amount: this.withdrawn_amount.toString(),
      is_plan_active: this.is_plan_active,
      enrolled_at: this.enrolled_at.toString(),
      last_accounted_time: this.last_accounted_time.toString(),
      plan_id: this.plan_id,
      referrer: this.referrer.toBase58(),
      referral_distribution: this.referral_distribution.toJSON(),
      upgrade_deduction: this.upgrade_deduction.map((ud) => ud.toJSON()),
      accumulated: this.accumulated.toJSON(),
    };
  }

  static fromJSON(data: any): UserData {
    return new UserData({
      id: data.id,
      address: data.address,
      referral_reward: data.referral_reward,
      acc_daily_reward: data.acc_daily_reward,
      acc_fee: data.acc_fee,
      withdrawn_amount: data.withdrawn_amount,
      is_plan_active: data.is_plan_active,
      enrolled_at: data.enrolled_at,
      last_accounted_time: data.last_accounted_time,
      plan_id: data.plan_id,
      referrer: data.referrer,
      referral_distribution: ReferralDistributionState.fromJSON(
        data.referral_distribution
      ),
      upgrade_deduction: (data.upgrade_deduction || []).map((ud: any) =>
        UpgradeDeduction.fromJSON(ud)
      ),
      accumulated: Accumulated.fromJSON(data.accumulated),
    });
  }
}
