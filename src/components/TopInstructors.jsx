import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TopInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("http://localhost:3000/courses");
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();

        // Extract unique instructors from all courses
        const uniqueInstructors = [];
        const seen = new Set();
        data.forEach((course) => {
          const i = course.instructor;
          if (i && !seen.has(i.name)) {
            seen.add(i.name);
            uniqueInstructors.push(i);
          }
        });

        setInstructors(uniqueInstructors);
      } catch (error) {
        console.error("❌ Error fetching instructors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-emerald-600">
        Loading instructors...
      </div>
    );
  }

  return (
    <section className="relative py-20 bg-[#edf4f5]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-[28px] md:text-4xl font-extrabold text-emerald-600 drop-shadow-sm">
            Meet Our Top Instructors
          </h2>
          <div className="mt-4 h-1 w-24 bg-emerald-500 mx-auto rounded-full" />
          <p className="mt-4 text-gray-600 text-lg">
            Learn from the best minds shaping the future of web development.
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.map((instructor, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative rounded-3xl bg-white/60 backdrop-blur-xl border border-emerald-100 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-emerald-300 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-64 object-cover rounded-t-3xl transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl"></div>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 w-full text-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <h3 className="text-emerald-600 text-xl font-semibold">
                  {instructor.name}
                </h3>
                <p className="text-emerald-600 text-sm mt-1">
                  {instructor.instructorTitle}
                </p>
              </div>

              {/* Static info (visible by default) */}
              <div className="p-6 text-center group-hover:opacity-0 transition-opacity duration-500">
                <h3 className="text-xl font-semibold text-emerald-700">
                  {instructor.name}
                </h3>
                <p className="text-gray-500">{instructor.instructorTitle}</p>
              </div>

              {/* Floating badge */}
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
                Instructor
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Soft Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/30 to-transparent pointer-events-none"></div>
    </section>
  );
}
