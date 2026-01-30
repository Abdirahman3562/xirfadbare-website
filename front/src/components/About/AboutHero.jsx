import React from "react";


export default function AboutHero() {
  // const { settings } = useData(); // Removed
  const about = {
    badge: "⭐ Transform Your Future",
    title: null, // use default
    description: "We help Somali learners develop skills, confidence, and opportunities through accessible, structured learning in Af-Soomaali."
  };

  return (
    <section className="relative pt-28  sm:pt-28 bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-6 text-center ">
        {/* Badge */}
        <div className="inline-block mb-5 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm border border-emerald-100 dark:border-emerald-500/20">
          {about.badge || "⭐ #Transform Your Future"}
        </div>

        {/* Title */}
        <h1 className="text-[20px] p-2  sm:text-[26px] md:text-[45px] lg:leading-14 md:leading-14 leading-10 font-extrabold  text-gray-900 dark:text-white">
          {about.title || (
            <>
              Empowering Somali Learners
              <br className="hidden sm:block" />
              <span className="text-emerald-500">for the Future</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          {about.description || "Xirfadbare gives Somali youth and diaspora a clear, structured path to learn coding and AI — in their own language (Af-Soomaali)."}
        </p>
      </div>
    </section>
  );
}
