import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { getImageUrl } from "../../utils/format";

export default function TopInstructors() {
  const { instructors } = useData();
  const navigate = useNavigate();

  const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="relative py-20 bg-white/10 dark:bg-slate-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-[28px] md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
            Meet Our Top Instructors
          </h2>
          <div className="mt-4 h-1 w-24 bg-emerald-500 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
            Learn from the best minds shaping the future of web development.
          </p>
        </div>

        <div className="grid  gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.filter(ins => ins.isActive !== false).map((instructor, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative rounded-3xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800 shadow-xl overflow-hidden group hover:shadow-2xl hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="relative overflow-hidden">
                <img
                  src={getImageUrl(instructor.image)}
                  alt={instructor.name}
                  className="w-full h-64 object-cover rounded-t-3xl transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {instructor.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm font-medium">
                  {instructor.instructorTitle}
                </p>

                {/* ✅ View Details Button */}
                <Link
                  to={`/instructor/${createSlug(instructor.name)}`}
                  className="inline-flex items-center justify-center bg-emerald-500 dark:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  View Details
                </Link>
              </div>

              <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                Instructor
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
