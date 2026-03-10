import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateAutoInvoice } from '../utils/billing';

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

      // 3. Automatically generate invoice for the pharmacy sale
      if (patientId) {
        // Need to fetch medicine names for better invoice descriptions
        const medicineIds = items.map((i: any) => i.medicineId);
        const medicines = await tx.medicine.findMany({
          where: { id: { in: medicineIds } }
        });

        const invoiceItems = items.map((item: any) => {
          const medicine = medicines.find(m => m.id === item.medicineId);
          return {
            description: `Medicine: ${medicine?.name || 'Unknown'}`,
            quantity: item.quantity,
            unitPrice: item.price,
            amount: item.quantity * item.price
          };
        });

        await generateAutoInvoice(
          patientId,
          pharmacist.id,
          invoiceItems,
          totalAmount,
          tx
        );
      }

      return newSale;
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error('Pharmacy Sale Error:', error);
    res.status(500).json({ message: 'Error creating sale', error });
  }
};
