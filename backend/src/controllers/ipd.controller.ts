import { Request, Response } from 'express';
import { PrismaClient, BedStatus } from '@prisma/client';

const prisma = new PrismaClient();

// --- Ward & Bed Management ---

export const createWard = async (req: Request, res: Response) => {
  try {
    const { name, type, pricePerDay, bedCount } = req.body;
    
    const ward = await prisma.$transaction(async (tx) => {
      const newWard = await tx.ward.create({
        data: { name, type, pricePerDay }
      });

      // Automatically create beds for the ward
      const bedsData = Array.from({ length: bedCount }).map((_, i) => ({
        bedNumber: `${name}-${i + 1}`,
        wardId: newWard.id,
        status: 'AVAILABLE' as BedStatus
      }));

      await tx.bed.createMany({ data: bedsData });
      return newWard;
    });

    res.status(201).json(ward);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ward', error });
  }
};

export const getAllWards = async (req: Request, res: Response) => {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        _count: { select: { beds: true } },
        beds: {
          include: { admission: { include: { patient: true } } }
        }
      }
    });
    res.json(wards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wards', error });
  }
};

// --- Admission & Discharge ---

export const admitPatient = async (req: Request, res: Response) => {
  try {
    const { patientId, bedId, admittingDoctorId, reason } = req.body;

    const admission = await prisma.$transaction(async (tx) => {
      // 1. Check if bed is available
      const bed = await tx.bed.findUnique({ where: { id: bedId } });
      if (bed?.status !== 'AVAILABLE') throw new Error('Bed is not available');

      // 2. Create Admission
      const newAdmission = await tx.admission.create({
        data: { patientId, bedId, admittingDoctorId, reason }
      });

      // 3. Update Bed Status
      await tx.bed.update({
        where: { id: bedId },
        data: { status: 'OCCUPIED' }
      });

      return newAdmission;
    });

    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Error admitting patient', error: (error as any).message });
  }
};

export const dischargePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.admission.findUnique({ where: { id } });
      if (!current) throw new Error('Admission record not found');
      if (current.status === 'DISCHARGED') throw new Error('Patient already discharged');

      const updated = await tx.admission.update({
        where: { id },
        data: { status: 'DISCHARGED', dischargeDate: new Date() }
      });

      await tx.bed.update({
        where: { id: current.bedId },
        data: { status: 'AVAILABLE' }
      });

      return updated;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: (error as any).message || 'Error discharging patient' });
  }
};

// --- Nursing Logs ---

export const createNursingLog = async (req: Request, res: Response) => {
  try {
    const { admissionId, vitals, notes } = req.body;
    const { userId } = (req as any).user;

    const staff = await prisma.staff.findUnique({ where: { userId } });
    if (!staff) return res.status(403).json({ message: 'Nurse record not found' });

    const log = await prisma.nursingLog.create({
      data: {
        admissionId,
        nurseId: staff.id,
        bloodPressure: vitals.bloodPressure,
        temperature: vitals.temperature,
        pulse: vitals.pulse,
        spo2: vitals.spo2,
        notes
      }
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error recording nursing log', error });
  }
};

export const getAdmissionDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const admission = await prisma.admission.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        bed: { include: { ward: true } },
        nursingLogs: {
          include: { nurse: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admission details', error });
  }
};
