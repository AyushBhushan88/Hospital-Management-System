import { Request, Response } from 'express';
import { PrismaClient, Gender } from '@prisma/client';
import { hashPassword } from '../utils/auth';
import { generateAutoInvoice } from '../utils/billing';

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

    const { userId: staffUserId } = (req as any).user;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) return res.status(403).json({ message: 'Staff record not found' });

    // Check if user already exists
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });
    }

    const result = await prisma.$transaction(async (tx) => {
      let userId = null;

      // Create a user account for the patient if email/password provided
      if (email && password) {
        const hashedPassword = await hashPassword(password);
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: 'PATIENT',
          }
        });
        userId = user.id;
      }

      // Create the patient record
      const patient = await tx.patient.create({
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

      // Automatically generate invoice for Registration Fee
      const REGISTRATION_FEE = 50;
      await generateAutoInvoice(
        patient.id,
        staff.id,
        [{
          description: 'Patient Registration Fee',
          quantity: 1,
          unitPrice: REGISTRATION_FEE,
          amount: REGISTRATION_FEE
        }],
        REGISTRATION_FEE,
        tx
      );

      return patient;
    });

    res.status(201).json({ 
      message: 'Patient registered successfully', 
      patient: result 
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
