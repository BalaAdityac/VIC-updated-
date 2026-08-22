import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#D9DFFF] text-[#1E1B4B] pt-6 pb-4 px-4 mt-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center pb-6 border-b border-[#2E2A72]/10">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3B3588]">VISIONARY INTERNS CLUB</p>
          <h3 className="text-2xl font-black">Your future starts with one step</h3>
          <p className="text-xs font-medium text-[#1E1B4B]/70">Create your profile and explore internships, skill-building, and career opportunities.</p>
          <Link href="/signup" className="inline-block px-6 py-3 bg-[#2E2A72] text-white font-bold text-xs rounded-full shadow-md hover:scale-105 transition-all">Apply for Opportunity</Link>
        </div>

        <div className="space-y-2 text-xs font-semibold text-[#1E1B4B]/80 md:text-right">
          <p className="font-black text-sm">Contact Us</p>
          <p>📍 Bengaluru, Karnataka, India</p>
          <p>✉️ hello@visionaryinternsclub.com</p>
          <p>🌐 Visionary Interns Club</p>
          <div className="pt-2 flex gap-4 md:justify-end">
            <a href="mailto:hello@visionaryinternsclub.com" className="font-black text-[#2E2A72] hover:underline">Email Us</a>
            <Link href="/signup" className="font-black text-[#2E2A72] hover:underline">Join VIC</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-[#1E1B4B]/60 gap-4">
        <div>© 2026 Visionary Interns Club. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
}
