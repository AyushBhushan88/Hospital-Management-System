import { Request, Response } from 'express';
import { PrismaClient, InvoiceStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { patientId, items, totalAmount } = req.body;
    const { userId } = (req as any).user;

    const staff = await prisma.staff.findUnique({ where: { userId } });
    if (!staff) return res.status(403).json({ message: 'Staff record not found' });

    const invoice = await prisma.invoice.create({
      data: {
        patientId,
        createdById: staff.id,
        totalAmount,
        balanceAmount: totalAmount,
        items
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create Invoice Error:', error);
    res.status(500).json({ message: 'Error creating invoice', error });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        patient: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: {
          select: { firstName: true, lastName: true, contactNo: true, address: true }
        },
        payments: true,
        createdBy: {
          select: { firstName: true, lastName: true }
        }
      }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice', error });
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId, patientId, amount, paymentMethod, transactionId } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          patientId,
          amount,
          paymentMethod: paymentMethod as PaymentMethod,
          transactionId
        }
      });

      // 2. Update Invoice
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new Error('Invoice not found');

      const newPaidAmount = invoice.paidAmount + amount;
      const newBalanceAmount = invoice.totalAmount - newPaidAmount;
      let status: InvoiceStatus = 'PARTIALLY_PAID';
      
      if (newBalanceAmount <= 0) {
        status = 'PAID';
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          status
        }
      });

      return payment;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Record Payment Error:', error);
    res.status(500).json({ message: error.message || 'Error recording payment' });
  }
};
