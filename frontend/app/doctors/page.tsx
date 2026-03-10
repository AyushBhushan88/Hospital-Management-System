'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  contactNo: string;
  user: {
    email: string;
  };
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();
      setDoctors(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Doctor Directory</h1>
          <p className="text-gray-500">View and manage hospital medical staff.</p>
        </div>
        <Link href="/doctors/add">
          <Button>+ Add New Doctor</Button>
        </Link>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg max-w-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
          <span className="mr-2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or specialization..."
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
              {error}. (Ensure backend is running and you are an Admin/Staff)
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No doctors found.
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-bold">Doctor Name</th>
                  <th className="px-6 py-3 font-bold">Specialization</th>
                  <th className="px-6 py-3 font-bold">Contact</th>
                  <th className="px-6 py-3 font-bold">Email</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700">
                        {doctor.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {doctor.contactNo}
                    </td>
                    <td className="px-6 py-4">
                      {doctor.user.email}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="font-medium text-primary hover:underline">View Schedule</button>
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
