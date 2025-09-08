"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [laporan, setLaporan] = useState<any>([]);

  return <div>DashboardPage</div>;
}
