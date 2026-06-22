import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen bg-[#0f0f23]">
      {/* Sidebar */}
      <AdminSidebar
        adminName={user.name}
        adminEmail={user.email}
        adminRole={user.role}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
