import React from "react";
import { FaQuoteRight, FaStar } from "react-icons/fa";
import { useData } from "../../contexts/DataContext";

export default function Testimonials() {
  const { testimonials } = useData();

  // Filter only active testimonials (isActive === true) from database
  const activeTestimonials = testimonials.filter(t => t.isActive === true);

  return (
    <section className="py-20 ">
      <div className="max-w-7xl mx-auto px-6">
        {/* ✅ Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#00cc8f]">
            What Our Learners Say
          </h2>
          <div className="mt-2 h-1 w-24 bg-[#00cc8f] rounded-full mx-auto"></div>
        </div>

        {/* ✅ Testimonials Grid */}
        {activeTestimonials.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {activeTestimonials.map((t) => (
            <div
              key={t._id}
              className="bg-[#edf4f5] border border-gray-200 hover:border-emerald-400 rounded-2xl p-6 shadow-sm hover:shadow-md transition relative "
            >
              {/* ⭐ Stars */}
              <div className="flex gap-1 text-[#00cc8f] mb-3">
                {[...Array(t.rating || 5)].map((_, idx) => (
                  <FaStar key={idx} />
                ))}
              </div>

              {/* 🏷️ Tag */}
              {t.tag && (
                <span className="inline-block text-xs font-semibold text-[#00cc8f] bg-emerald-50 px-3 py-1 rounded-full mb-4">
                  {t.tag}
                </span>
              )}

              {/* 💬 Quote */}
              <p className="text-gray-700 italic leading-relaxed relative">
                “{t.quote}”
              </p>
              <FaQuoteRight className="absolute text-5xl text-gray-200 top-4 right-4" />

              {/* 👤 Author Info */}
              <div className="flex items-center gap-4 mt-6">
                <img
                  src={t.image || "https://randomuser.me/api/portraits/lego/1.jpg"}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#00cc8f]"
                  onError={(e) => {
                    e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
                  }}
                />
                <div>
                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
