import * as dotenv from "dotenv";
import server from "./config/server";
// import { makeConnection } from "./database/connection";

dotenv.config();
const port = 3020;

server.listen(port, () => {
  console.log(`server listening at ${port}`);
});

// makeConnection().th en((res) => {
//   // intializeDB();
// });
