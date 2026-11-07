import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface UserPayload {
    id: number;
    name: string;
    email: string;
    role: "admin" | "staff";
}

// Blacklisted (logged-out) tokens. This is the ONLY place it is defined.
export const tokenBlacklist = new Set<string>();

// AUTHENTICATE TOKEN
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    // Logged-out token check
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({
            message: "Token has been invalidated. Please log in again."
        });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(500).json({
                message: "JWT_SECRET is not configured"
            });
        }

        const decoded = jwt.verify(token, jwtSecret);

        if (typeof decoded === "string") {
            return res.status(403).json({
                message: "Invalid token payload"
            });
        }

        if (
            typeof decoded.id !== "number" ||
            typeof decoded.name !== "string" ||
            typeof decoded.email !== "string" ||
            (decoded.role !== "admin" && decoded.role !== "staff")
        ) {
            return res.status(403).json({
                message: "Invalid token payload"
            });
        }

        req.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
};

// ROLE CHECK (e.g. authorizeRoles("admin", "staff"))
export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                message: "User authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied: Insufficient permissions"
            });
        }

        next();
    };
};

// ADMIN ONLY (shortcut used by the new routes)
export const adminOnly = authorizeRoles("admin");
