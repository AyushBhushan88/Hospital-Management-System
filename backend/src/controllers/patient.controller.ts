import { Request, Response } from 'express';
import { PrismaClient, Gender } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      dob, 
      gender, 
      contactNo, 
      address, 
      bloodGroup 
    } = req.body;

    // Check if user already exists
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });
    }

    let userId = null;

    // Create a user account for the patient if email/password provided
    if (email && password) {
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'PATIENT',
        }
      });
      userId = user.id;
    }

    // Create the patient record
    const patient = await prisma.patient.create({
      data: {
        userId,
        firstName,
        lastName,
        dob: new Date(dob),
        gender: gender as Gender,
        contactNo,
        address,
        bloodGroup,
      }
    });

    res.status(201).json({ 
      message: 'Patient registered successfully', 
      patient 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Error registering patient', error });
  }
};

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: { email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error });
  }
};
