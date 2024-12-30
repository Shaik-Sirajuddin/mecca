import express from "express";
import dotenv from "dotenv";
import { redisConnect } from "./config/redis";
import { setUpCron } from "./services/cronjobs";
import { app } from "./config/server";
import { makeConnection } from "./database/connection";
dotenv.config();

const port = 3030;

app.get("/", (req, res) => {
  res.send("Hello, TypeScript Node Express!");
});

makeConnection().then(async () => {
  await redisConnect();
  setUpCron();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
