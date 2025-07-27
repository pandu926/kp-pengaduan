"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AdminLayout from "@/components/admin/Layout/AdminLayout";
import Table from "@/components/admin/Common/Table";
import Modal from "@/components/admin/Common/Modal";
import Button from "@/components/admin/Common/Button";
import Card from "@/components/admin/Common/Card";
import PesananForm from "@/components/admin/Forms/PesananForm";
import { Pesanan, TableColumn, StatusPesanan } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function PesananPage() {
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPesanan, setEditingPesanan] = useState<Pesanan | null>(null);

  const fetchPesanan = async () => {
    try {
      const res = await fetch("/api/pesanan");
      const data = await res.json();
      setPesananList(data.data);
    } catch (err) {
      console.error("Gagal fetch data pesanan", err);
    }
  };

  useEffect(() => {
    fetchPesanan();
  }, []);

  const columns: TableColumn[] = [
    { key: "id", label: "ID" },
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
              : value === StatusPesanan.DIPROSES
              ? "bg-blue-100 text-blue-800"
              : value === StatusPesanan.MENUNGGU
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
      key: "tanggalPesan",
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
    if (!confirm("Yakin ingin menghapus pesanan ini?")) return;
    try {
      await fetch(`/api/pesanan/${id}`, {
        method: "DELETE",
      });
      await fetchPesanan();
    } catch (err) {
      console.error("Gagal menghapus pesanan", err);
    }
  };

  const handleSubmit = async (formData: Partial<Pesanan>) => {
    try {
      if (editingPesanan) {
        await fetch(`/api/pesanan/${editingPesanan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(`/api/pesanan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      await fetchPesanan();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Gagal menyimpan pesanan", err);
    }
  };

  return (
    <AdminLayout title="Manajemen Pesanan">
      <Card>
        <div className="flex justify-between items-center mb-6">
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

        <Table
          columns={columns}
          data={pesananList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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
