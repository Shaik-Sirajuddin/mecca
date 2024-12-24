// database/connection.js
import { Sequelize } from "sequelize";
import "dotenv/config";
import fs from "fs";
import path from "path";

// Initialize Sequelize with your database configuration
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false, // Set to true if you want to see SQL queries in the console
  pool: {
    max: 1000,
    min: 0,
    acquire: 3000,
    idle: 1000,
  },
});

// Make the connection
async function syncModels(models = path.join(process.cwd(), "src/models")) {
  const db: Map<String, any> = new Map();

  fs.readdirSync(models).forEach(async function (fileOrDir) {
    const fullPath = path.join(models, fileOrDir);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      syncModels(fullPath);
      //assuming only .js or .ts files
    } else if (fileOrDir.indexOf(".") !== 0) {
      const model = await import(fullPath);
      const modelInstance = model.default;
      db.set(modelInstance.name, modelInstance);
    }
  });

  Object.keys(db).forEach(function (modelName) {
    if (db.get(modelName).associate) {
      db.get(modelName).associate;
    }
  });
}

async function makeConnection() {
  try {
    await syncModels();
    await sequelize.authenticate();
    await sequelize.sync({ alter: false, force: false });
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
}
// Export the sequelize instance and testConnection function
export { sequelize, makeConnection };
