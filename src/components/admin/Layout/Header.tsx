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
      </div>
    </header>
  );
};

export default Header;
