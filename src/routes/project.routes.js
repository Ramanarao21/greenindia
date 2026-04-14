import express from 'express';
import { create, getAll, getById, update, remove, getTasks, createTask, getStats } from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, create);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.patch('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);
router.get('/:id/tasks', authenticate, getTasks);
router.post('/:id/tasks', authenticate, createTask);
router.get('/:id/stats', authenticate, getStats);

export default router;
