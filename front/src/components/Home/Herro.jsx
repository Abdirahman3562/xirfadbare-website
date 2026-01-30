import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import herro from "../../assets/herro1.jpeg";
import { Star } from "lucide-react";

export default function Herro({
  title: propTitle,
  subtitle: propSubtitle,
  primaryCta = { label: "Browse Courses", to: "/courses" },
  secondaryCta = { label: "Daawo Koorsooyinka", to: "/courses" },
}) {
  const [stats, setStats] = useState({ students: 0, instructors: 0 });

  // Fetch platform statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const title = propTitle || (
    <>
      Upgrade Your Skills. <span className="text-emerald-500">Change Your Future.</span>
    </>
  );

  const subtitle = propSubtitle || "Transform Your Future";

  return (
    <section className="relative  dark:bg-slate-900 overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 md:gap-12">
        {/* LEFT CONTENT */}
        <div className="relative z-10 text-center lg:text-left">
          {/* Subtitle Badge */}
          <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm border border-emerald-100 dark:border-emerald-500/20 mb-4 sm:mb-0">
            {subtitle}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6 mt-3 sm:mt-4 px-2 sm:px-0 lg:ml-3">
            {title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg lg:ml-4   px-2 sm:px-0">
            Make learning and teaching more effective with active participation and student collaboration.
          </p>

          {/* CTA Button */}
          <Link
            to={primaryCta.to}
            className="inline-block  ml-4 px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition font-semibold text-base sm:text-lg"
          >
            {primaryCta.label}
          </Link>

        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center items-center mt-8 lg:mt-10 min-h-[300px] sm:min-h-[400px] lg:min-h-0">
          {/* Organic Blob Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-[40%_60%_70%_30%/60%_30%_70%_40%] blur-2xl"></div>

          {/* Dot Pattern Grid (Top Right Corner) - Hidden on mobile */}
          <div className="hidden md:block absolute top-8 right-0 w-24 lg:w-32 h-24 lg:h-32 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="2" fill="#10b981" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          {/* Main Image with Custom Shape */}
          <div className="relative z-10 group">
            <img
              src={herro}
              alt="Online learning students"
              className="
      w-full max-w-[350px] sm:max-w-sm md:max-w-md lg:max-w-lg
      rounded-2xl lg:rounded-[2rem]
      shadow-2xl
      transition-all duration-500 ease-out
      group-hover:scale-105
      group-hover:-rotate-1
      group-hover:shadow-emerald-500/30
    "
            />
          </div>


          {/* Glassmorphism Card - Bottom Left (10k+ Students) */}
          <div className="absolute animate-bounce bottom-[-10px] sm:bottom-[-20px] left-[-20px] sm:left-[-40px] z-20 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-slate-800/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600">
                  {stats.students > 0 ? `${stats.students.toLocaleString()}+` : "0"}
                </div>
                <div className="text-[10px] sm:text-xs text-emerald-600 font-semibold">Active Students</div>
              </div>
            </div>
          </div>

          {/* Glassmorphism Card - Top Right (Expert Tutors) */}
          <div className="absolute animate-bounce top-[-20px] sm:top-[-40px] right-[-10px] sm:-right-4 z-20 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-slate-800/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl 
                bg-gradient-to-br from-emerald-500 to-emerald-600 
                flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600">
                  {stats.instructors > 0 ? `${stats.instructors.toLocaleString()}+` : "0"}
                </div>
                <div className="text-[10px] sm:text-xs text-emerald-600 font-semibold">Expert Tutors</div>
              </div>
            </div>
          </div>

          {/* Floating Icon - Book (Top Left) - Hidden on small mobile */}
          <div className="hidden sm:flex absolute top-1 left-4 sm:left-8 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-lg items-center justify-center animate-bounce">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          {/* Floating Icon - Play Button (Bottom Right) - Hidden on small mobile */}
          <div className="hidden animate-bounce sm:flex absolute bottom-[-10px] sm:bottom-[-20px] right-2 sm:right-4 z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-500 shadow-lg items-center justify-center hover:scale-110 transition-transform cursor-pointer">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Secondary Blob (Bottom) */}
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  );
}



