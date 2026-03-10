'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Medicine {
  id: string;
  name: string;
  brandName: string;
  category: string;
  dosageForm: string;
  unitPrice: number;
  stock: number;
  expiryDate: string;
}

export default function PharmacyInventory() {
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', brandName: '', category: '', dosageForm: 'Tablet', unitPrice: 0, stock: 0, expiryDate: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/pharmacy/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setInventory(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/pharmacy/medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, unitPrice: Number(formData.unitPrice), stock: Number(formData.stock), expiryDate: new Date(formData.expiryDate) })
      });
      if (res.ok) {
        setShowAdd(false);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Inventory</h1>
          <p className="text-gray-500 text-sm">Manage medicine stock and pricing.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : '+ Add Medicine'}</Button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 bg-white border border-primary/20 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Input label="Medicine Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Brand" value={formData.brandName} onChange={e => setFormData({...formData, brandName: e.target.value})} />
          <Input label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Antibiotic" />
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Form</label>
            <select className="h-10 border border-gray-300 rounded-lg px-3 text-sm" value={formData.dosageForm} onChange={e => setFormData({...formData, dosageForm: e.target.value})}>
              <option>Tablet</option><option>Syrup</option><option>Injection</option><option>Ointment</option>
            </select>
          </div>
          <Input label="Price" type="number" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} required />
          <Input label="Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} required />
          <Input label="Expiry" type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
          <Button type="submit">Save to Inventory</Button>
        </form>
      )}

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <div className="text-center py-10">Loading inventory...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b">
              <tr>
                <th className="px-6 py-3">Medicine Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3">Expiry Date</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.brandName || '--'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${item.stock < 50 ? 'text-red-600' : 'text-gray-900'}`}>{item.stock}</span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.stock === 0 ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">OUT OF STOCK</span>
                    ) : item.stock < 50 ? (
                      <span className="text-[10px] font-bold text-orange-600 bg-yellow-50 px-2 py-1 rounded">LOW STOCK</span>
                    ) : (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">AVAILABLE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
