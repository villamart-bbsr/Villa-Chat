import express from 'express'
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent, messageEvent, deleteEventByCreatorIdDate, updateEventByCreatorIdDate, getEventByCreatorIdDate } from '../controllers/events.js'
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getEvents);
router.get('/:id', auth, getEvent);
router.get('/:date/getEvent', auth, getEventByCreatorIdDate);
router.post('/', auth, createEvent);
router.patch('/:id', auth, updateEvent);
router.patch('/:date/updateEvent', auth, updateEventByCreatorIdDate);
router.delete('/:id', auth, deleteEvent);
router.delete('/:date/delEvent', auth, deleteEventByCreatorIdDate);
router.post('/:id/eventMsg', auth, messageEvent);

export default router;