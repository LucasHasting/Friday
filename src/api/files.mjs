import { Router } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Setup directory and router variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

//HTML FILES
router.get('/', async (req, res) => {
      res.sendFile(join(__dirname, '../../pages/views', 'friday.html'));
});

router.get('/login', async (req, res) => {
      res.sendFile(join(__dirname, '../../pages/views', 'login.html'));
});

router.get('/account', async (req, res) => {
      res.sendFile(join(__dirname, '../../pages/views', 'account.html'));
});

//JS FILES
router.get('/auth', async (req, res) => {
      res.sendFile(join(__dirname, '../../pages/scripts', 'auth.js'));
});

router.get('/files', async (req, res) => {
      res.sendFile(join(__dirname, '../../pages/scripts', 'file_handling.js'));
});

router.get('/dash', async (req, res) => {
      res.sendFile(join(__dirname, '../../pages/scripts', 'dashboard.js'));
});

//STYLE SHEET
router.get('/style', async (req, res) => {
      res.sendFile(join(__dirname, '../../pages/styles', 'style.css'));
});

export default router;