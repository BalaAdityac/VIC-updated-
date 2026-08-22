"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  Loader2,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Partner Organizations",
      href: "/admin/companies",
      icon: Building2
    },
    {
      name: "Users Directory",
      href: "/admin/users",
      icon: Users
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#202960]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 border-r border-[#3B3588]/10 bg-white p-6 flex flex-col justify-between shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-[#3B3588]/10 shadow-sm transition-transform group-hover:scale-105 shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="VIC Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs tracking-tight text-[#1E1B4B] uppercase whitespace-nowrap">
                    Visionary Interns Club
                </div>
                <div className="text-[10px] font-bold text-[#3B3588] whitespace-nowrap">
                    SuperAdmin Portal
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#EDF0FF] border border-[#3B3588]/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                SA
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-[#1E1B4B]">SuperAdmin</div>
                <div className="text-[10px] text-purple-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Master Console
                </div>
              </div>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                    isActive
                      ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                      : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold text-xs flex items-center justify-center">
              SA
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#1E1B4B]">SuperAdmin</div>
              <div className="text-[10px] text-slate-400">admin@vic.edu</div>
            </div>
          </div>
          <Link
            href="/"
            className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
            title="Exit SuperAdmin Console"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden h-16 px-4 border-b border-[#3B3588]/10 bg-white flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-[#202960] hover:bg-[#EDF0FF] cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-black text-sm text-[#1E1B4B]">Admin Console</div>
          </div>
          <Link
            href="/"
            className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
            title="Exit"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}