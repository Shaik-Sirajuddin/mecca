import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database/connection";
import bcrypt from "bcrypt";

interface AdminAttributes {
  id: number;
  email: string;
  password: string;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
}

interface AdminCreationAttributes
  extends Optional<AdminAttributes, "id" | "resetToken" | "resetTokenExpiry"> {}

const Admin = sequelize.define<Model<AdminAttributes, AdminCreationAttributes>>(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Must be a valid email address",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "Admin",
  }
);

// Adding an instance method for validating passwords
(Admin as any).prototype.validatePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default Admin;
