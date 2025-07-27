"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AdminLayout from "@/components/admin/Layout/AdminLayout";
import Table from "@/components/admin/Common/Table";
import Modal from "@/components/admin/Common/Modal";
import Button from "@/components/admin/Common/Button";
import Card from "@/components/admin/Common/Card";
import PortofolioForm from "@/components/admin/Forms/PortofolioForm";
import { Portofolio, TableColumn } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function PortofolioPage() {
  const [portofolioList, setPortofolioList] = useState<Portofolio[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPortofolio, setEditingPortofolio] = useState<Portofolio | null>(
    null
  );

  const fetchPortofolio = async () => {
    try {
      const res = await fetch("/api/portofolio");
      const data = await res.json();
      setPortofolioList(data.data);
    } catch (err) {
      console.error("Gagal memuat data portofolio", err);
    }
  };

  useEffect(() => {
    fetchPortofolio();
  }, []);

  const columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "judul", label: "Judul Proyek" },
    {
      key: "deskripsi",
      label: "Deskripsi",
      render: (value) =>
        value
          ? value.length > 60
            ? value.substring(0, 60) + "..."
            : value
          : "-",
    },
    {
      key: "tanggalSelesai",
      label: "Tanggal Selesai",
      render: (value) => (value ? formatDate(value) : "-"),
    },
    {
      key: "dibuatPada",
      label: "Dibuat",
      render: (value) => formatDate(value),
    },
  ];

  const handleAdd = () => {
    setEditingPortofolio(null);
    setIsModalOpen(true);
  };

  const handleEdit = (portofolio: Portofolio) => {
    setEditingPortofolio(portofolio);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus portofolio ini?")) return;
    try {
      await fetch(`/api/portofolio/${id}`, { method: "DELETE" });
      await fetchPortofolio();
    } catch (err) {
      console.error("Gagal menghapus portofolio", err);
    }
  };

  const handleSubmit = async (formData: Partial<Portofolio>) => {
    try {
      if (editingPortofolio) {
        await fetch(`/api/portofolio/${editingPortofolio.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/portofolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      await fetchPortofolio();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Gagal menyimpan portofolio", err);
    }
  };

  return (
    <AdminLayout title="Manajemen Portofolio">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Daftar Portofolio</h3>
            <p className="text-gray-600">
              Kelola showcase proyek yang telah selesai
            </p>
          </div>
          <Button onClick={handleAdd} icon={<PlusIcon className="w-4 h-4" />}>
            Tambah Portofolio
          </Button>
        </div>

        <Table
          columns={columns}
          data={portofolioList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPortofolio ? "Edit Portofolio" : "Tambah Portofolio"}
      >
        <PortofolioForm
          portofolio={editingPortofolio}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AdminLayout>
  );
}
