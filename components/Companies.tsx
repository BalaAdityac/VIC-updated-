"use client";

import { Building2, Users, BarChart3, Search } from "lucide-react";

export default function Companies() {
  return (
    <section id="companies" className="py-28">
      <div className="container-vic">
        <div className="glass overflow-hidden rounded-[3rem] p-8 md:p-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            
            <div>
              <div className="font-bold uppercase tracking-[0.2em] text-[#1677FF]">
                For Companies
              </div>

              <h2 className="section-title mt-4">
                Meet the{" "}
                <span className="gradient-text">
                  next generation.
                </span>
              </h2>

              <p className="mt-6 leading-8 text-[#60758A]">
                Connect with ambitious students, discover emerging talent,
                and build your future workforce through the VIC ecosystem.
              </p>

              <a
                href="#contact"
                className="gradient-button mt-8 inline-block rounded-full px-7 py-4 font-bold text-white"
              >
                Become a Hiring Partner
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                [Building2, "Post Opportunities"],
                [Users, "Find Talent"],
                [Search, "Discover Skills"],
                [BarChart3, "Track Candidates"],
              ].map(([Icon, text]) => (
                <div
                  key={text as string}
                  className="rounded-3xl bg-gradient-to-br from-[#EAF8FF] to-[#F0EDFF] p-7"
                >
                  <Icon
                    className="text-[#1677FF]"
                    size={30}
                  />

                  <div className="mt-8 font-black">
                    {text as string}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}