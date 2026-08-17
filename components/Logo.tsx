import Image from "next/image";
import Link from "next/link";
import logoImg from "../public/logo.jpg";

interface LogoProps {
  className?: string;
  showText?: boolean;
  href?: string;
}

export default function Logo({ className = "", showText = true, href = "/" }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-3 group ${className}`}>
      <div className="relative w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-[#3B3588]/10 shadow-sm transition-transform group-hover:scale-105">
        <Image
          src={logoImg}
          alt="Visionary Interns Club Logo"
          width={44}
          height={44}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="text-lg sm:text-xl font-black text-[#1E1B4B] tracking-tight uppercase">
          Visionary Interns Club
        </span>
      )}
    </Link>
  );
}