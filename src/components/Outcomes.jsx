import { motion } from "framer-motion";

export default function Outcomes() {
  const stats = [
    { value: "87%", label: "Course completion rate" },
    { value: "72%", label: "Landed a tech job" },
    { value: "+28%", label: "Avg. salary uplift" },
  ];

  return (
    <section className="py-16 bg-[#edf4f5]  border-gray-200 hover:border-emerald-400 overflow-hidden  lg:m-0 md:m-0 m-4">
    
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl text-emerald-600 font-extrabold text-center mb-12">
          Student Outcomes
        </h2>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 text-center">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="p-6 bg-[#edf4f5] border border-gray-200 hover:border-emerald-400 backdrop-blur-md rounded-2xl shadow-md  transition"
            >
              <h3 className="text-5xl font-extrabold text-emerald-600 drop-shadow-sm">
                {item.value}
              </h3>
              <p className="mt-2 text-emerald-600 font-medium text-lg">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
