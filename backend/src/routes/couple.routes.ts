import { Router } from 'express';
import * as ctrl from '../controllers/couple.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { joinCoupleSchema, nicknameSchema } from '../validators/couple.validator';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.myCouple);
router.post('/join', validate(joinCoupleSchema), ctrl.joinCouple);
router.post('/verify-code', validate(joinCoupleSchema), ctrl.verifyCode);
router.patch('/nickname', validate(nicknameSchema), ctrl.setNickname);

export default router;
