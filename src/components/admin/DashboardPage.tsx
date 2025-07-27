"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [laporan, setLaporan] = useState<any>([]);
  console.log(session);
  return <div>DashboardPage</div>;
}
