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
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirm,
  showLoadingAlert,
  closeLoadingAlert,
  MESSAGES,
} from "@/lib/notification.utils";

export default function LayananPage() {
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLayanan, setEditingLayanan] = useState<Layanan | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLayanan = async () => {
    try {
      const res = await fetch("/api/layanan");
      if (!res.ok) {
        throw new Error("Gagal mengambil data layanan");
      }
      const data = await res.json();
      setLayananList(data.data);
    } catch (err) {
      console.error("Gagal mengambil data layanan", err);
      showErrorAlert(MESSAGES.LOAD_ERROR, "Gagal Memuat Data");
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
    const layanan = layananList.find((l) => l.id === id);
    const result = await showDeleteConfirm(
      layanan?.nama || "layanan ini"
    );

    if (!result.isConfirmed) return;

    try {
      showLoadingAlert("Menghapus data layanan...");
      const res = await fetch(`/api/layanan/${id}`, {
        method: "DELETE",
      });

      closeLoadingAlert();

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menghapus layanan");
      }

      await fetchLayanan();
      showSuccessAlert(MESSAGES.DELETE_SUCCESS, "Layanan Dihapus");
    } catch (err: any) {
      closeLoadingAlert();
      console.error("Gagal menghapus layanan", err);
      showErrorAlert(err.message || MESSAGES.DELETE_ERROR, "Gagal Menghapus");
    }
  };

  const handleSubmit = async (formData: Partial<Layanan>) => {
    try {
      setLoading(true);
      showLoadingAlert(
        editingLayanan ? "Memperbarui data layanan..." : "Menambahkan layanan baru..."
      );

      let res;
      if (editingLayanan) {
        // Update
        res = await fetch(`/api/layanan/${editingLayanan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Tambah
        res = await fetch(`/api/layanan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      closeLoadingAlert();

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan layanan");
      }

      await fetchLayanan();
      setIsModalOpen(false);

      showSuccessAlert(
        editingLayanan ? MESSAGES.UPDATE_SUCCESS : MESSAGES.CREATE_SUCCESS,
        editingLayanan ? "Layanan Diperbarui" : "Layanan Ditambahkan"
      );
    } catch (err: any) {
      closeLoadingAlert();
      console.error("Gagal menyimpan layanan", err);
      showErrorAlert(
        err.message || (editingLayanan ? MESSAGES.UPDATE_ERROR : MESSAGES.CREATE_ERROR),
        "Gagal Menyimpan"
      );
    } finally {
      setLoading(false);
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
