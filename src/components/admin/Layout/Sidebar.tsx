"use client";

import { signOut } from "next-auth/react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { name: "Pengguna", href: "/admin/pengguna", icon: UsersIcon },
    { name: "Layanan", href: "/admin/layanan", icon: BriefcaseIcon },
    { name: "Pesanan", href: "/admin/pesanan", icon: ShoppingCartIcon },

    {
      name: "Laporan",
      href: "/admin/laporan",
      icon: ClipboardDocumentListIcon,
    },
  ];

  return (
    <aside
      className={`bg-white shadow-lg w-64 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Arfilla Jaya Putra</h1>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md hover:bg-gray-100"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
          <div className="absolute bottom-0 w-full p-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center w-full space-x-3 text-red-600 hover:text-red-700 p-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
