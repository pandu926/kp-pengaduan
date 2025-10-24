import Swal from "sweetalert2";

/**
 * Utility functions untuk menampilkan notifikasi dengan SweetAlert2
 * Semua pesan dalam Bahasa Indonesia
 */

export const showSuccessAlert = (message: string, title: string = "Berhasil!") => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#2563eb",
  });
};

export const showErrorAlert = (message: string, title: string = "Gagal!") => {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#dc2626",
  });
};

export const showWarningAlert = (message: string, title: string = "Perhatian!") => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#f59e0b",
  });
};

export const showInfoAlert = (message: string, title: string = "Informasi") => {
  return Swal.fire({
    icon: "info",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#2563eb",
  });
};

export const showConfirmAlert = (
  message: string,
  title: string = "Konfirmasi",
  confirmButtonText: string = "Ya, Lanjutkan",
  cancelButtonText: string = "Batal"
) => {
  return Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  });
};

export const showDeleteConfirm = (itemName: string = "data ini") => {
  return Swal.fire({
    icon: "warning",
    title: "Hapus Data?",
    html: `Apakah Anda yakin ingin menghapus <strong>${itemName}</strong>?<br>Tindakan ini tidak dapat dibatalkan.`,
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  });
};

export const showLoadingAlert = (message: string = "Memproses data...") => {
  return Swal.fire({
    title: "Mohon Tunggu",
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoadingAlert = () => {
  Swal.close();
};

// Pesan sukses standar untuk operasi CRUD
export const MESSAGES = {
  CREATE_SUCCESS: "Data berhasil ditambahkan!",
  UPDATE_SUCCESS: "Data berhasil diperbarui!",
  DELETE_SUCCESS: "Data berhasil dihapus!",
  SAVE_SUCCESS: "Data berhasil disimpan!",

  CREATE_ERROR: "Gagal menambahkan data. Silakan coba lagi.",
  UPDATE_ERROR: "Gagal memperbarui data. Silakan coba lagi.",
  DELETE_ERROR: "Gagal menghapus data. Silakan coba lagi.",
  SAVE_ERROR: "Gagal menyimpan data. Silakan coba lagi.",

  LOAD_ERROR: "Gagal memuat data. Silakan refresh halaman.",
  NETWORK_ERROR: "Terjadi kesalahan koneksi. Periksa koneksi internet Anda.",
  SERVER_ERROR: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",

  VALIDATION_ERROR: "Mohon periksa kembali data yang Anda masukkan.",
  UNAUTHORIZED: "Anda tidak memiliki izin untuk melakukan tindakan ini.",

  CONFIRM_DELETE: "Apakah Anda yakin ingin menghapus data ini?",
  CONFIRM_SAVE: "Apakah Anda yakin ingin menyimpan perubahan?",
};

/**
 * Helper function untuk menangani error dari API response
 */
export const handleApiError = (error: any) => {
  let errorMessage = MESSAGES.SERVER_ERROR;

  if (error.response) {
    // Server responded with error status
    if (error.response.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response.status === 401) {
      errorMessage = MESSAGES.UNAUTHORIZED;
    } else if (error.response.status === 404) {
      errorMessage = "Data tidak ditemukan.";
    } else if (error.response.status === 400) {
      errorMessage = MESSAGES.VALIDATION_ERROR;
    }
  } else if (error.request) {
    // Request made but no response
    errorMessage = MESSAGES.NETWORK_ERROR;
  } else if (error.message) {
    errorMessage = error.message;
  }

  return showErrorAlert(errorMessage);
};
