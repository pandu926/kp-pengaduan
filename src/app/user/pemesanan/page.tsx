import FormPengaduan from "@/components/user/FormPengaduan";
import { SessionProvider } from "next-auth/react";
export default function page() {
  return (
    <SessionProvider>
      <div>
        <FormPengaduan />
      </div>
    </SessionProvider>
  );
}
