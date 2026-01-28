import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useData } from "../../contexts/DataContext";

function Stat({ label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-[#edf4f5] border border-gray-200 hover:border-emerald-400 shadow-md rounded-2xl py-6 px-4 hover:shadow-xl transition-all duration-300"
    >
      <h3 className="text-3xl font-extrabold text-[#00cc8f]">{value}</h3>
      <p className="text-gray-700 font-medium mt-2">{label}</p>
    </motion.div>
  );
}

function TrustBar() {
  const { courses } = useData();
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

  // Calculate total courses
  const totalCourses = courses.length;

  // Calculate average rating (assuming courses have a rating field)
  const avgRating = courses.length > 0
    ? (courses.reduce((sum, course) => sum + (course.rating || 4.9), 0) / courses.length).toFixed(1)
    : "4.9";

  return (
    <section className="py-10 ">

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <Stat
          label="Learners"
          value={`${stats.students.toLocaleString()}+`}
        />
        <Stat
          label="Courses"
          value={`${totalCourses}+`}
        />
        <Stat
          label="Avg. Rating"
          value={`${avgRating}★`}
        />
        <Stat
          label="Hiring Partners"
          value="50+"
        />
      </div>
    </section>
  );
}

export default TrustBar;
