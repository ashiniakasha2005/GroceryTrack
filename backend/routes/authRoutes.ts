import { Router, Response } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/authMiddleware';
import { login } from '../controllers/authController'; // Ashiniගේ real login function එක

const router = Router();

// 1. Ashiniගේ Real Login Endpoint එක
router.post('/login', login);

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