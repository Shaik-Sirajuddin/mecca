import IcoConfig from "../models/IcoConfig";
import Round from "../models/Round";

let initialRounds = [
  { tokenPrice: "0.02", endTime: new Date(Date.UTC(2025, 1, 28, 23, 59, 0))},  // Price for 2/28 at 23:59 UTC
  { tokenPrice: "0.027", endTime: new Date(Date.UTC(2025, 2, 31, 23, 59, 0)) },  // Price for 3/31 at 23:59 UTC
  { tokenPrice: "0.034", endTime: new Date(Date.UTC(2025, 3, 30, 23, 59, 0))},  // Price for 4/30 at 23:59 UTC
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
