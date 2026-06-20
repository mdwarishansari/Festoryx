import { redirect } from "next/navigation";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  if (!isSuperAdmin(user)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f23]">
      {/* Sidebar */}
      <AdminSidebar
        adminName={user.name}
        adminEmail={user.email}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
