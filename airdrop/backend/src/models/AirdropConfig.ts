import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database/connection";

interface AirdropConfigAttributes {
  id: number;
  amount: number;
  minSolAmount: number;
  paused: boolean;
  endTime: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AirdropConfigCreationAttributes
  extends Optional<AirdropConfigAttributes, "id"> {}

const AirdropConfig = sequelize.define<
  Model<AirdropConfigAttributes, AirdropConfigCreationAttributes>
>(
  "AirdropConfig",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minSolAmount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paused: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "AirdropConfig",
  }
);

export default AirdropConfig;
