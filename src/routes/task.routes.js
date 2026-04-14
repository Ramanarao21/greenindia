import express from 'express';
import { getById, update, remove } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:id', authenticate, getById);
router.patch('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

export default router;
