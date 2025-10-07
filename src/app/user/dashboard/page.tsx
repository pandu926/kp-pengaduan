"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleMyOrders = () => {
    router.push("/user/pesanan");
  };

  const handleCreateOrder = () => {
    router.push("/user/pemesanan");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Arfilla Jaya Putra
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 font-medium">
                Selamat datang, {session?.user?.name || "User"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl hover:shadow-xl hover:shadow-red-500/25 transform hover:-translate-y-1 transition-all duration-300 group"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Pesanan Saya Button */}
          <button
            onClick={handleMyOrders}
            className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-10 lg:p-12 flex flex-col items-center justify-center gap-4 sm:gap-6 hover:scale-105 border border-gray-100 hover:border-blue-200"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl sm:rounded-3xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300 shadow-lg">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-1 sm:mb-2">
                Pesanan Saya
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-medium px-2">
                Lihat dan kelola pesanan Anda
              </p>
            </div>
          </button>

          {/* Buat Pesanan Button */}
          <button
            onClick={handleCreateOrder}
            className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 p-6 sm:p-10 lg:p-12 flex flex-col items-center justify-center gap-4 sm:gap-6 hover:scale-105"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 shadow-lg">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 sm:mb-2">
                Buat Pesanan
              </h2>
              <p className="text-sm sm:text-base text-blue-100 font-medium px-2">
                Buat pesanan baru dengan mudah
              </p>
            </div>
          </button>
        </div>

        {/* Info Card */}
      </main>
    </div>
  );
}
