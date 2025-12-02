import { Router } from 'express';

// Setup directory and router variables
const router = Router();

//DOCS
router.get('/time', async (req, res) => {
      res.status(200).send({time: Date.now()});
});

export default router;