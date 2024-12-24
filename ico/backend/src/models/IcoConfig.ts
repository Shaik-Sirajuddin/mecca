import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database/connection";

interface IcoConfigAttributes {
  id: number;
  startTime: Date;
  paused: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IcoConfigCreationAttributes
  extends Optional<IcoConfigAttributes, "id"> {}

const IcoConfig = sequelize.define<
  Model<IcoConfigAttributes, IcoConfigCreationAttributes>
>(
  "IcoConfig",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    paused: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "IcoConfig",
  }
);

export default IcoConfig;
