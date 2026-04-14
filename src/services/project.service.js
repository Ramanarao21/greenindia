import prisma from '../prisma/client.js';

export const createProject = async ({ name, description, ownerId }) => {
  if (!name) {
    throw { status: 400, message: 'validation failed' };
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId
    }
  });

  return project;
};

export const getUserProjects = async (userId) => {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { tasks: { some: { assignedTo: userId } } }
      ]
    },
    include: {
      tasks: true
    }
  });

  return projects;
};

export const getProjectById = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: true
    }
  });

  if (!project) {
    throw { status: 404, message: 'not found' };
  }

  return project;
};

export const updateProject = async ({ projectId, userId, name, description }) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw { status: 404, message: 'not found' };
  }

  if (project.ownerId !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  if (!name) {
    throw { status: 400, message: 'validation failed' };
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      description
    }
  });

  return updated;
};

export const deleteProject = async ({ projectId, userId }) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw { status: 404, message: 'not found' };
  }

  if (project.ownerId !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  await prisma.project.delete({
    where: { id: projectId }
  });

  return { message: 'project deleted' };
};

export const getProjectTasks = async (projectId, filters = {}) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw { status: 404, message: 'not found' };
  }

  const where = { projectId };
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.assignee) {
    where.assignedTo = filters.assignee;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return tasks;
};

export const createProjectTask = async ({ projectId, title, description, assignedTo, status, priority, dueDate, userId }) => {
  if (!title) {
    throw { status: 400, message: 'validation failed' };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw { status: 404, message: 'not found' };
  }

  if (project.ownerId !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assignedTo,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: userId
    }
  });

  return task;
};

export const getProjectStats = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw { status: 404, message: 'not found' };
  }

  const tasks = await prisma.task.findMany({
    where: { projectId }
  });

  const statsByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const statsByAssignee = tasks.reduce((acc, task) => {
    const assignee = task.assignedTo || 'unassigned';
    acc[assignee] = (acc[assignee] || 0) + 1;
    return acc;
  }, {});

  return {
    totalTasks: tasks.length,
    byStatus: statsByStatus,
    byAssignee: statsByAssignee
  };
};
