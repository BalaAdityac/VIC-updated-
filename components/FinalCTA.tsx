import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className=" py-20">
      <div className="container-vic">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#FFF1F7] via-[#F4EEFF] to-[#E8F0FF] p-10 text-center text-[#1E1B4B] md:p-20">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
          <div className="relative">
            {/* <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black backdrop-blur"></div> */}
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Launch your dream</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#1E1B4B]/80">Create your VIC profile and take the first step toward learning, building, connecting, and discovering your next internship opportunity.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="rounded-full bg-white px-8 py-4 font-black text-[#1677FF] shadow-xl transition hover:-translate-y-1">Apply for Opportunity</Link>
              <Link href="#contact" className="rounded-full bg-white/80 px-8 py-4 font-black  text-[#1677FF] shadow-xl transition hover:translate-y-1">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
