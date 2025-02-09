import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/connection";

interface UserDataAttributes {
  id: number;
  address: string;
  data: string;
  code: string;
}

interface UserDataCreationAttributes
  extends Optional<UserDataAttributes, "id"> {}

const UserData = sequelize.define<
  Model<UserDataAttributes, UserDataCreationAttributes>
>(
  "UserData",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "user_data",
  }
);

export default UserData;
