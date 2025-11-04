"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AdminLayout from "@/components/admin/Layout/AdminLayout";
import Table from "@/components/admin/Common/Table";
import Modal from "@/components/admin/Common/Modal";
import Button from "@/components/admin/Common/Button";
import Card from "@/components/admin/Common/Card";
import PesananForm from "@/components/admin/Forms/PesananForm";
import { Pesanan, TableColumn, StatusPesanan } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirm,
  showLoadingAlert,
  closeLoadingAlert,
  handleApiError,
  MESSAGES,
} from "@/lib/notification.utils";

export default function PesananPage() {
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPesanan, setEditingPesanan] = useState<Pesanan | null>(null);

  // Search, sort, and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortStatus, setSortStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  const fetchPesanan = async () => {
    try {
      const res = await fetch("/api/pesanan");
      if (!res.ok) {
        throw new Error("Gagal mengambil data pesanan");
      }
      const data = await res.json();
      setPesananList(data.data);
    } catch (err) {
      console.error("Gagal fetch data pesanan", err);
      showErrorAlert(MESSAGES.LOAD_ERROR, "Gagal Memuat Data");
    }
  };

  useEffect(() => {
    fetchPesanan();
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = pesananList.filter((pesanan) => {
      const matchesSearch = pesanan.namaPelanggan
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        sortStatus === "all" || pesanan.status === sortStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered;
  }, [pesananList, searchTerm, sortStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortStatus]);

  const columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "namaPelanggan", label: "Nama Pelanggan" },
    { key: "penggunaId", label: "ID Pengguna" },
    { key: "layananId", label: "ID Layanan" },
    {
      key: "hargaDisepakati",
      label: "Harga",
      render: (value) => (value ? formatCurrency(value) : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === StatusPesanan.SELESAI
              ? "bg-green-100 text-green-800"
              : value === StatusPesanan.PENGERJAAN
              ? "bg-blue-100 text-blue-800"
              : value === StatusPesanan.PENGAJUAN
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    { key: "lokasi", label: "Lokasi" },
    {
      key: "dibuatPada",
      label: "Tanggal Pesan",
      render: (value) => formatDate(value),
    },
  ];

  const handleAdd = () => {
    setEditingPesanan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pesanan: Pesanan) => {
    setEditingPesanan(pesanan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const pesanan = pesananList.find((p) => p.id === id);
    const result = await showDeleteConfirm(
      pesanan?.namaPelanggan
        ? `pesanan atas nama ${pesanan.namaPelanggan}`
        : "pesanan ini"
    );

    if (!result.isConfirmed) return;

    try {
      showLoadingAlert("Menghapus data pesanan...");
      const res = await fetch(`/api/pesanan/${id}`, {
        method: "DELETE",
      });

      closeLoadingAlert();

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menghapus pesanan");
      }

      await fetchPesanan();
      showSuccessAlert(MESSAGES.DELETE_SUCCESS, "Pesanan Dihapus");
    } catch (err: any) {
      closeLoadingAlert();
      console.error("Gagal menghapus pesanan", err);
      showErrorAlert(err.message || MESSAGES.DELETE_ERROR, "Gagal Menghapus");
    }
  };

  const handleSubmit = async (formData: Partial<Pesanan>) => {
    try {
      showLoadingAlert(
        editingPesanan
          ? "Memperbarui data pesanan..."
          : "Menambahkan pesanan baru..."
      );

      if (editingPesanan) {
        await axios.put(`/api/pesanan/${editingPesanan.id}`, formData, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await axios.post(`/api/pesanan`, formData, {
          headers: { "Content-Type": "application/json" },
        });
      }

      closeLoadingAlert();
      await fetchPesanan();
      setIsModalOpen(false);

      showSuccessAlert(
        editingPesanan ? MESSAGES.UPDATE_SUCCESS : MESSAGES.CREATE_SUCCESS,
        editingPesanan ? "Pesanan Diperbarui" : "Pesanan Ditambahkan"
      );
    } catch (err) {
      closeLoadingAlert();
      console.error("❌ Gagal menyimpan pesanan:", err);
      if (axios.isAxiosError(err)) {
        console.error("Detail error:", err.response?.data || err.message);
      }
      handleApiError(err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  function handleRowClick(item: any): void {
    router.push(`/admin/pesanan/${item.id}`);
  }

  return (
    <AdminLayout title="Manajemen Pesanan">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold">Daftar Pesanan</h3>
            <p className="text-gray-600">Kelola pesanan dari pengguna</p>
          </div>
          <Button
            onClick={handleAdd}
            className=""
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Tambah Pesanan
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={sortStatus}
              onChange={(e) => setSortStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value={StatusPesanan.PENGAJUAN}>Pengajuan</option>
              <option value={StatusPesanan.PENGERJAAN}>Pengerjaan</option>
              <option value={StatusPesanan.SELESAI}>Selesai</option>
              <option value={StatusPesanan.DIBATALKAN}>Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Menampilkan {paginatedData.length} dari{" "}
            {filteredAndSortedData.length} pesanan
          </p>
        </div>

        <Table
          columns={columns}
          data={paginatedData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium border rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPesanan ? "Edit Pesanan" : "Tambah Pesanan"}
      >
        <PesananForm
          pesanan={editingPesanan}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AdminLayout>
  );
}
