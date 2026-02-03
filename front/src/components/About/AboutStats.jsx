import React, { useState, useEffect } from "react";
import { Users, BookOpen, Target, Clock } from "lucide-react";
import { API_BASE_URL } from "../../config";


export default function AboutStats() {
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

  const statsDisplay = [
    { icon: Users, value: `${stats.students.toLocaleString()}+`, label: "Active Students" },
    { icon: BookOpen, value: `${stats.courses.toLocaleString()}+`, label: "Complete Courses" },
    { icon: Target, value: `${stats.lessons.toLocaleString()}+`, label: "Total Lessons" },
    { icon: Clock, value: `${stats.hours.toLocaleString()}+`, label: "Total Hours" },
  ];

  return (
    <section className="py-10 bg-white/10 dark:bg-slate-900 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {statsDisplay.map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={i}
              className={[
                "rounded-2xl p-5 border shadow-sm bg-[#edf4f5] dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300",
                "hover:shadow-md hover:-translate-y-1 group",
              ].join(" ")}
            >
              <div className="flex items-center gap-4">
                {/* Icon box */}
                <div
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all duration-300",
                    "group-hover:bg-emerald-500 group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="w-7 h-7" />
                </div>

                {/* Value + label */}
                <div className="flex-1">
                  <div className="text-[22px] sm:text-[24px] font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-gray-400">
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
