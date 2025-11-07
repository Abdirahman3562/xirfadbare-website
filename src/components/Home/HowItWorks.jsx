import React from "react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    { t: "Create account", d: "Join for free and set your goals." },
    { t: "Pick a path", d: "Choose a track or individual courses." },
    { t: "Build projects", d: "Learn by doing with real tasks." },
    { t: "Get certified", d: "Finish, earn certificate, apply!" },
  ];

  return (
    <section id="how-it-works" className="py-16">
     
      <div className="max-w-7xl mx-auto px-6">
        <Header title="How It Works"  />
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="rounded-2xl bg-[#edf4f5] border border-gray-200 hover:border-emerald-400 p-6 shadow hover:shadow-lg transition"
            >
              <div className="w-10 h-10 grid place-content-center rounded-full bg-emerald-600 text-white font-bold">
                {i + 1}
              </div>
              <h3 className="mt-4 font-bold text-lg text-gray-800">{s.t}</h3>
              <p className="text-gray-600 mt-2">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Header({ title }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-center sm:text-left">
      <div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#00cc8f]">
          {title}
        </h2>
        <div className="mt-2 h-1 w-24 bg-[#00cc8f] rounded-full mx-auto sm:mx-0" />
      </div>
    </div>
  );
}
