"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AdminLayout from "@/components/admin/Layout/AdminLayout";
import Table from "@/components/admin/Common/Table";
import Modal from "@/components/admin/Common/Modal";
import Button from "@/components/admin/Common/Button";
import Card from "@/components/admin/Common/Card";
import LayananForm from "@/components/admin/Forms/LayananForm";
import { Layanan, TableColumn } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function LayananPage() {
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLayanan, setEditingLayanan] = useState<Layanan | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLayanan = async () => {
    try {
      const res = await fetch("/api/layanan");
      const data = await res.json();
      setLayananList(data.data);
    } catch (err) {
      console.error("Gagal mengambil data layanan", err);
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "nama", label: "Nama Layanan" },
    {
      key: "deskripsi",
      label: "Deskripsi",
      render: (value) =>
        value
          ? value.length > 50
            ? value.substring(0, 50) + "..."
            : value
          : "-",
    },
    { key: "harga", label: "Harga", render: (value) => `Rp ${value}` },
  ];

  const handleAdd = () => {
    setEditingLayanan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (layanan: Layanan) => {
    setEditingLayanan(layanan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus layanan ini?")) return;
    try {
      await fetch(`/api/layanan/${id}`, {
        method: "DELETE",
      });
      await fetchLayanan();
    } catch (err) {
      console.error("Gagal menghapus layanan", err);
    }
  };

  const handleSubmit = async (formData: Partial<Layanan>) => {
    try {
      if (editingLayanan) {
        // Update
        await fetch(`/api/layanan/${editingLayanan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Tambah
        await fetch(`/api/layanan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      await fetchLayanan();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Gagal menyimpan layanan", err);
    }
  };

  return (
    <AdminLayout title="Manajemen Layanan">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Daftar Layanan</h3>
            <p className="text-gray-600">Kelola layanan yang tersedia</p>
          </div>
          <Button onClick={handleAdd} icon={<PlusIcon className="w-4 h-4" />}>
            Tambah Layanan
          </Button>
        </div>

        <Table
          columns={columns}
          data={layananList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLayanan ? "Edit Layanan" : "Tambah Layanan"}
      >
        <LayananForm
          layanan={editingLayanan}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AdminLayout>
  );
}
