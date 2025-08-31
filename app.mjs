import express from 'express'

const app = express();
const PORT = 3000;
const IP_ADD = '0.0.0.0'; //all local addresses

app.get('/', (req, res) => {
  res.send('Hello Express');
})

app.listen(PORT, IP_ADD);
