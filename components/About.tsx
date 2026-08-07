import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function About() {
  return (
    <section id="about" className="py-28">
      <div className="container-vic">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="glass relative overflow-hidden rounded-[3rem] p-8 animate-fade-up">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-200/50 blur-3xl" />
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#DDF8FF] to-[#EDE8FF] p-10 min-h-[420px] flex flex-col justify-center">
              <Sparkles className="text-[#1677FF]" size={40} />
              <div className="mt-12 text-5xl sm:text-6xl font-black tracking-tight text-[#15324B]">Learn.</div>
              <div className="text-5xl sm:text-6xl font-black text-[#1677FF]">Grow.</div>
              <div className="text-5xl sm:text-6xl font-black text-[#20C8E8]">Lead.</div>
            </div>
          </div>

          <div className="animate-fade-up">
            <div className="mb-4 font-bold uppercase tracking-[0.2em] text-[#1677FF]">About Us</div>
            <h2 className="section-title">Where ambition meets <span className="gradient-text">opportunity.</span></h2>
            <p className="mt-6 text-lg leading-8 text-[#60758A]">
              Visionary Interns Club is a student-focused career community designed to turn potential into practical skills, meaningful experiences, and career opportunities.
            </p>
            <p className="mt-4 leading-7 text-[#60758A]">
              We bring together internships, skill development, mentorship, projects, certifications, and industry connections in one supportive ecosystem.
            </p>
            <Link href="#why-us" className="gradient-button mt-8 inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold text-white transition">
              Discover VIC <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
