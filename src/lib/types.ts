export enum StatusPesanan {
  PENGAJUAN = "PENGAJUAN",
  SURVEI = "SURVEI",
  PENGERJAAN = "PENGERJAAN",
  SELESAI = "SELESAI",
  DIBATALKAN = "DIBATALKAN",
}

export interface Pengguna {
  id: number;
  nama: string;
  email: string;
  googleId: string;
  dibuatPada: string;
  pesanan?: Pesanan[];
}

export interface Layanan {
  id: number;
  nama: string;
  deskripsi?: string;
  harga?: number;
  pesanan?: Pesanan[];
}

export interface Pesanan {
  id: number;
  namaPelanggan: string;
  penggunaId?: number;
  layananId?: number;
  hargaDisepakati?: number | string;
  tanggalPesan: string;
  nomorHp: string;
  status: StatusPesanan;
  lokasi?: string;
  catatan?: string;
  dibuatPada: string;
  progres?: ProgresPesanan[];
  pengguna?: Pengguna;
  layanan?: Layanan;
}

export interface ProgresPesanan {
  id: number;
  pesananId: number;
  keterangan?: string;
  persenProgres: number;
  urlDokumentasi?: string;
  diperbaruiPada: string;
  pesanan?: Pesanan;
}

export interface Laporan {
  id: number;
  bulanLaporan: string;
  totalPesanan?: number;
  totalPendapatan?: number | string;
  dibuatPada: string;
}

export interface Portofolio {
  id: number;
  judul: string;
  deskripsi?: string;
  urlGambar?: string;
  tanggalSelesai?: string;
  dibuatPada: string;
}

export interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}
