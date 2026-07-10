import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
router.use(authenticate);

router.post('/', upload.single('file'), uploadFile);

export default router;
