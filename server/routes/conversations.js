import express from 'express';
import { getConversations, getConversation, postMessage, createConversation, updateGroupDetails } from '../controllers/conversations.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getConversations);
router.get('/:id', auth, getConversation);
router.patch('/:id', auth, postMessage);
router.post('/', auth, createConversation);
router.put('/:id/group', auth, updateGroupDetails);

export default router;