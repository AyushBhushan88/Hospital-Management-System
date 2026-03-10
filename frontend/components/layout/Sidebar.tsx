import Link from 'next/link';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Register Patient', href: '/patients/register', icon: '📝' },
  { name: 'Appointments', href: '/appointments', icon: '📅' },
  { name: 'Patients', href: '/patients', icon: '👤' },
  { name: 'OPD Management', href: '/opd', icon: '🏥' },
  { name: 'IPD Management', href: '/ipd', icon: '🛌' },
  { name: 'Pharmacy', href: '/pharmacy', icon: '💊' },
  { name: 'Lab Reports', href: '/lab', icon: '🧪' },
  { name: 'Billing', href: '/billing', icon: '💳' },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 w-64 h-full pt-16 font-normal duration-75 lg:flex transition-width">
      <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200">
            <ul className="pb-2 space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100 group transition-all"
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
