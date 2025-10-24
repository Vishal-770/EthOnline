import express from "express"
import cors from "cors"
import { fetchTokenAddresses } from "./fetch-token-address.ts"
import { metadata} from "./test.ts"
import { getAllTokenTransactions } from "./transaction.ts"

const app = express()
const port = 3001

app.use(cors())

app.get("/", (req, res) => {
  res.send("Envio API is running")
})

app.get("/token-metadata/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const data = await metadata(address)
    res.json(data)
  } catch (error) {
    console.error("Error fetching token metadata:", error)
    res.status(500).json({ error: "Failed to fetch token metadata" })
  }
});

app.get('/token-addresses', async (req, res) => {
  try {
    const addresses = await fetchTokenAddresses();
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching token addresses:', error);
    res.status(500).json({ error: 'Failed to fetch token addresses' });
  }
});

app.get('/transactions/:address', async (req, res)=>{
  try {
    const tokenAddress = req.params.address as string;
    if (!tokenAddress) {
      return res.status(400).json({ error: 'Token address is required' });
    }
    const transactions = await getAllTokenTransactions(tokenAddress);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
})
app.listen(port, () => {
  console.log(`Envio API listening at http://localhost:${port}`)
});
