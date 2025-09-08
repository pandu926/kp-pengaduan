"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session?.user.role == "USER") {
      router.push("/user/dashboard");
    } else {
      return;
    }
  });
  console.log(session);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg text-center animate-fade-in-down">
        <h1 className="text-3xl font-extrabold mb-3 text-gray-800">
          Selamat Datang
        </h1>
        <p className="text-md text-gray-600 mb-8">
          Login dengan akun Google untuk melanjutkan
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/user/dashboard" })}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-4 rounded-2xl hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-2xl active:scale-95"
        >
          <FcGoogle size={24} />
          Login dengan Google
        </button>
      </div>
    </div>
  );
}
