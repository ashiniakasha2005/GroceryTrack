import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByIdentifier } from '../models/userModel';

export async function login(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
  return res.status(400).json({ message: 'Email/username and password required' });
}

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

   const signOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    } as any;

    const token = jwt.sign(
  { userId: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET as string,
  signOptions
);

    return res.status(200).json({
  message: 'Login successful',
  token,
  user: { id: user.id, email: user.email, role: user.role },
});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}