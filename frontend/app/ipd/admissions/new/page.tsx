'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Patient { id: string; firstName: string; lastName: string; }
interface Doctor { id: string; firstName: string; lastName: string; }
interface Bed { id: string; bedNumber: string; ward: { name: string; pricePerDay: number } }

export default function NewAdmission() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableBeds, setAvailableBeds] = useState<Bed[]>([]);

  const [formData, setFormData] = useState({
    patientId: '',
    admittingDoctorId: '',
    bedId: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [pRes, dRes, wRes] = await Promise.all([
        fetch('http://localhost:5000/api/patients', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/ipd/wards', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      
      if (pRes.ok) setPatients(await pRes.json());
      if (dRes.ok) setDoctors(await dRes.json());
      
      if (wRes.ok) {
        const wards = await wRes.json();
        const beds = wards.flatMap((w: any) => 
          w.beds.filter((b: any) => b.status === 'AVAILABLE')
            .map((b: any) => ({ ...b, ward: { name: w.name, pricePerDay: w.pricePerDay } }))
        );
        setAvailableBeds(beds);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ipd/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to admit patient');

      router.push('/ipd/wards');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBed = availableBeds.find(b => b.id === formData.bedId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Patient Admission Form</h1>

      <form onSubmit={handleSubmit} className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Patient</label>
              <select 
                value={formData.patientId}
                onChange={e => setFormData({...formData, patientId: e.target.value})}
                className="flex h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">-- Select Patient --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Admitting Doctor</label>
              <select 
                value={formData.admittingDoctorId}
                onChange={e => setFormData({...formData, admittingDoctorId: e.target.value})}
                className="flex h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Assign Bed</label>
              <select 
                value={formData.bedId}
                onChange={e => setFormData({...formData, bedId: e.target.value})}
                className="flex h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">-- Select Available Bed --</option>
                {availableBeds.map(b => (
                  <option key={b.id} value={b.id}>{b.ward.name} - Bed {b.bedNumber.split('-').pop()} (${b.ward.pricePerDay}/day)</option>
                ))}
              </select>
              {selectedBed && (
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Estimated Charge: ${selectedBed.ward.pricePerDay} per day
                </p>
              )}
            </div>

            <Input 
              label="Reason for Admission" 
              value={formData.reason} 
              onChange={e => setFormData({...formData, reason: e.target.value})}
              placeholder="e.g. Major Surgery, Recovery"
              required 
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" isLoading={loading} className="px-12">
            Confirm Admission
          </Button>
        </div>
      </form>
    </div>
  );
}
