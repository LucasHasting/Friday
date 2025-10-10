import { Router } from 'express';
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

//HTML FILES
router.get('/', (req, res) => {
      res.redirect('/login');
});

router.get('/login', async (req, res) => {
      res.sendFile(join(__dirname, '../views', 'login.html'));
});

router.get('/account', async (req, res) => {
      res.sendFile(join(__dirname, '../views', 'account.html'));
});

//JS FILES
router.get('/auth', async (req, res) => {
      res.sendFile(join(__dirname, '../scripts', 'auth.js'));
});

router.get('/files', async (req, res) => {
      res.sendFile(join(__dirname, '../scripts', 'file_handling.js'));
});

export default router;