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

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    // 1. Total Revenue (Sum of all payments)
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    // 2. Pending Payments (Sum of all invoice balance amounts)
    const pendingPayments = await prisma.invoice.aggregate({
      _sum: { balanceAmount: true }
    });

    // 3. Department-wise Revenue Breakdown
    // We'll calculate this by iterating through invoice items
    const allInvoices = await prisma.invoice.findMany({
      select: { items: true, status: true, totalAmount: true, paidAmount: true }
    });

    const breakdown: Record<string, number> = {
      'Consultation': 0,
      'Laboratory': 0,
      'Pharmacy': 0,
      'IPD/Wards': 0,
      'Other': 0
    };

    allInvoices.forEach(inv => {
      const items = inv.items as any[];
      if (Array.isArray(items)) {
        items.forEach(item => {
          const desc = item.description.toLowerCase();
          if (desc.includes('consultation')) breakdown['Consultation'] += item.amount;
          else if (desc.includes('lab')) breakdown['Laboratory'] += item.amount;
          else if (desc.includes('medicine')) breakdown['Pharmacy'] += item.amount;
          else if (desc.includes('ward') || desc.includes('admission')) breakdown['IPD/Wards'] += item.amount;
          else breakdown['Other'] += item.amount;
        });
      }
    });

    // 4. Daily Trends (Last 7 days revenue)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dailyRevenue = await prisma.payment.aggregate({
        where: {
          createdAt: { gte: date, lt: nextDate }
        },
        _sum: { amount: true }
      });

      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dailyRevenue._sum.amount || 0
      });
    }

    res.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingPayments: pendingPayments._sum.balanceAmount || 0,
      breakdown,
      last7Days
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error });
  }
};
