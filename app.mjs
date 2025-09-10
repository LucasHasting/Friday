//Source: https://superuser.com/questions/949428/whats-the-difference-between-127-0-0-1-and-0-0-0-0

import express from 'express'

const app = express();
const PORT = 3000;
const IP_ADD = '127.0.0.1';

app.get('/', (req, res) => {
  res.send('Hello Express! (this was pushed)');
})

app.listen(PORT, IP_ADD);
