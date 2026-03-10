import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addMedicine = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const medicine = await prisma.medicine.create({ data });
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Error adding medicine', error });
  }
};

export const getInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.medicine.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error });
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const { patientId, items, totalAmount } = req.body;
    const { userId } = (req as any).user;

    const pharmacist = await prisma.staff.findUnique({ where: { userId } });
    if (!pharmacist) return res.status(403).json({ message: 'Pharmacist record not found' });

    const sale = await prisma.$transaction(async (tx) => {
      // 1. Create Sale record
      const newSale = await tx.pharmacySale.create({
        data: {
          patientId,
          pharmacistId: pharmacist.id,
          totalAmount,
          items
        }
      });

      // 2. Update Stock for each item
      for (const item of items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return newSale;
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Error creating sale', error });
  }
};
