"use client";

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
    { name: "Progres", href: "/admin/progres", icon: ChartBarIcon },
    { name: "Portofolio", href: "/admin/portofolio", icon: FolderIcon },
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
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
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
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
