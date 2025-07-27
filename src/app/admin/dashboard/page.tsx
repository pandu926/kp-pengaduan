"use client";

import AdminLayout from "@/components/admin/Layout/AdminLayout";
import Card from "@/components/admin/Common/Card";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Pengguna",
      value: "24",
      icon: "👥",
      color: "blue",
    },
    {
      title: "Total Pesanan",
      value: "87",
      icon: "🛒",
      color: "green",
    },
    {
      title: "Pendapatan",
      value: "Rp 15.2M",
      icon: "💰",
      color: "yellow",
    },
    {
      title: "Proyek Selesai",
      value: "45",
      icon: "✅",
      color: "purple",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      message: "Pesanan baru dari John Doe",
      time: "2 menit lalu",
      status: "green",
    },
    {
      id: 2,
      message: "Progres proyek Website updated",
      time: "1 jam lalu",
      status: "blue",
    },
    {
      id: 3,
      message: "Pembayaran diterima untuk Proyek Mobile App",
      time: "3 jam lalu",
      status: "green",
    },
    {
      id: 4,
      message: "Layanan baru ditambahkan: SEO Optimization",
      time: "1 hari lalu",
      status: "purple",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activities */}
        <Card title="Aktivitas Terbaru">
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.status === "green"
                      ? "bg-green-500"
                      : activity.status === "blue"
                      ? "bg-blue-500"
                      : activity.status === "purple"
                      ? "bg-purple-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span className="text-gray-700 flex-1">{activity.message}</span>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Aksi Cepat">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-medium">Tambah Pengguna</div>
            </button>
            <button className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">💼</div>
              <div className="text-sm font-medium">Tambah Layanan</div>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium">Lihat Laporan</div>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm font-medium">Kelola Portofolio</div>
            </button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
