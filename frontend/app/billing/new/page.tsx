'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Patient { id: string; firstName: string; lastName: string; }

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [patientId, setPatientId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0 }
  ]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'description') {
      item.description = value;
    } else if (field === 'quantity') {
      item.quantity = parseInt(value) || 0;
      item.amount = item.quantity * item.unitPrice;
    } else if (field === 'unitPrice') {
      item.unitPrice = parseFloat(value) || 0;
      item.amount = item.quantity * item.unitPrice;
    }
    
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return alert('Please select a patient');
    if (items.some(item => !item.description || item.amount <= 0)) {
      return alert('Please fill all item details correctly');
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          patientId,
          items,
          totalAmount
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/billing/${data.id}`);
      } else {
        const data = await response.json();
        alert(data.message || 'Error creating invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
          <select
            required
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Select Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="text-blue-600 font-medium hover:underline"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end border-b border-gray-50 pb-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Consultation Fee"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Qty</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Unit Price</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={`$${item.amount.toFixed(2)}`}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-500 font-medium"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
