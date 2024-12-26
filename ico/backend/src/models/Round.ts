import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database/connection";

export interface RoundAttributes {
  id: number;
  tokenPrice: string; // Using string to match Sequelize's DECIMAL type
  endTime: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoundCreationAttributes
  extends Optional<RoundAttributes, "id"> {}

const Round = sequelize.define<Model<RoundAttributes, RoundCreationAttributes>>(
  "Round",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    //usd per token
    tokenPrice: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "Round",
  }
);

export default Round;
