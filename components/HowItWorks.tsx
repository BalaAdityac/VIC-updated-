"use client";

import { motion } from "framer-motion";

const steps = [
  ["01", "Register", "Create your VIC profile."],
  ["02", "Choose", "Find a program or opportunity."],
  ["03", "Learn", "Build skills through practical learning."],
  ["04", "Build", "Complete projects and challenges."],
  ["05", "Launch", "Apply and start your career journey."],
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28">
      <div className="container-vic">
        <div className="rounded-[3rem] bg-gradient-to-br from-[#DDF7FF] via-[#EFFFFA] to-[#EEE8FF] p-8 md:p-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="font-bold uppercase tracking-[0.2em] text-[#1677FF]">
              Simple Process
            </div>

            <h2 className="section-title mt-4">
              Your journey starts{" "}
              <span className="gradient-text">
                here.
              </span>
            </h2>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-5">
            {steps.map((step, index) => (
              <motion.div
                key={step[0]}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-3xl bg-white/70 p-6 backdrop-blur"
              >
                <div className="text-sm font-black text-[#1677FF]">
                  {step[0]}
                </div>

                <h3 className="mt-5 font-black">
                  {step[1]}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#60758A]">
                  {step[2]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}