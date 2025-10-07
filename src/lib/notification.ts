import { sendEmail } from "./email";
import {
  emailPesananBaruAdmin,
  emailPesananDiterima,
  emailPesananDitolak,
  emailBuktiPembayaranAdmin,
  emailPembayaranDiverifikasi,
  emailPembayaranDitolak,
  emailPesananSelesai,
} from "./email-templates";

// Ambil email admin dari env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@arfilajasaputra.com";

export const notifyPesananBaru = async (data: any) => {
  const html = emailPesananBaruAdmin(data);
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `Pesanan Baru #${data.orderId.toString().padStart(6, "0")}`,
    html,
  });
};

export const notifyPesananDiterima = async (data: any, userEmail: string) => {
  const html = emailPesananDiterima(data);
  return sendEmail({
    to: userEmail,
    subject: `Pesanan #${data.orderId.toString().padStart(6, "0")} Diterima`,
    html,
  });
};

export const notifyPesananDitolak = async (data: any, userEmail: string) => {
  const html = emailPesananDitolak(data);
  return sendEmail({
    to: userEmail,
    subject: `Pemberitahuan Pesanan #${data.orderId
      .toString()
      .padStart(6, "0")}`,
    html,
  });
};

export const notifyBuktiPembayaran = async (data: any) => {
  const html = emailBuktiPembayaranAdmin(data);
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `Bukti Pembayaran Pesanan #${data.orderId
      .toString()
      .padStart(6, "0")}`,
    html,
  });
};

export const notifyPembayaranDiverifikasi = async (
  data: any,
  userEmail: string
) => {
  const html = emailPembayaranDiverifikasi(data);
  return sendEmail({
    to: userEmail,
    subject: `Pembayaran Terverifikasi - Pesanan #${data.orderId
      .toString()
      .padStart(6, "0")}`,
    html,
  });
};

export const notifyPembayaranDitolak = async (data: any, userEmail: string) => {
  const html = emailPembayaranDitolak(data);
  return sendEmail({
    to: userEmail,
    subject: `Pembayaran Perlu Diperbaiki - Pesanan #${data.orderId
      .toString()
      .padStart(6, "0")}`,
    html,
  });
};

export const notifyPesananSelesai = async (data: any, userEmail: string) => {
  const html = emailPesananSelesai(data);
  return sendEmail({
    to: userEmail,
    subject: `Pesanan #${data.orderId.toString().padStart(6, "0")} Selesai`,
    html,
  });
};
