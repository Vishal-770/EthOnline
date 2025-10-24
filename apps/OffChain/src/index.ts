import expres from "express"
import cors from "cors"
import { fetaclTokenData, fetchAllSocialData } from "./fetchSocials.ts"

const app = expres()
const port = 3002

app.use(cors())

app.get("/", (req, res) => {
  res.send("OffChain API is running")
})

app.get("/allposts", async (req, res) => {
    try {
        const posts = await fetchAllSocialData();
        res.json(posts);
    } catch (error) {
        console.log(error)
    }
})

app.get('/tokenpost', async(req, res)=>{
    try {
        const memeCoins = req.body.memeCoins as String[];
        const cryptoTerms = req.body.cryptoTerms as String[];
        const subreddits = req.body.subreddits as String[];
        const posts = await fetaclTokenData(memeCoins, cryptoTerms, subreddits);
        res.json(posts);
    } catch (error) {
        console.log(error)
    }
})

app.listen(port, () => {
  console.log(`OffChain API listening at http://localhost:${port}`)
});