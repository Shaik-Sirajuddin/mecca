import { Connection, Keypair } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { init_app_state } from "./src/init_app_state";
dotenv.config();

const connection = new Connection('http://localhost:8899')
init_app_state(connection).then((res)=>{
    console.log(res)
})