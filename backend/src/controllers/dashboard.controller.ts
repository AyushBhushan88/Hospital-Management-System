import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { role, userId } = (req as any).user;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Basic counts for everyone
    const totalPatients = await prisma.patient.count();
    const totalDoctors = await prisma.staff.count({
      where: { user: { role: 'DOCTOR' } }
    });

    // Role-specific appointment counts
    let todayAppointmentsWhere: any = {
      appointmentDate: {
        gte: today,
        lt: tomorrow
      }
    };

    if (role === 'DOCTOR') {
      const staff = await prisma.staff.findUnique({ where: { userId } });
      todayAppointmentsWhere.doctorId = staff?.id;
    } else if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      todayAppointmentsWhere.patientId = patient?.id;
    }

    const todayAppointments = await prisma.appointment.count({
      where: todayAppointmentsWhere
    });

    const pendingAppointments = await prisma.appointment.count({
      where: { ...todayAppointmentsWhere, status: 'SCHEDULED' }
    });

    res.json({
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};
