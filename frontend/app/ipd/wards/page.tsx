'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Bed {
  id: string;
  bedNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  admission?: {
    id: string;
    patient: { firstName: string; lastName: string };
  };
}

interface Ward {
  id: string;
  name: string;
  type: string;
  beds: Bed[];
  _count: { beds: number };
}

export default function WardDashboard() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/ipd/wards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setWards(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ward & Bed Management</h1>
          <p className="text-gray-500">Real-time occupancy tracking.</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/ipd/admissions/new">
            <Button>Admit Patient</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">Loading wards...</div>
      ) : (
        <div className="space-y-8">
          {wards.map((ward) => (
            <div key={ward.id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{ward.name}</h2>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{ward.type}</p>
                </div>
                <div className="flex space-x-4 text-xs">
                  <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> Available</div>
                  <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Occupied</div>
                  <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span> Maintenance</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {ward.beds.map((bed) => (
                  <div 
                    key={bed.id}
                    className={`relative p-4 rounded-lg border-2 text-center cursor-pointer transition-all hover:scale-105 ${
                      bed.status === 'AVAILABLE' ? 'border-green-100 bg-green-50 text-green-700' :
                      bed.status === 'OCCUPIED' ? 'border-blue-100 bg-blue-50 text-blue-700' :
                      'border-red-100 bg-red-50 text-red-700'
                    }`}
                  >
                    <p className="text-lg font-bold">{bed.bedNumber.split('-').pop()}</p>
                    <p className="text-[10px] font-medium uppercase tracking-tighter opacity-70">Bed</p>
                    
                    {bed.status === 'OCCUPIED' && bed.admission && (
                      <div className="absolute inset-0 bg-blue-600 rounded-lg opacity-0 hover:opacity-100 flex items-center justify-center p-2 text-white transition-opacity">
                        <Link href={`/ipd/admissions/${bed.admission.id}`} className="text-[10px] font-bold underline">
                          {bed.admission.patient.firstName}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
