import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SuperAdminLoginPage() {
  const user = await getCurrentUser();
  if (user) {
    if (isSuperAdmin(user)) {
      redirect("/superadmin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030014] text-[#f4f0ff] p-4 font-sans">
      {/* Stars Background Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(rgba(244, 240, 255, 0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="w-full max-w-md bg-[#060317] border border-white/5 rounded-[16px] p-8 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] relative overflow-hidden text-center">
        {/* Accent strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9382ff] to-transparent"></div>
        
        {/* Brand Icon/Logo */}
        <div className="h-16 w-16 mx-auto mb-6 overflow-hidden rounded-[16px] border border-white/10 flex items-center justify-center bg-[#10093a]/40 shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]">
          <img src="/Logo.gif" alt="Festoryx Logo" className="h-10 w-10 object-contain rounded-2xl" />
        </div>
        
        <h1 className="text-2xl font-medium tracking-tight text-white mb-2 font-heading">Super Admin Portal</h1>
        <p className="text-sm text-[#918ea0] mb-8 max-w-xs mx-auto leading-relaxed">
          Access the Festoryx platform control console. Restricted to authorized administrators only.
        </p>
        
        <Link
          href="/sign-in?forceRedirectUrl=/superadmin"
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-[#9382ff] hover:bg-[#816eff] text-sm font-semibold text-white transition-all shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)] hover:shadow-indigo-500/20"
        >
          <span>Authenticate with Clerk</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        
        <div className="mt-6 flex justify-between items-center text-[10px] text-[#54525f] uppercase tracking-wider border-t border-white/5 pt-4">
          <span>Secure Connection</span>
          <span>Authorized Only</span>
        </div>
      </div>
    </div>
  );
}
