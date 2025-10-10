//libraries and APIs
import 'dotenv/config'
import express from 'express'
import user_route from './api/users.mjs';
import file_route from './api/files.mjs';

//setup express app
const app = express();
const PORT = process.env.PORT || 3000;
const IP_ADD = process.env.IP_ADD;
app.use(express.json());

//add routes
app.use('/api', user_route);
app.use('', file_route);

//Bind to IP_ADD on PORT
app.listen(PORT, IP_ADD);