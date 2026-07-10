import { Router } from 'express';
import * as message from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { idParam } from '../validators/common';
import {
  editMessageSchema,
  reactionSchema,
  forwardSchema,
} from '../validators/message.validator';

const router = Router();
router.use(authenticate);

// Cross-chat message actions keyed by message id.
router.get('/starred', message.listStarred);
router.patch('/:id', validate(editMessageSchema), message.editMessage);
router.delete('/:id', validate({ params: idParam }), message.deleteForEveryone);
router.delete('/:id/me', validate({ params: idParam }), message.deleteForMe);
router.post('/:id/react', validate(reactionSchema), message.react);
router.post('/:id/star', validate({ params: idParam }), message.star);
router.post('/:id/forward', validate(forwardSchema), message.forward);

export default router;
