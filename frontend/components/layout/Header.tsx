import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 z-30 w-full bg-white border-b border-gray-200">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link href="/" className="flex ml-2 md:mr-24">
              <span className="self-center text-xl font-bold sm:text-2xl whitespace-nowrap text-primary">HospitalMS</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-center ml-3">
              <div>
                <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300">
                  <span className="sr-only">Open user menu</span>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">U</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
