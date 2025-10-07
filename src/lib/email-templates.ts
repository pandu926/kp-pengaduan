// Base template wrapper
const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .info-box {
      background: #f0f9ff;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .warning-box {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .success-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CV Arfila Jasa Putra</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Jasa Konstruksi Terpercaya</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>CV Arfila Jasa Putra</strong></p>
      <p>Email: info@arfilajasaputra.com | Telp: (0286) 123-4567</p>
      <p>Alamat: Jl. Contoh No. 123, Wonosobo, Jawa Tengah</p>
      <p style="margin-top: 15px; font-size: 12px;">
        Email ini dikirim secara otomatis, mohon tidak membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>
`;

// 1. Email Notifikasi Pesanan Baru ke Admin
export const emailPesananBaruAdmin = (data: {
  orderId: number;
  namaPelanggan: string;
  layanan: string;
  lokasi: string;
  nomorHp: string;
  catatan?: string;
}) => {
  const content = `
    <h2 style="color: #1e40af; margin-top: 0;">Pesanan Baru Masuk!</h2>
    <p>Halo Admin,</p>
    <p>Ada pesanan baru yang memerlukan review Anda.</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0; color: #2563eb;">Detail Pesanan</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>ID Pesanan:</strong></td>
          <td style="padding: 8px 0;">#${data.orderId
            .toString()
            .padStart(6, "0")}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Nama Pelanggan:</strong></td>
          <td style="padding: 8px 0;">${data.namaPelanggan}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Layanan:</strong></td>
          <td style="padding: 8px 0;">${data.layanan}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Lokasi:</strong></td>
          <td style="padding: 8px 0;">${data.lokasi}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>No. HP:</strong></td>
          <td style="padding: 8px 0;">${data.nomorHp}</td>
        </tr>
        ${
          data.catatan
            ? `
        <tr>
          <td style="padding: 8px 0; vertical-align: top;"><strong>Catatan:</strong></td>
          <td style="padding: 8px 0;">${data.catatan}</td>
        </tr>
        `
            : ""
        }
      </table>
    </div>

    <p>Silakan login ke dashboard untuk mereview pesanan ini.</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/pesanan/${
    data.orderId
  }" class="button">
      Lihat Detail Pesanan
    </a>
    <p>Terima kasih!</p>
  `;

  return getEmailTemplate(content);
};

// 2. Email Konfirmasi Pesanan Diterima ke Pelanggan
export const emailPesananDiterima = (data: {
  orderId: number;
  namaPelanggan: string;
  layanan: string;
  hargaDisepakati: number;
}) => {
  const content = `
    <h2 style="color: #10b981; margin-top: 0;">Pesanan Anda Diterima!</h2>
    <p>Halo ${data.namaPelanggan},</p>
    <p>Kabar baik! Pesanan Anda telah kami review dan <strong>DITERIMA</strong>.</p>
    
    <div class="success-box">
      <h3 style="margin-top: 0; color: #059669;">Detail Pesanan</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>ID Pesanan:</strong></td>
          <td style="padding: 8px 0;">#${data.orderId
            .toString()
            .padStart(6, "0")}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Layanan:</strong></td>
          <td style="padding: 8px 0;">${data.layanan}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Harga Disepakati:</strong></td>
          <td style="padding: 8px 0; color: #059669; font-size: 18px; font-weight: bold;">
            Rp ${data.hargaDisepakati.toLocaleString("id-ID")}
          </td>
        </tr>
      </table>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; color: #2563eb;">Langkah Selanjutnya:</h3>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li>Transfer pembayaran DP ke rekening kami</li>
        <li>Upload bukti transfer di dashboard</li>
        <li>Tunggu verifikasi dari tim kami</li>
      </ol>
      
      <p style="margin-top: 15px;"><strong>Rekening Tujuan:</strong></p>
      <p style="margin: 5px 0;">Bank: <strong>BCA</strong></p>
      <p style="margin: 5px 0;">No. Rekening: <strong>1234567890</strong></p>
      <p style="margin: 5px 0;">Atas Nama: <strong>CV Arfila Jasa Putra</strong></p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/pesanan/${
    data.orderId
  }" class="button">
      Lihat Pesanan & Upload Bukti Bayar
    </a>
    <p>Jika ada pertanyaan, jangan ragu untuk menghubungi kami.</p>
    <p>Terima kasih telah mempercayai CV Arfila Jasa Putra!</p>
  `;

  return getEmailTemplate(content);
};

// 3. Email Pesanan Ditolak ke Pelanggan
export const emailPesananDitolak = (data: {
  orderId: number;
  namaPelanggan: string;
  layanan: string;
  alasanPenolakan: string;
}) => {
  const content = `
    <h2 style="color: #ef4444; margin-top: 0;">Pemberitahuan Pesanan</h2>
    <p>Halo ${data.namaPelanggan},</p>
    <p>Terima kasih telah mempercayai CV Arfila Jasa Putra.</p>
    <p>Setelah kami review, dengan berat hati kami informasikan bahwa pesanan Anda <strong>tidak dapat kami proses</strong> saat ini.</p>
    
    <div class="warning-box">
      <h3 style="margin-top: 0; color: #dc2626;">Detail Pesanan</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>ID Pesanan:</strong></td>
          <td style="padding: 8px 0;">#${data.orderId
            .toString()
            .padStart(6, "0")}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Layanan:</strong></td>
          <td style="padding: 8px 0;">${data.layanan}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top;"><strong>Alasan:</strong></td>
          <td style="padding: 8px 0;">${data.alasanPenolakan}</td>
        </tr>
      </table>
    </div>

    <p>Kami mohon maaf atas ketidaknyamanan ini. Jika Anda memiliki pertanyaan atau ingin berdiskusi lebih lanjut, silakan hubungi kami.</p>
    
    <a href="https://wa.me/6281234567890" class="button" style="background: #10b981;">
      Hubungi Kami via WhatsApp
    </a>
    <p>Terima kasih atas pengertiannya.</p>
  `;

  return getEmailTemplate(content);
};

// 4. Email Notifikasi Upload Bukti Pembayaran ke Admin
export const emailBuktiPembayaranAdmin = (data: {
  orderId: number;
  namaPelanggan: string;
  jumlah: number;
}) => {
  const content = `
    <h2 style="color: #1e40af; margin-top: 0;">Bukti Pembayaran Baru!</h2>
    <p>Halo Admin,</p>
    <p>Pelanggan telah mengupload bukti pembayaran yang memerlukan verifikasi Anda.</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0; color: #2563eb;">Detail Pembayaran</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>ID Pesanan:</strong></td>
          <td style="padding: 8px 0;">#${data.orderId
            .toString()
            .padStart(6, "0")}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Nama Pelanggan:</strong></td>
          <td style="padding: 8px 0;">${data.namaPelanggan}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Jumlah:</strong></td>
          <td style="padding: 8px 0; color: #059669; font-size: 18px; font-weight: bold;">
            Rp ${data.jumlah.toLocaleString("id-ID")}
          </td>
        </tr>
      </table>
    </div>

    <p>Silakan login ke dashboard untuk memverifikasi pembayaran ini.</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/pesanan/${
    data.orderId
  }" class="button">
      Verifikasi Pembayaran
    </a>
  `;

  return getEmailTemplate(content);
};

// 5. Email Pembayaran Diverifikasi ke Pelanggan
export const emailPembayaranDiverifikasi = (data: {
  orderId: number;
  namaPelanggan: string;
  jumlah: number;
}) => {
  const content = `
    <h2 style="color: #10b981; margin-top: 0;">Pembayaran Terverifikasi!</h2>
    <p>Halo ${data.namaPelanggan},</p>
    <p>Kabar baik! Pembayaran Anda telah <strong>TERVERIFIKASI</strong>.</p>
    
    <div class="success-box">
      <h3 style="margin-top: 0; color: #059669;">Detail Pembayaran</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>ID Pesanan:</strong></td>
          <td style="padding: 8px 0;">#${data.orderId
            .toString()
            .padStart(6, "0")}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Jumlah:</strong></td>
          <td style="padding: 8px 0; color: #059669; font-size: 18px; font-weight: bold;">
            Rp ${data.jumlah.toLocaleString("id-ID")}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Status:</strong></td>
          <td style="padding: 8px 0;"><span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">Terverifikasi</span></td>
        </tr>
      </table>
    </div>

    <p>Pesanan Anda akan segera diproses. Kami akan menghubungi Anda untuk jadwal survei lokasi.</p>
    
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/pesanan/${
    data.orderId
  }" class="button">
      Lihat Status Pesanan
    </a>
    <p>Terima kasih telah mempercayai CV Arfila Jasa Putra!</p>
  `;

  return getEmailTemplate(content);
};

// 6. Email Pembayaran Ditolak ke Pelanggan
export const emailPembayaranDitolak = (data: {
  orderId: number;
  namaPelanggan: string;
  alasanPenolakan: string;
}) => {
  const content = `
    <h2 style="color: #ef4444; margin-top: 0;">Pembayaran Perlu Diperbaiki</h2>
    <p>Halo ${data.namaPelanggan},</p>
    <p>Setelah kami verifikasi, bukti pembayaran yang Anda upload <strong>perlu diperbaiki</strong>.</p>
    
    <div class="warning-box">
      <h3 style="margin-top: 0; color: #dc2626;">Alasan Penolakan</h3>
      <p style="margin: 10px 0;">${data.alasanPenolakan}</p>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; color: #2563eb;">Langkah Selanjutnya:</h3>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li>Pastikan bukti transfer jelas dan terbaca</li>
        <li>Jumlah transfer sesuai dengan harga yang disepakati</li>
        <li>Upload ulang bukti pembayaran yang sesuai</li>
      </ol>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/pesanan/${data.orderId}" class="button">
      Upload Ulang Bukti Pembayaran
    </a>
    <p>Jika ada pertanyaan, silakan hubungi kami.</p>
  `;

  return getEmailTemplate(content);
};

// 7. Email Status Pesanan Selesai ke Pelanggan
export const emailPesananSelesai = (data: {
  orderId: number;
  namaPelanggan: string;
  layanan: string;
}) => {
  const content = `
    <h2 style="color: #10b981; margin-top: 0;">Pesanan Selesai!</h2>
    <p>Halo ${data.namaPelanggan},</p>
    <p>Dengan senang hati kami informasikan bahwa pesanan Anda telah <strong>SELESAI</strong>!</p>
    
    <div class="success-box">
      <h3 style="margin-top: 0; color: #059669;">Detail Pesanan</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>ID Pesanan:</strong></td>
          <td style="padding: 8px 0;">#${data.orderId
            .toString()
            .padStart(6, "0")}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Layanan:</strong></td>
          <td style="padding: 8px 0;">${data.layanan}</td>
        </tr>
      </table>
    </div>

    <p>Terima kasih telah mempercayai CV Arfila Jasa Putra untuk kebutuhan konstruksi Anda.</p>
    <p>Kami berharap hasil pekerjaan kami memuaskan dan memenuhi harapan Anda.</p>
    
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/pesanan/${
    data.orderId
  }" class="button">
      Lihat Detail Pesanan
    </a>
    
    <p style="margin-top: 30px;">Jangan ragu untuk menghubungi kami jika Anda membutuhkan layanan kami kembali di masa mendatang.</p>
    <p><strong>Sampai jumpa lagi!</strong></p>
  `;

  return getEmailTemplate(content);
};
