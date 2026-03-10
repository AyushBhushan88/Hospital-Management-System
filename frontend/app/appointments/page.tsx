'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Appointment {
  id: string;
  appointmentDate: string;
  reason: string;
  status: string;
  tokenNumber: number;
  patient: { firstName: string; lastName: string; contactNo: string };
  doctor: { firstName: string; lastName: string; specialization: string };
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setAppointments(appointments.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage patient schedules and status.</p>
        </div>
        <Link href="/appointments/book">
          <Button>+ Book Appointment</Button>
        </Link>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
              {error}
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No appointments scheduled.
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-bold">Token</th>
                  <th className="px-6 py-3 font-bold">Patient</th>
                  <th className="px-6 py-3 font-bold">Doctor</th>
                  <th className="px-6 py-3 font-bold">Date & Time</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((app) => (
                  <tr key={app.id} className="bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-primary">#{app.tokenNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{app.patient.firstName} {app.patient.lastName}</div>
                      <div className="text-xs text-gray-400">{app.patient.contactNo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 text-xs">Dr. {app.doctor.firstName} {app.doctor.lastName}</div>
                      <div className="text-[10px] text-gray-400">{app.doctor.specialization}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(app.appointmentDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {app.status === 'SCHEDULED' && (
                        <>
                          <Link 
                            href={`/consultations/record/${app.id}`}
                            className="text-primary hover:text-blue-800 text-xs font-bold mr-2"
                          >
                            Record Clinical
                          </Link>
                          <button 
                            onClick={() => updateStatus(app.id, 'COMPLETED')}
                            className="text-green-600 hover:text-green-800 text-xs font-bold"
                          >
                            Complete
                          </button>
                          <button 
                            onClick={() => updateStatus(app.id, 'CANCELLED')}
                            className="text-red-600 hover:text-red-800 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
