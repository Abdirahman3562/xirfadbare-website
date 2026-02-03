import React, { useState, useEffect } from "react";
import { Target, Lightbulb, Users, BookOpen, GraduationCap, Clock } from "lucide-react";
import { API_BASE_URL } from "../../config";


export default function MissionVision() {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    lessons: 0,
    hours: 0
  });

  // Fetch platform statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const data = [
    {
      icon: Target,
      title: "Our Mission",
      subtitle: "Empowering Every Somali to Thrive",
      desc: `To create opportunities and provide knowledge that enables every Somali to grow, succeed, and contribute — wherever they are.`,
      stat1: `${stats.students.toLocaleString()}+`,
      label1: "Students",
      icon1: Users,
      stat2: `${stats.courses.toLocaleString()}+`,
      label2: "Courses",
      icon2: BookOpen,
    },
    {
      icon: Lightbulb,
      title: "Our Vision",
      subtitle: "A Thriving Somalia for All",
      desc: `A future where Somali talent leads, innovates, and prospers across all fields — without barriers of language, location, or resources.`,
      stat1: `${stats.lessons.toLocaleString()}+`,
      label1: "Lessons",
      icon1: GraduationCap,
      stat2: `${stats.hours.toLocaleString()}+`,
      label2: "Hours",
      icon2: Clock,
    },
  ];

  return (
    <section className="py-16 bg-white/10 dark:bg-slate-900 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        {data.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={[
                "rounded-2xl p-6 border border-emerald-100 dark:border-slate-800 bg-white/10 dark:bg-slate-900 transition-all duration-300 shadow-sm group hover:bg-emerald-50/80 dark:hover:bg-emerald-500/10 hover:-translate-y-1 hover:shadow-md",
              ].join(" ")}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={[
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">{item.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 dark:text-gray-300 text-sm mb-2 leading-relaxed">
                {item.desc}
              </p>
              <p className="text-slate-500 dark:text-gray-400 text-[13px] italic mb-6 leading-snug">
                {item.descSo}
              </p>

              {/* Stats with Icons */}
              <div className="flex items-center gap-8 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 transition-colors">
                    {React.createElement(item.icon1, { className: "w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" })}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {item.stat1}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">
                      {item.label1}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 transition-colors">
                    {React.createElement(item.icon2, { className: "w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" })}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {item.stat2}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">
                      {item.label2}
                    </div>
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
