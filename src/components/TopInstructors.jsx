import React from "react";
import { motion } from "framer-motion";

const instructors = [
  {
    id: 1,
    name: "Abdillahi Ahmed",
    expertise: "Full-Stack Developer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Amina Farah",
    expertise: "UI/UX Designer",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    id: 3,
    name: "Mohamed Ali",
    expertise: "Backend Engineer",
    image: "https://randomuser.me/api/portraits/men/64.jpg",
  },
  {
    id: 4,
    name: "Khadra Ibrahim",
    expertise: "Data Scientist",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

function TopInstructors() {
  return (
    <section className="py-16 bg-[#edf4f5">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#00cc8f]">
            Top Instructors
          </h2>
          <div className="mt-3 h-1 w-24 bg-[#00cc8f] mx-auto rounded-full" />
          <p className="mt-4 text-gray-600">
            Meet our industry experts guiding you to success.
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.map((instructor) => (
            <motion.div
              key={instructor.id}
              whileHover={{ y: -5 }}
              className="relative group bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Instructor Image */}
              <div className="relative">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Info */}
              <div className="absolute bottom-4 left-0 w-full text-center text-white opacity-0 group-hover:opacity-100 transition-all">
                <h3 className="text-lg font-bold">{instructor.name}</h3>
                <p className="text-sm opacity-90">{instructor.expertise}</p>
              </div>

              {/* Static Info for mobile */}
              <div className="p-4 text-center sm:hidden">
                <h3 className="text-lg font-bold text-gray-900">
                  {instructor.name}
                </h3>
                <p className="text-sm text-gray-500">{instructor.expertise}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TopInstructors;
