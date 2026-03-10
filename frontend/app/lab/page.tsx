'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface LabRequest {
  id: string;
  patient: { firstName: string; lastName: string };
  doctor: { firstName: string; lastName: string };
  testType: { name: string; category: string; normalRange: string };
  status: 'PENDING' | 'SAMPLE_COLLECTED' | 'RESULT_REPORTED';
  createdAt: string;
}

export default function LabConsole() {
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportingId, setReportingId] = useState<string | null>(null);
  
  const [resultData, setResultData] = useState({ value: '', unit: '', observation: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/lab/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setRequests(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/lab/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/lab/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ labRequestId: reportingId, resultData })
      });
      if (res.ok) {
        setReportingId(null);
        setResultData({ value: '', unit: '', observation: '' });
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laboratory Console</h1>
        <p className="text-gray-500 text-sm">Manage diagnostic requests and reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Pending Requests</h2>
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center bg-white border border-gray-200 rounded-xl text-gray-400">No pending tests.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-bold text-gray-900">{req.testType.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-full">{req.testType.category}</span>
                    </div>
                    <p className="text-xs text-gray-500">Patient: <span className="font-bold text-gray-700">{req.patient.firstName} {req.patient.lastName}</span></p>
                    <p className="text-[10px] text-gray-400">Requested by Dr. {req.doctor.firstName} on {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {req.status === 'PENDING' && (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(req.id, 'SAMPLE_COLLECTED')} className="text-xs">Collect Sample</Button>
                    )}
                    {req.status === 'SAMPLE_COLLECTED' && (
                      <Button size="sm" onClick={() => setReportingId(req.id)} className="text-xs">Enter Results</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Result Entry Sidebar */}
        <div className="lg:col-span-1">
          {reportingId ? (
            <div className="p-6 bg-white border-2 border-primary rounded-xl shadow-lg sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Report Result</h2>
              <form onSubmit={handleReport} className="space-y-4">
                <Input label="Value" value={resultData.value} onChange={e => setResultData({...resultData, value: e.target.value})} placeholder="e.g. 140" required />
                <Input label="Unit" value={resultData.unit} onChange={e => setResultData({...resultData, unit: e.target.value})} placeholder="e.g. mg/dL" required />
                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Observation</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={resultData.observation}
                    onChange={e => setResultData({...resultData, observation: e.target.value})}
                    placeholder="Normal findings..."
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button type="submit" className="flex-1">Submit Report</Button>
                  <Button type="button" variant="outline" onClick={() => setReportingId(null)}>Cancel</Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-gray-400 py-20">
              Select a test from the queue to enter results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
