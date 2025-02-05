import * as dotenv from "dotenv";
import server from "./config/server";
import { redisConnect } from "./config/redis";
import { setUpCron } from "./services/cronjobs";
import { makeConnection } from "./config/connection";

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
