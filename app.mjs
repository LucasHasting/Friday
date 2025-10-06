//libraries
import 'dotenv/config'
import express from 'express'
import { MongoClient, ServerApiVersion } from 'mongodb'

const app = express();
const PORT = process.env.PORT;
const IP_ADD = '127.0.0.1';
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello Express! (this was pushed)');
})

app.listen(PORT, IP_ADD);
