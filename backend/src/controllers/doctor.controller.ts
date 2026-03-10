import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

export const addDoctor = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      specialization, 
      contactNo, 
      address 
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });

    const hashedPassword = await hashPassword(password);

    // Create User and Staff (Doctor) in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'DOCTOR',
        }
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          specialization,
          contactNo,
          address,
        }
      });

      return { user, staff };
    });

    res.status(201).json({ 
      message: 'Doctor added successfully', 
      doctor: result.staff 
    });
  } catch (error) {
    console.error('Add Doctor Error:', error);
    res.status(500).json({ message: 'Error adding doctor', error });
  }
};

export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.staff.findMany({
      where: {
        user: {
          role: 'DOCTOR'
        }
      },
      include: {
        user: {
          select: { email: true, role: true }
        }
      },
      orderBy: { firstName: 'asc' }
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error });
  }
};
