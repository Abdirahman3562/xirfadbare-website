import React, { useState } from "react";
import { Quote, Sparkles, ArrowRight, Award, Users, Heart } from "lucide-react";
import { getImageUrl } from "../../utils/format";
import founderceo from "../../assets/founderceo.jpg";
import { motion } from "framer-motion";

export default function FounderStory() {
  const founder = {
    name: "Abdirahman Mohamed",
    role: "Founder & CEO",
    image: "",
    bio: "Language should never be a barrier to growth. Every talented person deserves a clear chance to succeed.",
    story: ""
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const defaultStory = `When I started Xirfadbare, I didn’t want to build just another platform. I wanted to create a learning space that Somali learners could truly understand — in their own language and at their own pace.

I grew up seeing talented people held back, not because they lacked ability, but because learning opportunities were not designed for them. Xirfadbare exists to change that.

Our mission is simple: to open clear pathways to knowledge, confidence, and real opportunities for Somalis through accessible, high-quality learning.`;

  const storyText = founder.story || defaultStory;
  const paragraphs = storyText.split('\n').filter(p => p.trim() !== '');
  const visibleParagraphs = isExpanded ? paragraphs : paragraphs.slice(0, 2);
  const hasMore = paragraphs.length > 2;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">Our Story</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4"
          >
            Meet the <span className="text-emerald-600 dark:text-emerald-400">Founder</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto"
          ></motion.div>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-emerald-900/5 overflow-hidden border border-gray-100 dark:border-slate-800"
        >
          <div className="grid lg:grid-cols-5 gap-0">
            {/* Left: Image Section */}
            <div className="lg:col-span-2 relative p-8 lg:p-12">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10">
                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 mb-6 group">
                  <img
                    src={founder.image ? getImageUrl(founder.image) : founderceo}
                    alt={founder.name}
                    className="w-full aspect-[3/4] object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>

                {/* Name & Role Card */}
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/10">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{founder.name}</h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider mb-3">{founder.role}</p>
                  <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Right: Content Section */}
            <div className="lg:col-span-3 p-8 lg:p-12">
              {/* Quote */}
              <div className="relative mb-8 p-6 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border-l-4 border-emerald-500">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-emerald-200 dark:text-emerald-900/20" fill="currentColor" />
                <p className="text-lg text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed relative z-10">
                  "{founder.bio}"
                </p>
              </div>

              {/* Story Content */}
              <div className="space-y-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                {visibleParagraphs.map((paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-base lg:text-lg"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              {/* Read More Button */}
              {hasMore && (
                <div className="mt-8">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    {isExpanded ? "Show Less" : "Read Full Story"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* Stats Row with Icons */}
              <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-800 grid grid-cols-3 gap-6">
                <div className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">5+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Years Experience</div>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">1000+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Students Helped</div>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <Heart className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">100%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Dedicated</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
