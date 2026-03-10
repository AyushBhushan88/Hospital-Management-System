import { Request, Response } from 'express';
import { PrismaClient, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, appointmentDate, reason } = req.body;

    // Optional: Auto-generate token number for the day
    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await prisma.appointment.count({
      where: {
        doctorId,
        appointmentDate: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        reason,
        tokenNumber: count + 1,
      },
    });

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment', error });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { role, userId } = (req as any).user;
    let where: any = {};

    // Filter appointments based on user role
    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      where = { patientId: patient?.id };
    } else if (role === 'DOCTOR') {
      const staff = await prisma.staff.findUnique({ where: { userId } });
      where = { doctorId: staff?.id };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { firstName: true, lastName: true, contactNo: true } },
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
      },
      orderBy: { appointmentDate: 'desc' },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: status as AppointmentStatus },
    });

    res.json({ message: 'Status updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error });
  }
};
