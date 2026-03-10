'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function RecordConsultation() {
  const { appointmentId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);

  const [vitals, setVitals] = useState({ bloodPressure: '', temperature: '', pulse: '', weight: '' });
  const [clinical, setClinical] = useState({ symptoms: '', diagnosis: '', notes: '' });
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMed, setNewMed] = useState<Medicine>({ name: '', dosage: '', frequency: '', duration: '' });

  useEffect(() => {
    // In a real app, fetch appointment details to get patientId/doctorId
    const fetchAppointment = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const apps = await res.json();
        const found = apps.find((a: any) => a.id === appointmentId);
        setAppointment(found);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const addMedicine = () => {
    if (newMed.name) {
      setMedicines([...medicines, newMed]);
      setNewMed({ name: '', dosage: '', frequency: '', duration: '' });
    }
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/consultations/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          vitals,
          symptoms: clinical.symptoms,
          diagnosis: clinical.diagnosis,
          notes: clinical.notes,
          medicines
        }),
      });

      if (response.ok) {
        router.push('/appointments');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return <div className="p-8">Loading appointment details...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinical Consultation</h1>
          <p className="text-gray-500 text-sm">Patient: {appointment.patient.firstName} {appointment.patient.lastName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vitals Section */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <span className="mr-2">🩺</span> Vitals Tracking
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="BP (mmHg)" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} placeholder="120/80" />
            <Input label="Temp (°C)" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} placeholder="36.5" />
            <Input label="Pulse (bpm)" value={vitals.pulse} onChange={e => setVitals({...vitals, pulse: e.target.value})} placeholder="72" />
            <Input label="Weight (kg)" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} placeholder="70" />
          </div>
        </div>

        {/* Clinical Notes Section */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <span className="mr-2">📝</span> Clinical Assessment
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Symptoms</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={clinical.symptoms}
                onChange={e => setClinical({...clinical, symptoms: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Diagnosis</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={clinical.diagnosis}
                onChange={e => setClinical({...clinical, diagnosis: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        {/* Prescription Section */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <span className="mr-2">💊</span> Prescription Builder
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-50 p-4 rounded-lg">
            <div className="md:col-span-2">
              <Input label="Medicine Name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
            </div>
            <Input label="Dosage" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} placeholder="500mg" />
            <Input label="Frequency" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} placeholder="1-0-1" />
            <Button type="button" onClick={addMedicine} variant="outline" className="h-10">Add</Button>
          </div>

          {medicines.length > 0 && (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-2">Medicine</th>
                    <th className="px-4 py-2">Dosage</th>
                    <th className="px-4 py-2">Frequency</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {medicines.map((med, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 font-bold">{med.name}</td>
                      <td className="px-4 py-2">{med.dosage}</td>
                      <td className="px-4 py-2">{med.frequency}</td>
                      <td className="px-4 py-2 text-right">
                        <button type="button" onClick={() => removeMedicine(i)} className="text-red-500 hover:text-red-700">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" isLoading={loading} className="px-12">
            Finalize Consultation & Prescription
          </Button>
        </div>
      </form>
    </div>
  );
}
