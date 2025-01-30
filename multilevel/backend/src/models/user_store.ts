import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/connection";

interface UserStoreAttributes {
  id: number;
  address: string;
  data: string;
}

interface UserStoreCreationAttributes
  extends Optional<UserStoreAttributes, "id"> {}

const UserStore = sequelize.define<
  Model<UserStoreAttributes, UserStoreCreationAttributes>
>(
  "UserStore",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique : true,
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "user_store",
  }
);

export default UserStore;
