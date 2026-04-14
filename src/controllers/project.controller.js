import { createProject, getUserProjects, getProjectById, updateProject, deleteProject, getProjectTasks as getProjectTasksService, createProjectTask as createProjectTaskService, getProjectStats as getProjectStatsService } from '../services/project.service.js';

export const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user.user_id;

    const project = await createProject({ name, description, ownerId });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const projects = await getUserProjects(userId);

    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await getProjectById(id);

    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.user_id;

    const project = await updateProject({ projectId: id, userId, name, description });

    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await deleteProject({ projectId: id, userId });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignee } = req.query;

    const tasks = await getProjectTasksService(id, { status, assignee });

    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    const userId = req.user.user_id;

    const task = await createProjectTaskService({ projectId: id, title, description, assignedTo, status, priority, dueDate, userId });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const stats = await getProjectStatsService(id);

    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};
