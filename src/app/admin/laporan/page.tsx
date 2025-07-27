"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AdminLayout from "@/components/admin/Layout/AdminLayout";
import Table from "@/components/admin/Common/Table";
import Modal from "@/components/admin/Common/Modal";
import Button from "@/components/admin/Common/Button";
import Card from "@/components/admin/Common/Card";
import LaporanForm from "@/components/admin/Forms/LaporanForm";
import { Laporan, TableColumn } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import axios from "axios";

export default function LaporanPage() {
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLaporan, setEditingLaporan] = useState<Laporan | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/laporan");
      setLaporanList(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
    }
  };

  const columns: TableColumn[] = [
    { key: "id", label: "ID" },
    {
      key: "bulanLaporan",
      label: "Bulan Laporan",
      render: (value) => {
        const date = new Date(value); // langsung pakai value
        return date.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
        });
      },
    },
    { key: "totalPesanan", label: "Total Pesanan" },
    {
      key: "totalPendapatan",
      label: "Total Pendapatan",
      render: (value) => (value ? formatCurrency(value) : "-"),
    },
    {
      key: "dibuatPada",
      label: "Dibuat",
      render: (value) => formatDate(value),
    },
  ];

  const handleAdd = () => {
    setEditingLaporan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (laporan: Laporan) => {
    setEditingLaporan(laporan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus laporan ini?")) {
      try {
        await axios.delete(`/api/laporan/${id}`);
        fetchData(); // Refresh data
      } catch (err) {
        console.error("Gagal menghapus laporan:", err);
      }
    }
  };

  const handleSubmit = async (formData: Partial<Laporan>) => {
    try {
      if (editingLaporan) {
        await axios.put(`/api/laporan/${editingLaporan.id}`, formData);
      } else {
        await axios.post("/api/laporan", formData);
      }
      setIsModalOpen(false);
      fetchData(); // Refresh data setelah simpan
    } catch (err) {
      console.error("Gagal menyimpan laporan:", err);
    }
  };
  console.log(laporanList);
  return (
    <AdminLayout title="Manajemen Laporan">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Daftar Laporan</h3>
            <p className="text-gray-600">
              Kelola laporan bulanan pendapatan dan pesanan
            </p>
          </div>
          <Button onClick={handleAdd} icon={<PlusIcon className="w-4 h-4" />}>
            Tambah Laporan
          </Button>
        </div>

        <Table
          columns={columns}
          data={laporanList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLaporan ? "Edit Laporan" : "Tambah Laporan"}
      >
        <LaporanForm
          laporan={editingLaporan}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AdminLayout>
  );
}
