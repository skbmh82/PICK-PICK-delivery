"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user    = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const router  = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-pick-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[430px] mx-auto min-h-screen bg-white">
        {children}
      </div>
    </div>
  );
}
