"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-white text-black">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <AdminSidebar />
      <main className="flex-1 min-h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
