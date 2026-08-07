import Link from "next/link";

const services = [
  { num: "01", title: "Internship Search", desc: "Discover curated internship opportunities that align with your interests and skills." },
  { num: "02", title: "Learning & Practice", desc: "Build practical skills through hands-on projects and guided learning." },
  { num: "03", title: "Mentorship", desc: "Get guidance from experienced professionals and mentors." },
  { num: "04", title: "Skill Verification", desc: "Showcase your strengths through projects, assessments, and certifications." },
  { num: "05", title: "Community Hub", desc: "Connect with ambitious peers and grow your professional network." },
];

export default function ExploreVIC() {
  return (
    <section id="internship-search" className="py-20">
      <div className="container-vic">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="font-bold uppercase tracking-[0.2em] text-[#1677FF]">Explore VIC</div>
            <h2 className="text-3xl font-black text-[#1E1B4B] mt-2">Find your next opportunity</h2>
            <p className="text-sm font-semibold text-[#1E1B4B]/60 mt-2">Explore pathways built for student growth and career preparation.</p>
          </div>
          <Link href="/signup" className="text-xs font-bold text-[#2E2A72] hover:underline">Create your profile →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item) => (
            <div key={item.num} className="bg-[#E5E9FF]/70 hover:bg-[#D9DFFF] rounded-[2rem] p-7 transition-all hover:-translate-y-1 flex flex-col justify-between min-h-48 border border-white/60">
              <div>
                <span className="text-4xl font-black text-[#3B3588]/20 block mb-2">{item.num}</span>
                <h3 className="text-lg font-black text-[#1E1B4B]">{item.title}</h3>
                <p className="text-xs font-medium text-[#1E1B4B]/70 mt-2 leading-relaxed">{item.desc}</p>
              </div>
              <Link href="/signup" className="text-xs font-bold text-[#3B3588] text-right mt-5">Get started →</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
