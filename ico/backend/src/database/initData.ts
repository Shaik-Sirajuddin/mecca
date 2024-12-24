import IcoConfig from "../models/IcoConfig";
import Round from "../models/Round";

let initialRounds = [
  { tokenPrice: "0.05", endTime: new Date("2024-12-24T09:42:43") },
  { tokenPrice: "0.07", endTime: new Date("2024-12-31T09:42:43") },
  { tokenPrice: "0.09", endTime: new Date("2025-01-07T09:42:43") },
  { tokenPrice: "0.1", endTime: new Date("2025-01-14T09:42:43") },
];
export const intializeDB = async () => {
  try {
    let config = await IcoConfig.findOne({ where: {} });
    if (!config) {
      await IcoConfig.create({
        startTime: new Date(),
        paused: false,
      });
    }
    let rounds = await Round.findAll({ where: {} });
    if (rounds.length == 0) {
      await Round.bulkCreate(initialRounds);
    }
  } catch (error) {
    console.log("Intialize db error : ", error);
  }
};
