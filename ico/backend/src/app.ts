import * as dotenv from "dotenv";
import { intializeDB } from "./database/initData";
import server from "./config/server";
import { makeConnection } from "./database/connection";

dotenv.config();
const port = 3010;

server.listen(port, () => {
  console.log(`server listening at ${port}`);
});

makeConnection().then((res) => {
  intializeDB();
});
