import React from "react";
import { Target, Lightbulb } from "lucide-react";

export default function MissionVision() {
  const data = [
    {
      icon: Target,
      title: "Our Mission",
      subtitle: "Building Somalia’s Tech Future",
      desc: `To make world-class tech education accessible and understandable to every Somali — wherever they are.`,
      descSo: `Inaan wacyigelinno fursadoyoinkii iyo barashada sare u fidinno qof kasta oo Af-Soomaali ah u garanaya Somalil kadib — meel kasta oo uu joogo.`,
      stat1: "300+",
      label1: "Students",
      stat2: "15",
      label2: "Courses",
    },
    {
      icon: Lightbulb,
      title: "Our Vision",
      subtitle: "A Tech-Enabled Somalia",
      desc: `A future where Somali talent builds, leads, and shapes global technology — without language being a barrier.`,
      descSo: `Mustaqbal ay Soomaalidu kaalin xoogan kaga leedahay horumarinta tiknoolajiyadda caalamka — iyadoon luqaddu ayan caqabad ahayn.`,
      stat1: "800+",
      label1: "Lessons",
      stat2: "200+",
      label2: "Hours",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        {data.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={[
                "rounded-2xl p-6 border border-emerald-100 bg-white/70 transition-all duration-300 shadow-sm group hover:bg-emerald-50/80 hover:-translate-y-1 hover:shadow-md",
              ].join(" ")}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={[
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-sm mb-2 leading-relaxed">
                {item.desc}
              </p>
              <p className="text-slate-500 text-[13px] italic mb-6 leading-snug">
                {item.descSo}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-2">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {item.stat1}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.label1}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {item.stat2}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.label2}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
