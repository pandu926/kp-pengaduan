"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    if (session?.user.role == "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      return;
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      kataSandi,
    });

    if (res?.ok && res?.error === undefined) {
      setSuccess("Login berhasil! Mengalihkan...");
      setTimeout(() => router.push("/admin/dashboard"), 1500);
    } else {
      setError("Email atau kata sandi salah.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Login Admin
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kata Sandi
            </label>
            <input
              type="password"
              value={kataSandi}
              onChange={(e) => setKataSandi(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-lg font-semibold transition duration-300"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-gray-400">
          Sisitem Pemesanan CV Arfilla Jaya Putra
        </p>
      </div>
    </div>
  );
}
