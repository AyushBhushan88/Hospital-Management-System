import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const prisma = new PrismaClient();

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

/**
 * Automatically creates an invoice for a patient.
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

/**
 * Generates a PDF receipt for an invoice.
 */
export const generateReceiptPDF = async (invoice: any) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const fontSize = 12;

  // Header
  page.drawText('HOSPITAL MANAGEMENT SYSTEM', { x: 50, y: height - 50, size: 20, font: boldFont, color: rgb(0, 0, 0.5) });
  page.drawText('Official Payment Receipt', { x: 50, y: height - 80, size: 14, font });
  
  // Invoice Info
  page.drawText(`Invoice ID: ${invoice.id}`, { x: 50, y: height - 120, size: fontSize, font });
  page.drawText(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { x: 400, y: height - 120, size: fontSize, font });
  
  // Patient Info
  page.drawText('BILL TO:', { x: 50, y: height - 160, size: 10, font: boldFont });
  page.drawText(`${invoice.patient.firstName} ${invoice.patient.lastName}`, { x: 50, y: height - 175, size: 14, font: boldFont });
  page.drawText(`Phone: ${invoice.patient.contactNo || 'N/A'}`, { x: 50, y: height - 195, size: 10, font });

  // Items Table Header
  let yPos = height - 240;
  page.drawRectangle({ x: 50, y: yPos - 5, width: 500, height: 25, color: rgb(0.95, 0.95, 0.95) });
  page.drawText('Description', { x: 60, y: yPos, size: 10, font: boldFont });
  page.drawText('Qty', { x: 300, y: yPos, size: 10, font: boldFont });
  page.drawText('Unit Price', { x: 380, y: yPos, size: 10, font: boldFont });
  page.drawText('Amount', { x: 480, y: yPos, size: 10, font: boldFont });

  // Items
  yPos -= 30;
  invoice.items.forEach((item: any) => {
    page.drawText(item.description, { x: 60, y: yPos, size: 10, font });
    page.drawText(item.quantity.toString(), { x: 300, y: yPos, size: 10, font });
    page.drawText(`$${item.unitPrice.toFixed(2)}`, { x: 380, y: yPos, size: 10, font });
    page.drawText(`$${item.amount.toFixed(2)}`, { x: 480, y: yPos, size: 10, font });
    yPos -= 20;
  });

  // Totals
  yPos -= 20;
  page.drawLine({ start: { x: 50, y: yPos }, end: { x: 550, y: yPos }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  
  yPos -= 30;
  page.drawText('TOTAL AMOUNT:', { x: 350, y: yPos, size: 12, font: boldFont });
  page.drawText(`$${invoice.totalAmount.toFixed(2)}`, { x: 480, y: yPos, size: 12, font: boldFont });
  
  yPos -= 20;
  page.drawText('TOTAL PAID:', { x: 350, y: yPos, size: 10, font });
  page.drawText(`$${invoice.paidAmount.toFixed(2)}`, { x: 480, y: yPos, size: 10, font, color: rgb(0, 0.5, 0) });
  
  yPos -= 20;
  page.drawText('BALANCE DUE:', { x: 350, y: yPos, size: 12, font: boldFont });
  page.drawText(`$${invoice.balanceAmount.toFixed(2)}`, { x: 480, y: yPos, size: 12, font: boldFont, color: rgb(0.7, 0, 0) });

  // Footer
  page.drawText('Thank you for choosing our hospital.', { x: width / 2 - 100, y: 50, size: 10, font });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
