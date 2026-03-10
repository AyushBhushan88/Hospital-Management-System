'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Patient { id: string; firstName: string; lastName: string; }
interface Doctor { id: string; firstName: string; lastName: string; specialization: string; }

export default function BookAppointment() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [pRes, dRes] = await Promise.all([
        fetch('http://localhost:5000/api/patients', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (pRes.ok) setPatients(await pRes.json());
      if (dRes.ok) setDoctors(await dRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to book appointment');

      setSuccess(true);
      setFormData({ patientId: '', doctorId: '', appointmentDate: '', reason: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Schedule New Appointment</h1>

      <form onSubmit={handleSubmit} className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg">
            Appointment scheduled successfully!
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error} (Ensure you are logged in as Admin or Receptionist)
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Select Patient</label>
            <select 
              name="patientId" 
              value={formData.patientId} 
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Select Doctor</label>
            <select 
              name="doctorId" 
              value={formData.doctorId} 
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <Input 
            label="Appointment Date & Time" 
            name="appointmentDate" 
            type="datetime-local" 
            value={formData.appointmentDate} 
            onChange={handleChange} 
            required 
          />

          <Input 
            label="Reason for Visit" 
            name="reason" 
            value={formData.reason} 
            onChange={handleChange} 
            placeholder="e.g. Regular Checkup" 
          />
        </div>

        <Button type="submit" isLoading={loading} className="w-full">
          Schedule Appointment
        </Button>
      </form>
    </div>
  );
}
