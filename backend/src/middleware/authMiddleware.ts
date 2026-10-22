
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: 'Authentication token required',
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({
      message: 'Server configuration error',
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === 'string' ||
      typeof decoded.userId !== 'number'
    ) {
      return res.status(401).json({
        message: 'Invalid authentication token',
      });
    }

    req.user = {
      userId: decoded.userId,
      email: typeof decoded.email === 'string' ? decoded.email : '',
      role: typeof decoded.role === 'string' ? decoded.role : '',
    };

    next();
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
}

import type { Request, Response, NextFunction } from 'express';

export function authorizeStockRoles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  const allowedRoles = ['admin', 'staff'];

  if (!allowedRoles.includes(req.user.role.toLowerCase())) {
    return res.status(403).json({
      message: 'Access denied. Admin or Staff role required.'
    });
  }

  next();
}


