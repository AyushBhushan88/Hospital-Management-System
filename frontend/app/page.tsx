export default function Home() {
  const stats = [
    { name: 'Total Patients', value: '1,240', icon: '👤', color: 'bg-blue-100 text-blue-800' },
    { name: 'Today\'s Appointments', value: '42', icon: '📅', color: 'bg-green-100 text-green-800' },
    { name: 'Available Beds', value: '12 / 50', icon: '🛌', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Pending Lab Tests', value: '8', icon: '🧪', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hospital Dashboard</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700">
            + New Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Appointments</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">P</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Patient Name {i}</p>
                    <p className="text-xs text-gray-500">Dr. Smith • 10:30 AM</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Confirmed</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Department Occupancy</h2>
          <div className="space-y-4">
            {['Cardiology', 'Neurology', 'General Medicine'].map((dept) => (
              <div key={dept} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{dept}</span>
                  <span className="text-gray-500">80%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
