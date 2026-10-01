import { Router, Response } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/authMiddleware';
import { login, logout } from '../controllers/authController';

const router = Router();

// 1. Auth Endpoints
router.post('/login', login);
router.post('/logout', logout);

// 2. Admin Dashboard Protected Route (GT-BUG-002)
router.get(
  '/admin-dashboard',
  authenticateToken,
  authorizeRoles('admin'),
  (req: AuthRequest, res: Response) => {
    res.status(200).json({
      message: `Welcome Admin! Access granted. User ID: ${req.user?.userId}`
    });
  }
);

export default router;