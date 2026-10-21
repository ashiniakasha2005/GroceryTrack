import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../controllers/authController'; // authController එකෙන් blacklist එක import කරගන්න

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

// req.user එක අඳුරගන්න Custom Request interface එක
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  // Token එක Blacklist එකේ තියෙනවාදැයි පරීක්ෂා කිරීම (Logout වූ Token එකක්දැයි බලයි)
  if (tokenBlacklist.includes(token)) {
    return res.status(401).json({ message: 'Token has been invalidated. Please log in again.' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = decoded as JwtPayload; 
    next();
  });
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
  };
}