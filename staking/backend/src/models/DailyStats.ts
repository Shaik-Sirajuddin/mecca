import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database/connection";

interface DailyStatsAttributes {
  id: number;
  stakedAmount: string;
  date: Date;
}

interface DailyStatusCreationAttributes
  extends Optional<DailyStatsAttributes, "id"> {}

const DailyStats = sequelize.define<
  Model<DailyStatsAttributes, DailyStatusCreationAttributes>
>(
  "DailyStats",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    stakedAmount: {
      type: DataTypes.DECIMAL(32, 9),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "DailyStats",
  }
);

export default DailyStats;
