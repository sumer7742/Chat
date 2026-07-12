import { Router } from 'express';
import * as chat from '../controllers/chat.controller';
import * as message from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createPrivateSchema,
  createGroupSchema,
  updateGroupSchema,
  membersSchema,
  memberParamSchema,
  setRoleSchema,
  inviteSchema,
  memberFlagsSchema,
  pinMessageSchema,
} from '../validators/chat.validator';
import {
  sendMessageSchema,
  listMessagesSchema,
  seenSchema,
  searchMessagesSchema,
} from '../validators/message.validator';
import { idParam } from '../validators/common';

const router = Router();
router.use(authenticate);

// Chats
router.get('/', chat.listChats);
router.post('/private', validate(createPrivateSchema), chat.openPrivate);
router.post('/group', validate(createGroupSchema), chat.createGroup);
router.post('/join', validate(inviteSchema), chat.joinByInvite);

router.get('/:id', validate({ params: idParam }), chat.getChat);
router.patch('/:id', validate(updateGroupSchema), chat.updateGroup);
router.post('/:id/members', validate(membersSchema), chat.addMembers);
router.delete('/:id/members/:userId', validate(memberParamSchema), chat.removeMember);
router.patch('/:id/members/:userId/role', validate(setRoleSchema), chat.setRole);
router.patch('/:id/flags', validate(memberFlagsSchema), chat.setFlags);
router.post('/:id/pin', validate(pinMessageSchema), chat.pinMessage);
router.post('/:id/leave', validate({ params: idParam }), chat.leaveChat);

// Messages (nested under a chat)
router.get('/:id/messages', validate(listMessagesSchema), message.listMessages);
router.get('/:id/messages/media', validate({ params: idParam }), message.listMedia);
router.post('/:id/messages', validate(sendMessageSchema), message.sendMessage);
router.post('/:id/messages/seen', validate(seenSchema), message.markSeen);
router.get('/:id/messages/search', validate(searchMessagesSchema), message.searchMessages);

export default router;
