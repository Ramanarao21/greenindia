import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid token'
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Token expired'
      });
    }

    next(err);
  }
};
