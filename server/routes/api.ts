import { Router } from 'express';
import * as usersCtrl from '../controllers/usersController';
import * as roomsCtrl from '../controllers/roomsController';
import * as msgsCtrl from '../controllers/messagesController';
import mongoose from '../db';

const router = Router();

// Users
router.get('/users', usersCtrl.listUsers);
router.get('/users/:id', usersCtrl.getUser);
router.post('/users', usersCtrl.createUser);
router.put('/users/:id', usersCtrl.updateUser);
router.delete('/users/:id', usersCtrl.deleteUser);

// Rooms
router.get('/rooms', roomsCtrl.listRooms);
router.get('/rooms/:id', roomsCtrl.getRoom);
router.post('/rooms', roomsCtrl.createRoom);
router.post('/rooms/:id/join', roomsCtrl.joinRoom);
router.post('/rooms/:id/leave', roomsCtrl.leaveRoom);

// Messages
router.get('/messages', msgsCtrl.listMessages);
router.post('/messages', msgsCtrl.createMessage);

// Health
router.get('/health', (req, res) => {
	// mongoose.connection.readyState: 0 = disconnected, 1 = connected
	const ready = (mongoose as any).connection?.readyState ?? null;
	res.json({ mongoReadyState: ready });
});

export default router;
