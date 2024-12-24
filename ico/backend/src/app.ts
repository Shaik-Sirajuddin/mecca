import * as dotenv from "dotenv";
import { intializeDB } from "./database/initData";
import server from "./config/server";

const port = 3020;

server.listen(port, () => {
  console.log("server started");
});

dotenv.config();
intializeDB();
