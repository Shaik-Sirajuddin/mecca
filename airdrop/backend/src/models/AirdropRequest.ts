import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database/connection";

interface AirdropRequestAttributes {
  id: number;
  address: string;
  ip: string;
  underProcess: boolean;
  success: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AirdropRequestCreationAttributes
  extends Optional<AirdropRequestAttributes, "id"> {}

const AirdropRequest = sequelize.define<
  Model<AirdropRequestAttributes, AirdropRequestCreationAttributes>
>(
  "AirdropRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    underProcess: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    success: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "AirdropRequest",
  }
);

export default AirdropRequest;
