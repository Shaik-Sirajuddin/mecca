import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  database: 2,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export const redisConnect = async () => {
  await redisClient.connect();
  console.log("Connected to Redis");
};

// Function to set cached data
export const setCacheData = async (
  key: string,
  data: unknown,
  expirationInSeconds = 60 * 10
) => {
  await redisClient.setEx(
    key,
    expirationInSeconds,
    JSON.stringify({ data: data })
  );
};

// Function to get cached data
export const getCacheData = async (key: string) => {
  let data = await redisClient.get(key);
  let result = data ? JSON.parse(data) : null;
  return result ? result.data : null;
};

export const setCacheDataWithoutExpiration = async (
  key: string,
  data: unknown
) => {
  await redisClient.set(key, JSON.stringify({ data: data }));
};
export default redisClient;
