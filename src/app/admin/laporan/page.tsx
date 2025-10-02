"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AdminLayout from "@/components/admin/Layout/AdminLayout";
import Table from "@/components/admin/Common/Table";
import Modal from "@/components/admin/Common/Modal";
import Button from "@/components/admin/Common/Button";
import Card from "@/components/admin/Common/Card";
import axios from "axios";
import { formatDate, formatCurrency } from "@/lib/utils";
import { TableColumn } from "@/lib/types";

interface PesananLaporan {
  id: number;
  namaPelanggan: string;
  layanan: string;
  hargaDisepakati: number;
  tanggalPesan: string;
}

export default function LaporanPage() {
  const [laporanList, setLaporanList] = useState<PesananLaporan[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPendapatan, setTotalPendapatan] = useState(0);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/laporan?start=${startDate}&end=${endDate}`
      );

      const data: PesananLaporan[] = res.data.data.map((p: any) => ({
        id: p.id,
        namaPelanggan: p.namaPelanggan,
        layanan: p.layanan?.nama || "-",
        hargaDisepakati: p.hargaDisepakati || 0,
        tanggalPesan: p.tanggalPesan,
      }));
      setLaporanList(data);
      setTotalPendapatan(
        data.reduce((sum, p) => sum + (p.hargaDisepakati || 0), 0)
      );
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "namaPelanggan", label: "Nama Pelanggan" },
    { key: "layanan", label: "Layanan" },
    {
      key: "hargaDisepakati",
      label: "Harga",
      render: (value) => formatCurrency(value),
    },
    {
      key: "tanggalPesan",
      label: "Tanggal Pesan",
      render: (value) => formatDate(value),
    },
  ];

  const handleCetak = () => {
    // Generate HTML string dulu
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Laporan Pendapatan CV Arfilla Jaya Putra</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 30px;
            margin-bottom: 30px;
          }
          
          .company-name {
            font-size: 32px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 5px;
            letter-spacing: 1px;
          }
          
          .report-title {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
          }
          
          .period {
            font-size: 14px;
            color: #718096;
            background: #f7fafc;
            padding: 8px 20px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 10px;
          }
          
          .info-cards {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .info-card {
            flex: 1;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 10px;
            color: white;
            text-align: center;
          }
          
          .info-card-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            opacity: 0.9;
          }
          
          .info-card-value {
            font-size: 24px;
            font-weight: 700;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          
          thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          th.text-right {
            text-align: right;
          }
          
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
            color: #2d3748;
            font-size: 14px;
          }
          
          tbody tr:nth-child(even) {
            background: #fafbfc;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          tfoot {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            font-weight: 700;
          }
          
          tfoot td {
            padding: 15px;
            border: none;
            font-size: 16px;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
          }
          
          .footer-text {
            color: #718096;
            font-size: 12px;
            margin-bottom: 5px;
          }
          
          .footer-brand {
            color: #667eea;
            font-weight: 600;
            font-size: 14px;
          }
          
          .generated-date {
            color: #a0aec0;
            font-size: 11px;
            margin-top: 10px;
          }
          
          @media print {
            body {
              background: white;
              padding: 20px;
            }
            
            .container {
              box-shadow: none;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">CV ARFILLA JAYA PUTRA</div>
            <div class="report-title">Laporan Pendapatan</div>
            <div class="period">
              Periode: ${formatDate(startDate)} - ${formatDate(endDate)}
            </div>
          </div>
          
          <div class="info-cards">
            <div class="info-card">
              <div class="info-card-label">Total Transaksi</div>
              <div class="info-card-value">${laporanList.length}</div>
            </div>
            <div class="info-card">
              <div class="info-card-label">Total Pendapatan</div>
              <div class="info-card-value">${formatCurrency(
                totalPendapatan
              )}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 60px;">No</th>
                <th style="width: 140px;">Tanggal</th>
                <th>Pelanggan</th>
                <th>Layanan</th>
                <th class="text-right" style="width: 180px;">Harga</th>
              </tr>
            </thead>
            <tbody>
              ${laporanList
                .map(
                  (p, i) => `
                <tr>
                  <td class="text-center">${i + 1}</td>
                  <td>${formatDate(p.tanggalPesan)}</td>
                  <td>${p.namaPelanggan}</td>
                  <td>${p.layanan}</td>
                  <td class="text-right">${formatCurrency(
                    p.hargaDisepakati
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right">TOTAL PENDAPATAN</td>
                <td class="text-right">${formatCurrency(totalPendapatan)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <div class="footer-text">Dokumen ini dibuat secara otomatis oleh sistem</div>
            <div class="footer-brand">CV Arfilla Jaya Putra - Sistem Manajemen Pesanan</div>
            <div class="generated-date">
              Dicetak pada: ${new Date().toLocaleString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    // Buat blob dari HTML
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Buka window dengan blob URL
    const newWindow = window.open(url, "_blank");

    // Tunggu load, baru print
    if (newWindow) {
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
          // Cleanup blob URL setelah print
          URL.revokeObjectURL(url);
        }, 500);
      };
    }
  };

  return (
    <AdminLayout title="Laporan Pesanan Selesai">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Filter Laporan</h3>
            <p className="text-gray-600">
              Pilih rentang tanggal untuk melihat laporan pesanan selesai
            </p>
          </div>
          <Button onClick={handleCetak} icon={<PlusIcon className="w-4 h-4" />}>
            Cetak Laporan
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <>
            <Table columns={columns} data={laporanList} />
            <div className="mt-4 text-right font-semibold text-green-600">
              Total Pendapatan: {formatCurrency(totalPendapatan)}
            </div>
          </>
        )}
      </Card>
    </AdminLayout>
  );
}
