import express from "express";
import { createServer } from "http";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "../router/userRouter";
const app = express();

app.use(bodyParser.json());
const corsOptions = {
  origin: (_origin: any, callback: (arg0: any, arg1: boolean) => void) => {
    // Check if the origin is in the list of allowed origins
    callback(null, true);
  },
  //   origin: "http://localhost:3000", // Change this to the specific domain you want to allow
  methods: "GET,PUT,POST,OPTIONS", // Specify allowed methods
  credentials: true,
  allowedHeaders: "*",
};
app.use(cors(corsOptions));

app.use("/user", cors(corsOptions), userRouter);

const server = createServer(app);
export { app };
export default server;
