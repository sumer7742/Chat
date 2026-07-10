import { Router } from 'express';
import * as ctrl from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  updateProfileSchema,
  updatePrivacySchema,
  searchUsersSchema,
  userIdParam,
  sessionIdParam,
} from '../validators/user.validator';

const router = Router();
router.use(authenticate);

router.get('/me', ctrl.getMe);
router.patch('/me', validate(updateProfileSchema), ctrl.updateProfile);
router.patch('/me/privacy', validate(updatePrivacySchema), ctrl.updatePrivacy);

router.get('/search', validate(searchUsersSchema), ctrl.searchUsers);

router.get('/sessions', ctrl.listSessions);
router.delete('/sessions/:sessionId', validate({ params: sessionIdParam }), ctrl.revokeSession);

router.get('/:userId', validate({ params: userIdParam }), ctrl.getUser);
router.post('/:userId/block', validate({ params: userIdParam }), ctrl.blockUser);
router.delete('/:userId/block', validate({ params: userIdParam }), ctrl.unblockUser);
router.post('/:userId/mute', validate({ params: userIdParam }), ctrl.muteUser);
router.delete('/:userId/mute', validate({ params: userIdParam }), ctrl.unmuteUser);

export default router;
