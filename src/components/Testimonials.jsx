import React from "react";
import { FaQuoteRight, FaStar } from "react-icons/fa";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ayaan Cabdi",
      role: "Frontend Developer",
      tag: "Built strong web design skills",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      quote:
        "Xirfadbare waa goob waxbarasho oo runtii wax ka bedeshay xirfadeyda. Tababarka iyo hagidda macallimiinta ayaa iga dhigay inaan si kalsooni leh u dhiso web apps xirfad leh.",
    },
    {
      name: "Mohamed Abdi",
      role: "Full Stack Engineer",
      tag: "From learner to tech professional",
      img: "https://randomuser.me/api/portraits/men/41.jpg",
      quote:
        "Markii aan ku biiray Xirfadbare, waxaan bartay React, Node.js, iyo MongoDB. Waxay i siisay xirfad dhab ah iyo kalsooni aan shaqo ku helo si dhakhso ah.",
    },
    {
      name: "Hodan Yusuf",
      role: "UI/UX Designer",
      tag: "Mastered modern design tools",
      img: "https://randomuser.me/api/portraits/women/31.jpg",
      quote:
        "Casharrada Xirfadbare waa kuwo la fahmi karo oo lagu tababaro si wax ku ool ah. Maanta waxaan si xirfad leh u isticmaalaa Figma iyo UX principles-ka casriga ah.",
    },
    {
      name: "Khalid Ahmed",
      role: "Backend Developer",
      tag: "Enhanced API and database skills",
      img: "https://randomuser.me/api/portraits/men/53.jpg",
      quote:
        "Xirfadbare waxay i siisay aasaas adag oo ku saabsan backend development. Waxaan bartay Node.js, Express iyo MongoDB, taas oo iga dhigtay mid shaqadiisa si kalsooni leh u qabta.",
    },
  ];

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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-[#f0f7f8] rounded-2xl p-6 shadow-sm hover:shadow-md transition relative border border-gray-100"
            >
              {/* ⭐ Stars */}
              <div className="flex gap-1 text-[#00cc8f] mb-3">
                {[...Array(5)].map((_, idx) => (
                  <FaStar key={idx} />
                ))}
              </div>

              {/* 🏷️ Tag */}
              <span className="inline-block text-xs font-semibold text-[#00cc8f] bg-emerald-50 px-3 py-1 rounded-full mb-4">
                {t.tag}
              </span>

              {/* 💬 Quote */}
              <p className="text-gray-700 italic leading-relaxed relative">
                “{t.quote}”
              </p>
              <FaQuoteRight className="absolute text-5xl text-gray-200 top-4 right-4" />

              {/* 👤 Author Info */}
              <div className="flex items-center gap-4 mt-6">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#00cc8f]"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
