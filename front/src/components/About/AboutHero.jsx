import React from "react";
import { useData } from "../../contexts/DataContext";

export default function AboutHero() {
  const { settings } = useData();
  const about = settings?.about || {};

  return (
    <section className="relative pt-28  sm:pt-28 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center ">
        {/* Badge */}
        <div className="inline-block mb-5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-sm border border-emerald-100">
          {about.badge || "⭐ #1 Somali Coding Platform"}
        </div>

        {/* Title */}
        <h1 className="text-[25px] p-2  sm:text-[26px] md:text-[46px] lg:leading-14 md:leading-14 leading-10 font-extrabold  text-gray-900">
          {about.title || (
            <>
              Building Real Opportunities <br className="hidden sm:block" />
              <span className="text-emerald-500">for Somalis Through Tech</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-gray-600 text-lg max-w-2xl mx-auto">
          {about.description || "Xirfadbare gives Somali youth and diaspora a clear, structured path to learn coding and AI — in their own language (Af-Soomaali)."}
        </p>
      </div>
    </section>
  );
}
