import { Router } from 'express';
import { callHistory } from '../controllers/call.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/history', callHistory);

export default router;
