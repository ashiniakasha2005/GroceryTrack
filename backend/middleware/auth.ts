import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface UserPayload {
    id: number;
    name: string;
    email: string;
    role: "admin" | "staff";
}

// AUTHENTICATE TOKEN
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
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

// ADMIN ONLY
const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            message: "User not authenticated"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    next();
};

export { authenticateToken, adminOnly };
