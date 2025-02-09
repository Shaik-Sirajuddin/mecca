import * as dotenv from "dotenv";
import server from "./config/server";
import { redisConnect } from "./config/redis";
import { setUpCron } from "./services/cronjobs";
import { makeConnection } from "./config/connection";
import { backUpUserRewards, test } from "./utils/migrate";
dotenv.config();
const port = 3050;

server.listen(port, () => {
  console.log(`server listening at ${port}`);
});

makeConnection().then(async (res) => {
  redisConnect().then(() => {
    setUpCron();
  });
});
// backUpUserRewards();
// extractRewardsFromHash(
//   "5cJdyMNgoAEujaC5HvPU4PuThPQyu5S8k1TcW8Mq3a9GtkWo8GuRUivM7R5ePX56qXM5NZP9ik3F21Z9cdRCG64U"
// );
//48xqFkckqsJLtzeQmBx5bjNpLqi5sQpkgYu48iFJd3pkPMpZh49qLPVXUk4rCZHVXDR8mS3rbYeyd7txBMY3Cm3e
// distributeRewardsOfUser(new PublicKey('FMvVHZGRg82fNuLJMYDmYxFDPt1U6jvyEDS55FGrYzxT'))
//
// test()
//
