import { getTaskById, updateTask, deleteTask } from '../services/task.service.js';

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await getTaskById(id);

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const userId = req.user.user_id;

    const task = await updateTask({ taskId: id, userId, title, description, status, priority, dueDate, assignedTo });

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await deleteTask({ taskId: id, userId });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
