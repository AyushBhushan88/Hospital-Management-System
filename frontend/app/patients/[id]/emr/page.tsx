'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Consultation {
  id: string;
  bloodPressure: string;
  temperature: string;
  pulse: string;
  weight: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  createdAt: string;
  doctor: { firstName: string; lastName: string; specialization: string };
  prescription: { medicines: any[] } | null;
  appointment: { appointmentDate: string; reason: string };
}

export default function PatientEMR() {
  const { id } = useParams();
  const [history, setHistory] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/consultations/patient/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setHistory(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Electronic Medical Record (EMR)</h1>
      </div>

      {loading ? (
        <div className="py-20 text-center">Loading medical history...</div>
      ) : history.length === 0 ? (
        <div className="py-20 text-center bg-white border border-dashed border-gray-300 rounded-xl text-gray-500">
          No clinical history found for this patient.
        </div>
      ) : (
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-8">
          {history.map((con) => (
            <div key={con.id} className="relative pl-8">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white"></div>
              
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-gray-900">
                      {new Date(con.createdAt).toLocaleDateString()}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-xs text-gray-500">Dr. {con.doctor.firstName} {con.doctor.lastName} ({con.doctor.specialization})</span>
                  </div>
                  <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-1 rounded">OPD Visit</span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Vitals & Notes */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">BP</p>
                        <p className="text-sm font-bold">{con.bloodPressure || '--'}</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Temp</p>
                        <p className="text-sm font-bold">{con.temperature || '--'}°C</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Pulse</p>
                        <p className="text-sm font-bold">{con.pulse || '--'}</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Weight</p>
                        <p className="text-sm font-bold">{con.weight || '--'}kg</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assessment</p>
                      <div>
                        <p className="text-xs font-bold text-gray-700">Symptoms</p>
                        <p className="text-sm text-gray-600">{con.symptoms}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">Diagnosis</p>
                        <p className="text-sm text-gray-900 font-medium italic">"{con.diagnosis}"</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Prescription */}
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">Prescription</p>
                    {con.prescription ? (
                      <ul className="space-y-3">
                        {(con.prescription.medicines as any[]).map((med, i) => (
                          <li key={i} className="text-sm border-b border-blue-100 pb-2 last:border-0">
                            <p className="font-bold text-blue-900">{med.name}</p>
                            <p className="text-xs text-blue-700">{med.dosage} • {med.frequency}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No medication prescribed.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
