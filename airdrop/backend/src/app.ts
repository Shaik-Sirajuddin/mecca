import * as dotenv from "dotenv";
import { intializeDB } from "./database/initData";
import server from "./config/server";
import { makeConnection } from "./database/connection";
import * as speakeasy from "speakeasy";

dotenv.config();
const port = 3020;

server.listen(port, () => {
  console.log(`server listening at ${port}`);
});

makeConnection().then((res) => {
  intializeDB();
});

function generate_secret_key() {
  // Generate a secret key
  const secretKey = speakeasy.generateSecret({ length: 20 });

  return secretKey;
}

console.log(generate_secret_key())
