import { createClient } from 'redis';
import { OnChainAggregator } from '../aggregate.ts';

interface Token {
    address: string,
    firstSeenBlock: number,
    firstSeenTimestamp: number
}


const client = createClient({
  username: 'default',
  password: 'pDQQrMEE5RQ9aMMqBw4WdKWItjNYmWHB',
  socket: {
    host: 'redis-13615.c277.us-east-1-3.ec2.redns.redis-cloud.com',
    port: 13615
  }
});

client.on('error', err => console.log('Redis Client Error', err));

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
  address: '0x1234abcd',
  trendingscore: 21,
  no: 1
};

await client.set(tokenData.address, JSON.stringify(tokenData));

// ---- retrieve token ----
const data = await client.get('0x1234abcd');
console.log(JSON.parse(data));