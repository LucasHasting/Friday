//libraries
import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import user_route from './api/users.mjs';

//setup app and database connection 
const app = express();
const PORT = process.env.PORT || 3000;
const IP_ADD = process.env.IP_ADD;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

//user api
app.use('/api', user_route);

app.get('/', async (req, res) => {
      res.redirect(join('/login'));
});

app.get('/login', async (req, res) => {
      res.sendFile(join(__dirname, 'views', 'login.html'));
});

app.get('/account', async (req, res) => {
      res.sendFile(join(__dirname, 'views', 'account.html'));
});

app.get('/auth', async (req, res) => {
      res.sendFile(join(__dirname, 'scripts', 'auth.js'));
});

app.listen(PORT, IP_ADD);