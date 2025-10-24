import express from "express";
import cors from "cors";
import { fetchTokenAddresses } from "./fetch-token-address.js";
import { metadata } from "./test.js";
import { getAllTokenTransactions } from "./transaction.js";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3001", 10);
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: corsOrigin,
  })
);

app.get("/", (req, res) => {
  res.send("Envio API is running");
});

app.get("/token-metadata/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const data = await metadata(address);
    res.json(data);
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    res.status(500).json({ error: "Failed to fetch token metadata" });
  }
});

app.get("/token-addresses", async (req, res) => {
  try {
    const addresses = await fetchTokenAddresses();
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching token addresses:", error);
    res.status(500).json({ error: "Failed to fetch token addresses" });
  }
});

app.get("/transactions/:address", async (req, res) => {
  try {
    const tokenAddress = req.params.address as string;
    if (!tokenAddress) {
      return res.status(400).json({ error: "Token address is required" });
    }
    const transactions = await getAllTokenTransactions(tokenAddress);
    return res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});
app.listen(port, () => {
  console.log(`🚀 Envio API listening at http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 CORS Origin: ${corsOrigin}`);
});
