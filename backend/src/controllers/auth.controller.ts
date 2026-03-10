import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken, hashPassword, comparePassword, verifyGoogleToken } from '../utils/auth';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'PATIENT',
      }
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token: googleToken } = req.body;
    const payload = await verifyGoogleToken(googleToken);

    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google Token' });
    }

    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      // Create a new patient user if they don't exist
      user = await prisma.user.create({
        data: {
          email: payload.email,
          password: 'google_oauth_user', // Placeholder, as they'll use OAuth
          role: 'PATIENT',
        }
      });

      // Also create an initial patient record
      await prisma.patient.create({
        data: {
          userId: user.id,
          firstName: payload.given_name || 'Google',
          lastName: payload.family_name || 'User',
          dob: new Date('2000-01-01'), // Placeholder
          gender: 'OTHER',
          contactNo: 'N/A',
        }
      });
    }

    const token = generateToken(user.id, user.role);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Error with Google authentication' });
  }
};
