"use client";

import Link from "next/link";
import { FormEvent } from "react";

export default function SignInPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Sign in submitted. Connect this form to your authentication API.");
  };

  return (
    <main className="min-h-screen bg-[#F8F9FD] text-[#1E1B4B] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#D9DFFF] flex items-center justify-center font-black text-[#2E2A72] text-2xl">V</div>
          <span className="text-2xl font-black uppercase">VISIONARY<span className="text-[#3B3588]">.</span></span>
        </Link>
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-[#E5E9FF]">
          <h1 className="text-3xl font-black">Welcome back</h1>
          <p className="mt-2 text-sm text-[#60758A]">Sign in to continue your VIC journey.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm font-bold">Email
              <input required type="email" placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-[#D9DFFF] px-4 py-3 outline-none focus:ring-2 focus:ring-[#3B3588]/30" />
            </label>
            <label className="block text-sm font-bold">Password
              <input required type="password" placeholder="Enter your password" className="mt-2 w-full rounded-2xl border border-[#D9DFFF] px-4 py-3 outline-none focus:ring-2 focus:ring-[#3B3588]/30" />
            </label>
            <button type="submit" className="w-full rounded-2xl bg-[#2E2A72] py-4 font-bold text-white hover:bg-[#3B3588] transition">Sign In</button>
          </form>
          <p className="mt-6 text-center text-sm text-[#60758A]">Don&apos;t have an account? <Link href="/signup" className="font-black text-[#2E2A72]">Sign Up</Link></p>
          <Link href="/" className="mt-4 block text-center text-xs font-bold text-[#60758A] hover:underline">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
