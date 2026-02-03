import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { getFAQs } from "../../api/faqService";
import { Loader2, MessageCircleQuestion } from "lucide-react";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const data = await getFAQs();
        // Kaliya soo aqri xogta database-ka ku jirta (No fallback)
        setFaqs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  return (
    <section className="py-24 bg-white/10 dark:bg-slate-900 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-6">
        {/* ✅ Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-5 py-2 rounded-full uppercase tracking-widest shadow-sm">
            💬 Faalo & Su'aalo
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Frequently Asked <span className="text-emerald-600 dark:text-emerald-400">Questions</span>
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            Halkan ka hel jawaabaha su’aalaha ugu badan ee ku saabsan Xirfadbare iyo khibradda waxbarasho ee online-ka.
          </p>
        </div>

        {/* ✅ Highlight Box (Optional: Only if SPECIFIC question exists) */}
        {(() => {
          const xirfadbareFaq = faqs.find(f => f.question?.includes("Waa maxay Xirfadbare"));
          if (!xirfadbareFaq) return null;

          return (
            <div className="border border-white/20 dark:border-slate-800 bg-white/10 backdrop-blur-md dark:bg-slate-900 rounded-[2.5rem] p-10 mb-12 shadow-xl shadow-emerald-50/50 dark:shadow-none transition-all duration-500 group hover:border-emerald-500 dark:hover:border-emerald-500/50">
              <h3 className="font-black text-2xl text-emerald-600 dark:text-emerald-400 mb-4 uppercase tracking-tighter">
                {xirfadbareFaq.question}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">
                {xirfadbareFaq.answer}
              </p>
              <div className="mt-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <div className="w-8 h-[2px] bg-emerald-600 dark:bg-emerald-400"></div>
                <span>Official Information</span>
              </div>
            </div>
          );
        })()}

        {/* ✅ FAQ List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/10 backdrop-blur-md rounded-[3rem] border border-white/20 dark:border-slate-800 shadow-sm">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400 font-bold italic">Soo aqrinaya xogta dhabta ah...</p>
          </div>
        ) : faqs.length > 0 ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {faqs.map((item, i) => (
              <div
                key={item._id || i}
                className={`border transition-all duration-500 rounded-[2rem] overflow-hidden ${openIndex === i
                  ? 'border-emerald-500 bg-white/10 dark:bg-slate-900 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/10'
                  : 'border-white/20 dark:border-slate-800 bg-white/10 dark:bg-slate-900/60 hover:border-emerald-500/50 shadow-sm'
                  }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex justify-between items-center px-8 py-7 cursor-pointer text-left group"
                >
                  <span className={`text-lg font-black transition-colors duration-300 ${openIndex === i ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                    }`}>
                    {item.question}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${openIndex === i ? 'bg-emerald-600 text-white rotate-180' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                    }`}>
                    {openIndex === i ? <FaMinus size={14} /> : <FaPlus size={14} />}
                  </div>
                </button>

                <div
                  className={`px-8 transition-all duration-500 ease-in-out overflow-hidden ${openIndex === i ? "max-h-[800px] pb-10 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="pt-6 border-t border-white/10 dark:border-emerald-500/30 text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-normal">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-800 py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 dark:text-gray-700">
              <MessageCircleQuestion size={56} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Database-ka waa madhan yahay!</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              Majirto xog laga helay server-ka. Fadlan ka soo dar qaybta Admin-ka si ay halkan uga muuqato.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
