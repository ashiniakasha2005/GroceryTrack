import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByIdentifier } from "../models/userModel";
import { tokenBlacklist } from "../middleware/authMiddleware";

// LOGIN (email OR username)
export async function login(req: Request, res: Response) {
    try {
        // "identifier" is preferred; "email" is also accepted for the new frontend/API clients
        const identifier = req.body.identifier ?? req.body.email;
        const { password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: "Email/username and password required" });
        }

        const user = await findUserByIdentifier(identifier);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: "JWT_SECRET is not configured" });
        }

        const signOptions = {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        } as any;

        // Payload shape must match UserPayload in authMiddleware.ts
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            jwtSecret,
            signOptions
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

// LOGOUT
export const logout = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (token) {
            tokenBlacklist.add(token);
        }

        return res.status(200).json({
            message: "Logout successful. Token invalidated successfully."
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error during logout" });
    }
};
