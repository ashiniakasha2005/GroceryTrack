import { Router, Request, Response } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";
import { login, logout } from "../controllers/authController";

const router = Router();

// Auth endpoints
router.post("/login", login);
router.post("/logout", logout);

// Admin dashboard protected route (GT-BUG-002)
router.get(
    "/admin-dashboard",
    authenticateToken,
    authorizeRoles("admin"),
    (req: Request, res: Response) => {
        res.status(200).json({
            message: `Welcome Admin! Access granted. User ID: ${req.user?.id}`
        });
    }
);

export default router;
