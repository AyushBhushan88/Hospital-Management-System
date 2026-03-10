/**
 * Notification System Utility (Mocked)
 * In a production app, this would integrate with Twilio (SMS) and Nodemailer/SendGrid (Email)
 */

type NotificationType = 'EMAIL' | 'SMS';
type EventType = 'APPOINTMENT_BOOKED' | 'LAB_RESULT_READY' | 'INVOICE_GENERATED' | 'PAYMENT_RECEIVED';

interface NotificationPayload {
  to: string;
  patientName: string;
  eventType: EventType;
  details: string;
}

export const sendNotification = async (payload: NotificationPayload) => {
  const { to, patientName, eventType, details } = payload;
  
  // Simulated delay
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('-------------------------------------------');
  console.log(`[NOTIFICATION SENT]`);
  console.log(`To: ${to}`);
  console.log(`For Patient: ${patientName}`);
  console.log(`Event: ${eventType.replace('_', ' ')}`);
  console.log(`Message: ${details}`);
  console.log('-------------------------------------------');

  return { success: true, timestamp: new Date() };
};

// Helper methods for specific notifications
export const notifyAppointment = (to: string, patientName: string, date: string, doctorName: string) => {
  return sendNotification({
    to,
    patientName,
    eventType: 'APPOINTMENT_BOOKED',
    details: `Your appointment with Dr. ${doctorName} is confirmed for ${date}.`
  });
};

export const notifyLabResult = (to: string, patientName: string, testName: string) => {
  return sendNotification({
    to,
    patientName,
    eventType: 'LAB_RESULT_READY',
    details: `Your lab result for ${testName} is now ready. Please check your portal.`
  });
};

export const notifyInvoice = (to: string, patientName: string, amount: number) => {
  return sendNotification({
    to,
    patientName,
    eventType: 'INVOICE_GENERATED',
    details: `A new invoice of $${amount.toFixed(2)} has been generated for your recent visit.`
  });
};
