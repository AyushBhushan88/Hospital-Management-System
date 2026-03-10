'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  contactNo: string;
  bloodGroup?: string;
  createdAt: string;
  user?: {
    email: string;
  };
}

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const data = await response.json();
      setPatients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contactNo.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Patient Directory</h1>
          <p className="text-gray-500">Manage and view all registered patients.</p>
        </div>
        <Link href="/patients/register">
          <Button>+ Register Patient</Button>
        </Link>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg max-w-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
          <span className="mr-2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or contact number..."
            className="w-full text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
              {error}. (Ensure backend is running and you are logged in)
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No patients found.
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-bold">Patient Name</th>
                  <th className="px-6 py-3 font-bold">Gender / Age</th>
                  <th className="px-6 py-3 font-bold">Contact</th>
                  <th className="px-6 py-3 font-bold">Blood Group</th>
                  <th className="px-6 py-3 font-bold">Registration Date</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => {
                  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
                  return (
                    <tr key={patient.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{patient.firstName} {patient.lastName}</div>
                        <div className="text-xs text-gray-400">{patient.user?.email || 'No portal access'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">{patient.gender.toLowerCase()}</span> • {age} yrs
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {patient.contactNo}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${patient.bloodGroup ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                          {patient.bloodGroup || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link href={`/patients/${patient.id}/emr`} className="font-bold text-primary hover:underline mr-3">EMR</Link>
                        <button className="font-medium text-gray-400 hover:text-gray-600">View History</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
