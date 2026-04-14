import prisma from '../prisma/client.js';

export const getTaskById = async (taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!task) {
    throw { status: 404, message: 'not found' };
  }

  return task;
};

export const updateTask = async ({ taskId, userId, title, description, status, priority, dueDate, assignedTo }) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    throw { status: 404, message: 'not found' };
  }

  if (task.project.ownerId !== userId && task.createdBy !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assignedTo !== undefined && { assignedTo })
    }
  });

  return updated;
};

export const deleteTask = async ({ taskId, userId }) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    throw { status: 404, message: 'not found' };
  }

  if (task.project.ownerId !== userId && task.createdBy !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  await prisma.task.delete({
    where: { id: taskId }
  });

  return { message: 'task deleted' };
};
