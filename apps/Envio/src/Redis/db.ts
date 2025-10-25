import { createClient } from "redis";
import { OnChainAggregator } from "../aggregate.js";
import * as dotenv from "dotenv";

dotenv.config();

interface Token {
  address: string;
  firstSeenBlock: number;
  firstSeenTimestamp: number;
}

const client = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || "",
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

client.on("error", (err) => {
  // Redis error
});

await client.connect();

// the endpoint which will run only once at the start
export async function runOnceAtStart(tokens: Token[]) {
  const aggregator = new OnChainAggregator();
  for (const token of tokens) {
    await client.set(token.address, JSON.stringify(token));
  }
}

// ---- store token ----
const tokenData = {
  address: "0x1234abcd",
  trendingscore: 21,
  no: 1,
};

await client.set(tokenData.address, JSON.stringify(tokenData));

// ---- retrieve token ----
const data = await client.get("0x1234abcd");
if (data) {
  const parsed = JSON.parse(data);
}
