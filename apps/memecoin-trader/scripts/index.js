import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runSingleTrade } from "./ai-agent.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Agent API is running.");
});

app.post("/run-trade", async (req, res) => {
  try {
    const trendingTokens = req.body.trendingTokens;
    if (!trendingTokens || !Array.isArray(trendingTokens)) {
      return res.status(400).json({ error: "Invalid or missing trendingTokens array in request body." });
    }

    await runSingleTrade(trendingTokens);
    res.json({ message: "Trade executed successfully." });
  } catch (error) {
    console.error("Error executing trade:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Agent API is running on http://localhost:${PORT}`);
});