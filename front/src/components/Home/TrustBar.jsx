import { motion } from "framer-motion";
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

  // 🔥 CALCULATE REAL DATA FROM DATABASE
  const totalEnrolled = courses.reduce((sum, course) => sum + (course.enrolledCount || 0), 0);
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
          value={`${totalEnrolled.toLocaleString()}+`}
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
