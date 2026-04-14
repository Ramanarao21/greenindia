import { registerUser, loginUser } from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "validation failed",
        fields: {
          name: !name && "required",
          email: !email && "required",
          password: !password && "required"
        }
      });
    }

    const user = await registerUser({
      name,
      email,
      password
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({
      email,
      password
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
