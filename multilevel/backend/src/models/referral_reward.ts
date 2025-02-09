import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/connection";

interface ReferralRewardAttributes {
  id: number;
  hash: string;
  address: string;
  from: string;
  invested_amount: number; // Amount invested during enroll or upgrade (u64)
  level: number; // Level (u8)
  plan_id: number; // Plan ID (u8)
  reward_amount: number; // Reward amount (u64)
  reward_time: number; // Reward time (u64)
  plan_entry_time: number; // Plan entry time (u64)
}

interface ReferralRewardCreationAttributes
  extends Optional<ReferralRewardAttributes, "id"> {}

const ReferralReward = sequelize.define<
  Model<ReferralRewardAttributes, ReferralRewardCreationAttributes>
>(
  "ReferralReward",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invested_amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reward_amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    reward_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    plan_entry_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "referral_reward",
  }
);

export default ReferralReward;
