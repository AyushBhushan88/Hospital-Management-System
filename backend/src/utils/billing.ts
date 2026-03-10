import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

/**
 * Automatically creates an invoice for a patient.
 * @param patientId ID of the patient
 * @param createdById ID of the staff member triggering the invoice
 * @param items List of invoice items
 * @param totalAmount Total amount for the invoice
 * @param tx Optional transaction client
 */
export const generateAutoInvoice = async (
  patientId: string,
  createdById: string,
  items: InvoiceItem[],
  totalAmount: number,
  tx?: any
) => {
  const client = tx || prisma;
  
  return await client.invoice.create({
    data: {
      patientId,
      createdById,
      totalAmount,
      balanceAmount: totalAmount,
      items
    }
  });
};
