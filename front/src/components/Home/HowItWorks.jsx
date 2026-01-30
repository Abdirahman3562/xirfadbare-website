import React from "react";
import { motion } from "framer-motion";

export default function HowItWorks() {

  const steps = [
    {
      step: 1,
      title: "Create an Account",
      description: "Sign up easily for free and get your own personal account."
    },
    {
      step: 2,
      title: "Choose Your Goal",
      description: "Select what you want to learn or improve based on your goals."
    },
    {
      step: 3,
      title: "Learn & Practice",
      description: "Access lessons, guidance, and activities that help you learn effectively."
    },
    {
      step: 4,
      title: "Achieve & Grow",
      description: "Complete your journey, gain confidence and skills, and apply them in real life."
    },
  ];

  return (
    <section id="how-it-works" className="py-16 transition-colors duration-500">

      <div className="max-w-7xl mx-auto px-6">
        <Header title="How It Works" />
        <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="rounded-2xl bg-[#edf4f5] dark:bg-slate-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-500 p-6 shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="w-10 h-10 grid place-content-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold">
                {s.step || i + 1}
              </div>
              <h3 className="mt-4 font-bold text-lg text-gray-800 dark:text-white">{s.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{s.description}</p>
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
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#00cc8f] dark:text-emerald-400">
          {title}
        </h2>
        <div className="mt-2 h-1 w-24 bg-[#00cc8f] dark:bg-emerald-500 rounded-full mx-auto sm:mx-0" />
      </div>
    </div>
  );
}
