import React from "react";
import { Users, BookOpen, Target, Heart } from "lucide-react";

export default function AboutStats() {
  const stats = [
    { icon: Users, value: "300+", label: "Active Students" },
    { icon: BookOpen, value: "15", label: "Complete Courses" },
    { icon: Target, value: "800+", label: "Total Lessons" },
    { icon: Heart, value: "1", label: "Active Community" },
  ];

  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={i}
              className={[
                "rounded-2xl p-5 border shadow-sm bg-[#edf4f5]  border-gray-200 hover:border-emerald-400 transition-all duration-300",
                "hover:shadow-md hover:-translate-y-1 group",
              ].join(" ")}
            >
              <div className="flex items-center gap-4">
                {/* Icon box */}
                <div
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    "bg-emerald-50 text-emerald-600 transition-all duration-300",
                    "group-hover:bg-emerald-500 group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="w-7 h-7" />
                </div>

                {/* Value + label */}
                <div className="flex-1">
                  <div className="text-[22px] sm:text-[24px] font-extrabold text-emerald-600 leading-none">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.label}
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
