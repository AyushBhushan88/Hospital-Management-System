import { Request, Response } from 'express';
import { PrismaClient, LabRequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const requestTest = async (req: Request, res: Response) => {
  try {
    const { patientId, testTypeId, notes } = req.body;
    const { userId } = (req as any).user;

    const doctor = await prisma.staff.findUnique({ where: { userId } });
    if (!doctor) return res.status(403).json({ message: 'Doctor record not found' });

    const request = await prisma.labRequest.create({
      data: {
        patientId,
        testTypeId,
        requestingDoctorId: doctor.id,
        notes
      }
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error requesting test', error });
  }
};

export const updateLabStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.labRequest.update({
      where: { id },
      data: { status: status as LabRequestStatus }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lab status', error });
  }
};

export const reportResult = async (req: Request, res: Response) => {
  try {
    const { labRequestId, resultData, attachments } = req.body;
    const { userId } = (req as any).user;

    const tech = await prisma.staff.findUnique({ where: { userId } });
    if (!tech) return res.status(403).json({ message: 'Technician record not found' });

    const result = await prisma.$transaction(async (tx) => {
      const newResult = await tx.labResult.create({
        data: {
          labRequestId,
          technicianId: tech.id,
          resultData,
          attachments
        }
      });

      await tx.labRequest.update({
        where: { id: labRequestId },
        data: { status: 'RESULT_REPORTED' }
      });

      return newResult;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error reporting result', error });
  }
};

export const getPendingTests = async (req: Request, res: Response) => {
  try {
    const tests = await prisma.labRequest.findMany({
      where: { status: { in: ['PENDING', 'SAMPLE_COLLECTED'] } },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true } },
        testType: true
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tests', error });
  }
};
