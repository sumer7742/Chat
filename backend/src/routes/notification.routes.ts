import { Router } from 'express';
import * as ctrl from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.listNotifications);
router.get('/unread-count', ctrl.unreadCount);
router.post('/read-all', ctrl.markAllRead);

export default router;
