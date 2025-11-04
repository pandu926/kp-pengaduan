"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AdminLayout from "@/components/admin/Layout/AdminLayout";
import Table from "@/components/admin/Common/Table";
import Modal from "@/components/admin/Common/Modal";
import Button from "@/components/admin/Common/Button";
import Card from "@/components/admin/Common/Card";
import PenggunaForm from "@/components/admin/Forms/PenggunaForm";
import { Pengguna, TableColumn } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirm,
  showLoadingAlert,
  closeLoadingAlert,
  handleApiError,
  MESSAGES,
} from "@/lib/notification.utils";

export default function PenggunaPage() {
  const { data: session, status } = useSession();
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPengguna, setEditingPengguna] = useState<Pengguna | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/pengguna");
      const data = res.data.data;
      setPenggunaList(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPengguna(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pengguna: Pengguna) => {
    setEditingPengguna(pengguna);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const pengguna = penggunaList.find((p) => p.id === id);
    const penggunaName = pengguna?.nama || "pengguna ini";

    const result = await showDeleteConfirm(penggunaName);
    if (result.isConfirmed) {
      showLoadingAlert("Menghapus pengguna...");
      try {
        await fetch(`/api/pengguna/${id}`, { method: "DELETE" });
        closeLoadingAlert();
        setPenggunaList((prev) => prev.filter((item) => item.id !== id));
        showSuccessAlert(MESSAGES.DELETE_SUCCESS);
      } catch (err) {
        closeLoadingAlert();
        handleApiError(err);
      }
    }
  };

  const handleSubmit = async (formData: Partial<Pengguna>) => {
    showLoadingAlert(
      editingPengguna ? "Memperbarui pengguna..." : "Menambahkan pengguna..."
    );
    try {
      if (editingPengguna) {
        // Update
        await fetch(`/api/pengguna/${editingPengguna.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        // Fetch ulang setelah update
        await fetchData();
        closeLoadingAlert();
        showSuccessAlert(MESSAGES.UPDATE_SUCCESS);
      } else {
        // Create
        await fetch("/api/pengguna", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        await fetchData();
        closeLoadingAlert();
        showSuccessAlert(MESSAGES.CREATE_SUCCESS);
      }

      setIsModalOpen(false);
    } catch (err) {
      closeLoadingAlert();
      handleApiError(err);
    }
  };
  const columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "nama", label: "Nama" },
    { key: "email", label: "Email" },
    { key: "googleId", label: "Google ID" },
  ];

  if (loading || status === "loading") {
    return (
      <AdminLayout title="Manajemen Pengguna">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manajemen Pengguna">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Daftar Pengguna</h3>
            <p className="text-gray-600">Kelola data pengguna sistem</p>
          </div>
        </div>

        <Table
          columns={columns}
          data={penggunaList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPengguna ? "Edit Pengguna" : "Tambah Pengguna"}
      >
        <PenggunaForm
          pengguna={editingPengguna}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AdminLayout>
  );
}
