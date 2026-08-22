"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoImg from "../public/logo.jpg";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About Us", href: "#about" },
  { name: "Gallery", href: "#gallery" },
  { name: "Contact Us", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 bg-[#F8F9FD]/90 backdrop-blur-md border-b border-[#3B3588]/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link
          href="#home"
          onClick={closeMenu}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent group-hover:scale-105 transition-transform shrink-0">
            <Image
              src={logoImg}
              alt="Visionary Interns Club Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          <span className="text-base sm:text-lg font-black text-[#1E1B4B] tracking-tight uppercase whitespace-nowrap">
            Visionary Interns Club
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-bold text-xs xl:text-sm text-[#1E1B4B]/70">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:text-[#1E1B4B] transition-colors whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/signin"
            className="px-4 py-2.5 text-[#2E2A72] text-sm font-bold rounded-full hover:bg-[#E5E9FF] transition-all whitespace-nowrap"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="px-5 py-2.5 bg-[#2E2A72] hover:bg-[#3B3588] text-white text-sm font-bold rounded-full shadow-lg shadow-[#2E2A72]/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl text-[#2E2A72] hover:bg-[#E5E9FF] transition"
        >
          {open ? (
            <X size={28} strokeWidth={2.5} />
          ) : (
            <Menu size={30} strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="md:hidden absolute left-3 right-3 top-[72px] rounded-3xl border border-[#3B3588]/10 bg-[#F8F9FD] p-5 shadow-2xl">
          <nav className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className="rounded-2xl px-4 py-3 font-bold text-[#1E1B4B] hover:bg-[#E5E9FF]"
              >
                {item.name}
              </Link>
            ))}

            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#3B3588]/10 pt-4">
              <Link
                href="/signin"
                onClick={closeMenu}
                className="rounded-full border border-[#2E2A72]/20 px-4 py-3 text-center font-bold text-[#2E2A72]"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                onClick={closeMenu}
                className="rounded-full bg-[#2E2A72] px-4 py-3 text-center font-bold text-white"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}