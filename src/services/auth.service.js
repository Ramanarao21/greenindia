import prisma from '../prisma/client.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async ({ name, email, password }) => {
  // Check existing user
  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    throw {
      status: 400,
      message: 'email already exists'
    };
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed
    }
  });

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw { status: 401, message: 'unauthorized' };
  }

  const valid = await comparePassword(password, user.password);

  if (!valid) {
    throw { status: 401, message: 'unauthorized' };
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  };
};
