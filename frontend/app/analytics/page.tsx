'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalRevenue: number;
  pendingPayments: number;
  breakdown: Record<string, number>;
  last7Days: { date: string, revenue: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading Analytics...</div>;
  if (!data) return <div className="p-6 text-red-500">Failed to load analytics. Access denied.</div>;

  const maxRevenue = Math.max(...data.last7Days.map(d => d.revenue), 100);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Analytics & Financials</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue Collected</p>
          <p className="text-3xl font-bold text-green-600">${data.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Pending Receivables</p>
          <p className="text-3xl font-bold text-red-600">${data.pendingPayments.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Expected</p>
          <p className="text-3xl font-bold text-blue-600">${(data.totalRevenue + data.pendingPayments).toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Collection Rate</p>
          <p className="text-3xl font-bold text-purple-600">
            {((data.totalRevenue / (data.totalRevenue + data.pendingPayments || 1)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Revenue by Department</h2>
          <div className="space-y-4">
            {Object.entries(data.breakdown).map(([dept, amount]) => (
              <div key={dept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{dept}</span>
                  <span className="text-gray-500">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(amount / (data.totalRevenue + data.pendingPayments || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Trend (Simple CSS Bar Chart) */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Last 7 Days Revenue Trend</h2>
          <div className="flex items-end justify-between h-48 gap-2">
            {data.last7Days.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex flex-col justify-end h-32">
                  <div 
                    className="bg-green-500 rounded-t-md group-hover:bg-green-600 transition-all duration-300"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      ${day.revenue}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase">{day.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
