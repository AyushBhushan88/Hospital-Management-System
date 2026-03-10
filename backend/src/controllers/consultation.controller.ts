import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createConsultation = async (req: Request, res: Response) => {
  try {
    const { 
      appointmentId, 
      patientId, 
      doctorId, 
      vitals, 
      symptoms, 
      diagnosis, 
      notes, 
      medicines 
    } = req.body;

    const consultation = await prisma.$transaction(async (tx) => {
      // 1. Create Consultation
      const con = await tx.consultation.create({
        data: {
          appointmentId,
          patientId,
          doctorId,
          bloodPressure: vitals.bloodPressure,
          temperature: vitals.temperature,
          pulse: vitals.pulse,
          weight: vitals.weight,
          symptoms,
          diagnosis,
          notes
        }
      });

      // 2. Create Prescription if medicines provided
      if (medicines && medicines.length > 0) {
        await tx.prescription.create({
          data: {
            consultationId: con.id,
            medicines: medicines
          }
        });
      }

      // 3. Mark Appointment as COMPLETED
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' }
      });

      return con;
    });

    res.status(201).json({ message: 'Consultation recorded successfully', consultation });
  } catch (error) {
    console.error('Create Consultation Error:', error);
    res.status(500).json({ message: 'Error recording consultation', error });
  }
};

export const getPatientHistory = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    
    const history = await prisma.consultation.findMany({
      where: { patientId },
      include: {
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
        prescription: true,
        appointment: { select: { appointmentDate: true, reason: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error });
  }
};

export const getConsultationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        prescription: true
      }
    });
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching consultation', error });
  }
};
