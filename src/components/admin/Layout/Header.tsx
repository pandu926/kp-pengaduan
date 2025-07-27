"use client";

import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header = ({ title, onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            {title}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <BellIcon className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
