import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function TopInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("http://localhost:4002/instructors");
        if (!res.ok) throw new Error("Failed to fetch instructors");
        const data = await res.json();
        setInstructors(data);
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

  const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="relative py-20 bg-[#edf4f5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-[28px] md:text-4xl font-extrabold text-emerald-600 drop-shadow-sm">
            Meet Our Top Instructors
          </h2>
          <div className="mt-4 h-1 w-24 bg-emerald-500 mx-auto rounded-full" />
          <p className="mt-4 text-gray-600 text-lg">
            Learn from the best minds shaping the future of web development.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.map((instructor, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative rounded-3xl bg-white/60 backdrop-blur-xl border border-emerald-100 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-emerald-300 transition-all duration-500"
            >
              <div className="relative">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-64 object-cover rounded-t-3xl transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-emerald-700">
                  {instructor.name}
                </h3>
                <p className="text-gray-500 mb-4">
                  {instructor.instructorTitle}
                </p>

                {/* ✅ View Details Button */}
                <Link
                  to={`/instructor/${createSlug(instructor.name)}`}
                  className="bg-emerald-500 cursor-pointer text-white font-medium px-4 py-2 rounded-full text-sm shadow hover:bg-emerald-600 transition-all"
                >
                  View Details
                </Link>
              </div>

              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
                Instructor
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
