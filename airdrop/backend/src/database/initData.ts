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
  } catch (error) {
    console.log("Intialize db error : ", error);
  }
};
