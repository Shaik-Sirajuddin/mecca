import Admin from "../models/Admin";
import AidropConfig from "../models/AirdropConfig";
export const intializeDB = async () => {
  try {
    let config = await AidropConfig.findOne({ where: {} });
    if (!config) {
      await AidropConfig.create({
        amount: 10,
        minSolAmount: 0.001,
        paused: false,
        endTime: new Date("2025-04-30T23:59:00.000Z"),
      });
    }
    let admin = await Admin.findOne({ where: {} });
    if (!admin) {
      await Admin.create({
        email: "test@gmail.com",
        password: "",
      });
    }
  } catch (error) {
    console.log("Intialize db error : ", error);
  }
};
