export interface Pengguna {
  id: number;
  nama: string;
  email: string;
  googleId: string;
  dibuatPada: string;
}

export interface Layanan {
  id: number;
  nama: string;
  deskripsi?: string;
  urlGambar?: string;
  dibuatPada: string;
}

export interface Pesanan {
  id: number;
  penggunaId: number;
  layananId?: number;
  hargaDisepakati?: number;
  tanggalPesan: string;
  status: StatusPesanan;
  lokasi?: string;
  catatan?: string;
  dibuatPada: string;
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

export interface Portofolio {
  id: number;
  judul: string;
  deskripsi?: string;
  urlGambar?: string;
  tanggalSelesai?: string;
  dibuatPada: string;
}

export interface Laporan {
  id: number;
  bulanLaporan: string;
  totalPesanan?: number;
  totalPendapatan?: number;
  dibuatPada: string;
}

export enum StatusPesanan {
  MENUNGGU = "MENUNGGU",
  DIPROSES = "DIPROSES",
  SELESAI = "SELESAI",
  DIBATALKAN = "DIBATALKAN",
}

export interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}
