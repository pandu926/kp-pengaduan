"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AdminLayout from "@/components/admin/Layout/AdminLayout";
import Table from "@/components/admin/Common/Table";
import Modal from "@/components/admin/Common/Modal";
import Button from "@/components/admin/Common/Button";
import Card from "@/components/admin/Common/Card";
import ProgresForm from "@/components/admin/Forms/ProgresForm";
import { ProgresPesanan, TableColumn } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function ProgresPage() {
  const [progresList, setProgresList] = useState<ProgresPesanan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgres, setEditingProgres] = useState<ProgresPesanan | null>(
    null
  );

  const fetchProgres = async () => {
    try {
      const res = await fetch("/api/progres");
      const data = await res.json();
      setProgresList(data.data);
    } catch (error) {
      console.error("Gagal memuat data progres:", error);
    }
  };

  useEffect(() => {
    fetchProgres();
  }, []);

  const columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "pesananId", label: "ID Pesanan" },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (value) =>
        value
          ? value.length > 50
            ? value.substring(0, 50) + "..."
            : value
          : "-",
    },
    {
      key: "persenProgres",
      label: "Progress",
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{value}%</span>
        </div>
      ),
    },
    {
      key: "diperbaruiPada",
      label: "Diperbarui",
      render: (value) => formatDate(value),
    },
  ];

  const handleAdd = () => {
    setEditingProgres(null);
    setIsModalOpen(true);
  };

  const handleEdit = (progres: ProgresPesanan) => {
    setEditingProgres(progres);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus progres ini?")) return;
    try {
      await fetch(`/api/progres/${id}`, { method: "DELETE" });
      await fetchProgres();
    } catch (error) {
      console.error("Gagal menghapus progres:", error);
    }
  };

  const handleSubmit = async (formData: Partial<ProgresPesanan>) => {
    try {
      if (editingProgres) {
        await fetch(`/api/progres/${editingProgres.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/progres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      await fetchProgres();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan progres:", error);
    }
  };

  return (
    <AdminLayout title="Manajemen Progres">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Daftar Progres Pesanan</h3>
            <p className="text-gray-600">Kelola progres pengerjaan proyek</p>
          </div>
          <Button onClick={handleAdd} icon={<PlusIcon className="w-4 h-4" />}>
            Tambah Progres
          </Button>
        </div>

        <Table
          columns={columns}
          data={progresList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProgres ? "Edit Progres" : "Tambah Progres"}
      >
        <ProgresForm
          progres={editingProgres}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AdminLayout>
  );
}
