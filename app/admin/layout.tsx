"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: TrendingUp },
    { href: "/admin/users", label: "Users Governance", icon: Users },
    { href: "/admin/companies", label: "Partner Companies", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 border-r border-[#3B3588]/10 bg-white p-6 flex flex-col justify-between shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-[#3B3588]/10 shadow-sm transition-transform group-hover:scale-105">
                <Image
                  src="/logo.jpg"
                  alt="VIC Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="font-black text-sm tracking-tight text-[#1E1B4B] uppercase">
                  VIC SuperAdmin
                </div>
                <div className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Master Node
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
              SA
            </div>
            <div>
              <div className="font-bold text-xs text-[#1E1B4B]">Master Governance</div>
              <div className="text-[10px] text-red-700 font-semibold">SuperAdmin Role</div>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-bold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                    isActive
                      ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                      : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div>
              <div className="text-xs font-bold text-[#1E1B4B]">Super Admin</div>
              <div className="text-[10px] text-slate-400">superadmin@vic.edu</div>
            </div>
          </div>
          <Link href="/" className="p-2 text-slate-400 hover:text-red-600 transition" title="Logout">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-18 px-4 sm:px-8 border-b border-[#3B3588]/10 bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#202960] hover:bg-[#EDF0FF] transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="hidden sm:inline">Administration</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-[#1E1B4B] capitalize">
                {pathname?.split("/").pop() || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ATS Microservices Online
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}