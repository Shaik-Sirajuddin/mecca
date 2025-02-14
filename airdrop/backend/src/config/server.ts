import express from "express";
import { createServer } from "http";
import cors from "cors";
import bodyParser from "body-parser";
import publicRouter from "../router/publicRouter";
import adminRouter from "../router/adminRouter";
import cookieParser from "cookie-parser";
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
const corsOptions = {
  origin: (_origin: any, callback: (arg0: any, arg1: boolean) => void) => {
    // Check if the origin is in the list of allowed origins
    callback(null, true);
  },
  //   origin: "http://localhost:3000", // Change this to the specific domain you want to allow
  methods: "GET,PUT,POST,OPTIONS", // Specify allowed methods
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"], 
};
app.use(cors(corsOptions));

app.use("/public", publicRouter);
app.use("/admin", adminRouter);

const server = createServer(app);
export { app };
export default server;
