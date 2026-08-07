"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Why Us", href: "#why-us" },
  { label: "Internship Search", href: "#internship-search" },
  { label: "Student Skill Up", href: "#student-skill-up" },
  { label: "Contact Us", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 bg-[#F8F9FD]/90 backdrop-blur-md border-b border-[#3B3588]/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="#home" onClick={closeMenu} className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 rounded-2xl bg-[#D9DFFF] flex items-center justify-center font-black text-[#2E2A72] text-xl shadow-sm group-hover:scale-105 transition-transform">
            V
          </div>
          <span className="text-lg sm:text-xl font-black text-[#1E1B4B] tracking-tight uppercase">
            VISIONARY<span className="text-[#3B3588]">.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 font-bold text-xs xl:text-sm text-[#1E1B4B]/70">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#2E2A72] transition-colors whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/signin" className="px-4 py-2.5 text-[#2E2A72] text-sm font-bold rounded-full hover:bg-[#E5E9FF] transition-all">
            Sign In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 bg-[#2E2A72] hover:bg-[#3B3588] text-white text-sm font-bold rounded-full shadow-lg shadow-[#2E2A72]/20 hover:scale-105 active:scale-95 transition-all">
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl text-[#2E2A72] hover:bg-[#E5E9FF] transition"
        >
          {open ? <X size={28} strokeWidth={2.5} /> : <Menu size={30} strokeWidth={2.5} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute left-3 right-3 top-[72px] rounded-3xl border border-[#3B3588]/10 bg-[#F8F9FD] p-5 shadow-2xl">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu} className="rounded-2xl px-4 py-3 font-bold text-[#1E1B4B] hover:bg-[#E5E9FF]">
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#3B3588]/10 pt-4">
              <Link href="/signin" onClick={closeMenu} className="rounded-full border border-[#2E2A72]/20 px-4 py-3 text-center font-bold text-[#2E2A72]">
                Sign In
              </Link>
              <Link href="/signup" onClick={closeMenu} className="rounded-full bg-[#2E2A72] px-4 py-3 text-center font-bold text-white">
                Sign Up
              </Link>
            </div>
            <Link href="/" className="flex items-center gap-3">
  <img
    src="/logo.png"
    alt="Visionary Interns Club Logo"
    className="h-12 w-12 object-contain"
  />

  <span className="text-xl md:text-2xl font-bold tracking-tight text-[#352b70]">
    VISIONARY INTERNS CLUB
  </span>
</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
