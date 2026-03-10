'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingAppointments: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Patients', value: stats?.totalPatients || 0, icon: '👤', color: 'bg-blue-100 text-blue-800' },
    { name: 'Today\'s Appointments', value: stats?.todayAppointments || 0, icon: '📅', color: 'bg-green-100 text-green-800' },
    { name: 'Active Doctors', value: stats?.totalDoctors || 0, icon: '👨‍⚕️', color: 'bg-purple-100 text-purple-800' },
    { name: 'Pending Visits', value: stats?.pendingAppointments || 0, icon: '⏳', color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hospital Dashboard</h1>
        <div className="flex space-x-2">
          <Link href="/appointments/book" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700">
            + New Appointment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)
        ) : (
          statCards.map((stat) => (
            <div key={stat.name} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/patients/register" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
              <span className="block text-2xl mb-1">📝</span>
              <span className="text-sm font-bold text-gray-700">Register Patient</span>
            </Link>
            <Link href="/appointments" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
              <span className="block text-2xl mb-1">📅</span>
              <span className="text-sm font-bold text-gray-700">View Schedule</span>
            </Link>
            <Link href="/doctors" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
              <span className="block text-2xl mb-1">👨‍⚕️</span>
              <span className="text-sm font-bold text-gray-700">Manage Staff</span>
            </Link>
            <Link href="/billing" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
              <span className="block text-2xl mb-1">💳</span>
              <span className="text-sm font-bold text-gray-700">Billing</span>
            </Link>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">OPD Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <p className="text-sm font-bold text-blue-900">Reception Desk</p>
                  <p className="text-xs text-blue-700">Actively managing {stats?.todayAppointments || 0} visits today</p>
                </div>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold bg-blue-500 text-white rounded-full uppercase tracking-wider">Active</span>
            </div>
            
            <div className="p-4 border border-gray-100 rounded-lg space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Efficiency Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="text-primary">{(stats && stats.todayAppointments > 0) ? Math.round(((stats.todayAppointments - stats.pendingAppointments) / stats.todayAppointments) * 100) : 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${(stats && stats.todayAppointments > 0) ? ((stats.todayAppointments - stats.pendingAppointments) / stats.todayAppointments) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
