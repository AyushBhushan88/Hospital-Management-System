'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdmissionDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [admission, setAdmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(false);
  
  const [logData, setLogData] = useState({
    vitals: { bloodPressure: '', temperature: '', pulse: '', spo2: '' },
    notes: ''
  });

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/ipd/admissions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAdmission(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDischarge = async () => {
    if (!confirm('Are you sure you want to discharge this patient?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/ipd/admissions/${id}/discharge`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) router.push('/ipd/wards');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/ipd/nursing-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ admissionId: id, ...logData }),
      });
      if (res.ok) {
        setLogData({ vitals: { bloodPressure: '', temperature: '', pulse: '', spo2: '' }, notes: '' });
        fetchDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading admission details...</div>;
  if (!admission) return <div className="p-8">Admission record not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Admission Details</h1>
          <p className="text-sm text-gray-500">ID: {admission.id}</p>
        </div>
        {admission.status === 'ADMITTED' && (
          <Button variant="danger" onClick={handleDischarge}>Discharge Patient</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient & Bed Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inpatient Status</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">P</div>
              <div>
                <p className="font-bold text-gray-900">{admission.patient.firstName} {admission.patient.lastName}</p>
                <p className="text-xs text-gray-500">{admission.bed.ward.name} • Bed {admission.bed.bedNumber.split('-').pop()}</p>
              </div>
            </div>
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-gray-500">Admitted by: <span className="font-medium text-gray-900">Dr. {admission.doctor.firstName} {admission.doctor.lastName}</span></p>
              <p className="text-xs text-gray-500">Reason: <span className="font-medium text-gray-900">{admission.reason}</span></p>
            </div>
          </div>

          {admission.status === 'ADMITTED' && (
            <form onSubmit={handleAddLog} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Nursing Log</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="BP" value={logData.vitals.bloodPressure} onChange={e => setLogData({...logData, vitals: {...logData.vitals, bloodPressure: e.target.value}})} />
                <Input placeholder="Temp" value={logData.vitals.temperature} onChange={e => setLogData({...logData, vitals: {...logData.vitals, temperature: e.target.value}})} />
                <Input placeholder="Pulse" value={logData.vitals.pulse} onChange={e => setLogData({...logData, vitals: {...logData.vitals, pulse: e.target.value}})} />
                <Input placeholder="SpO2" value={logData.vitals.spo2} onChange={e => setLogData({...logData, vitals: {...logData.vitals, spo2: e.target.value}})} />
              </div>
              <textarea 
                className="w-full text-sm border border-gray-300 rounded-lg p-3 h-20 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Clinical observations..."
                value={logData.notes}
                onChange={e => setLogData({...logData, notes: e.target.value})}
                required
              />
              <Button type="submit" isLoading={logLoading} className="w-full">Record Observations</Button>
            </form>
          )}
        </div>

        {/* Nursing History Timeline */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-gray-800">Nursing Observations & Vitals</h3>
          {admission.nursingLogs.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              No nursing logs recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {admission.nursingLogs.map((log: any) => (
                <div key={log.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="text-xs font-medium text-gray-600">By: Nurse {log.nurse.firstName}</span>
                  </div>
                  <div className="flex space-x-6 text-sm mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400">BP:</span> <span className="font-bold text-gray-900">{log.bloodPressure || '--'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400">Temp:</span> <span className="font-bold text-gray-900">{log.temperature || '--'}°C</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400">Pulse:</span> <span className="font-bold text-gray-900">{log.pulse || '--'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400">SpO2:</span> <span className="font-bold text-gray-900">{log.spo2 || '--'}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-primary">
                    {log.notes}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
