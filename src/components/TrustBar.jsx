import { motion } from "framer-motion";

function Stat({ label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-white shadow-md rounded-2xl py-6 px-4 hover:shadow-xl transition-all duration-300"
    >
      <h3 className="text-3xl font-extrabold text-[#00cc8f]">{value}</h3>
      <p className="text-gray-700 font-medium mt-2">{label}</p>
    </motion.div>
  );
}

function TrustBar() {
  return (
    <section className="py-10 ">
       
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <Stat label="Learners" value="10,000+" />
        <Stat label="Courses" value="200+" />
        <Stat label="Avg. Rating" value="4.9★" />
        <Stat label="Hiring Partners" value="50+" />
      </div>
    </section>
  );
}

export default TrustBar;
