"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  FaBars,
  FaTimes,
  FaCog,
  FaSignOutAlt,
  FaFileAlt,
} from "react-icons/fa";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Sidebar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`h-screen bg-white shadow-xl transition-all duration-300 ${
        open ? "w-64" : "w-16"
      } relative`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-6 bg-white border rounded-full shadow p-1 z-10"
      >
        {open ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* Sidebar content */}
      <div className="p-4 flex flex-col items-start gap-6 mt-10">
        {/* User Name */}
        {open && session?.user && (
          <h2 className="text-lg font-semibold text-gray-800">
            {session.user.email}
          </h2>
        )}

        {/* Nav Links */}
        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/user/pengaduan"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <FaFileAlt />
            {open && <span>Buat Laporan</span>}
          </Link>
          <Link
            href="/user/setting"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <FaCog />
            {open && <span>Pengaturan</span>}
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 text-red-600 hover:text-red-800 transition"
          >
            <FaSignOutAlt />
            {open && <span>Keluar</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
