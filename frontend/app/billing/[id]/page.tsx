'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  transactionId: string | null;
  createdAt: string;
}

interface Invoice {
  id: string;
  patientId: string;
  patient: {
    firstName: string;
    lastName: string;
    contactNo: string;
    address: string;
  };
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  items: any[];
  payments: Payment[];
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Payment Form State
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('CASH');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/billing/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setInvoice(data);
      setAmount(data.balanceAmount);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    try {
      const response = await fetch('http://localhost:5000/api/billing/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          invoiceId: id,
          patientId: invoice?.patientId,
          amount,
          paymentMethod: method,
          transactionId
        })
      });

      if (response.ok) {
        alert('Payment recorded successfully!');
        fetchInvoice();
      } else {
        const err = await response.json();
        alert(err.message || 'Error recording payment');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Error recording payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="p-6">Loading invoice details...</div>;
  if (!invoice) return <div className="p-6 text-red-500">Invoice not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Invoice</h1>
          <p className="text-gray-500 text-sm">ID: {invoice.id}</p>
          <p className="text-gray-500 text-sm">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
            invoice.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {invoice.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Patient Information</h2>
          <p className="text-lg font-bold text-gray-800">{invoice.patient.firstName} {invoice.patient.lastName}</p>
          <p className="text-gray-600">{invoice.patient.contactNo}</p>
          <p className="text-gray-600 text-sm mt-2">{invoice.patient.address || 'No address provided'}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Billing Summary</h2>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-bold text-gray-800">${invoice.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Paid Amount</span>
            <span className="font-bold text-green-600">${invoice.paidAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-bold text-gray-800">Balance Due</span>
            <span className="font-bold text-red-600">${invoice.balanceAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Services & Items</h2>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Description</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm text-gray-800">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-800">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Payment History */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Payment History</h2>
          {invoice.payments.length === 0 ? (
            <p className="text-gray-500 italic">No payments recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {invoice.payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div>
                    <p className="font-bold text-gray-800">${p.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()} • {p.paymentMethod}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-400">{p.transactionId || 'CASH_TRX'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Record New Payment */}
        {invoice.status !== 'PAID' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Record New Payment</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  max={invoice.balanceAmount}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="UPI">UPI / Digital Wallet</option>
                  <option value="INSURANCE">Insurance Claim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN12345678"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={paying}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-md disabled:bg-gray-400"
              >
                {paying ? 'Processing...' : `Pay $${amount.toFixed(2)} Now`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
