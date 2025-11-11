import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Sideen uga diiwaan gali karaa koorsooyinka Xirfadbare?",
      a: "Tag bogga 'Courses', dooro koorsada aad rabto, kadib guji 'Enroll Now'. Waxaad heli doontaa fariin xaqiijin ah iyo tillaabooyinka xiga ee bixinta ama bilaabista koorsada."
    },
    {
      q: "Koorsooyinka Xirfadbare ma bilaash baa mise waa lacag leh?",
      a: "Xirfadbare waxay bixisaa koorsooyin bilaash ah iyo kuwo premium ah. Koorsooyinka premium waxay bixiyaan waxyaabo dheeraad ah sida hagitaan toos ah, support gaar ah iyo fursado shaqo."
    },
    {
      q: "Ma heli karaa taageero haddii aan dhibaato kala kulmo koorsada?",
      a: "Haa, kooxda support-ka ee Xirfadbare ayaa diyaar u ah inay ku caawiso 24/7. Waxaad nala soo xiriiri kartaa email, chat, ama qaybta support-ka ee website-ka."
    },
    {
      q: "Macallimiinta Xirfadbare ma yihiin xirfadlayaal dhab ah?",
      a: "Haa, dhammaan macallimiinta waa khubaro ka tirsan shirkado caan ah oo leh waayo-aragnimo toos ah, waxayna si firfircoon uga shaqeeyaan warshadaha Technology-ga."
    },
    {
      q: "Ma heli karaa shahaado marka aan dhameeyo koorsada?",
      a: "Haa, dhammaan ardayda dhameeya koorsooyinka waxay helayaan shahaado rasmi ah oo lagu aqoonsan karo shaqooyinka iyo CV-gaaga si xirfad leh."
    },
    {
      q: "Mudo intee le’eg ayay koorsooyinka socdaan?",
      a: "Koorsooyinka badankood waxay socdaan 4 ilaa 12 toddobaad, iyadoo ku xiran nooca koorsada iyo heerka aqoonta ardayga."
    },
    {
      q: "Ma isticmaali karaa Xirfadbare meel kasta?",
      a: "Haa, Xirfadbare waa madal online ah. Waxaad ku baran kartaa meel kasta iyo waqti kasta adigoo isticmaalaya kombiyuutar ama mobilkaaga."
    },
    {
      q: "Ma jiraan casharro ku saabsan xirfadaha shaqo raadinta?",
      a: "Haa, Xirfadbare waxay bixisaa tababaro gaar ah oo kaa caawinaya diyaarinta CV-ga, wareysiyada shaqo, iyo xirfadaha soft skills ee loo baahan yahay suuqa shaqada maanta."
    }
  ];

  return (
    <section className="py-20  bg-[#edf4f5]">
      <div className="max-w-4xl mx-auto px-6">
        {/* ✅ Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-semibold text-[#00cc8f] bg-emerald-50 px-4 py-1 rounded-full">
            💬 FAQ
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-[#00cc8f]">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-gray-600">
            Halkan ka hel jawaabaha su’aalaha ugu badan ee ku saabsan Xirfadbare iyo khibradda waxbarasho ee online-ka.
          </p>
        </div>

        {/* ✅ Highlight Box */}
        <div className="border border-gray-200 hover:border-emerald-400 bg-[#edf4f5] rounded-2xl p-6 mb-10 shadow-sm">
          <h3 className="font-bold text-lg text-emerald-700 mb-2">
            Waa maxay Xirfadbare?
          </h3>
          <p className="text-gray-700 leading-relaxed">
            <strong>Xirfadbare</strong> waa madal waxbarasho casri ah oo diiradda saarta tababarka
            iyo horumarinta xirfadaha Technology-ga sida{" "}
            <strong>Full Stack Development</strong>,{" "}
            <strong>UI/UX Design</strong>, iyo{" "}
            <strong>Data Analysis</strong>. Waxay bixisaa casharro la jaanqaadaya suuqa shaqada
            si ardaydu u noqdaan xirfadlayaal dhab ah.
          </p>
          <ul className="list-disc list-inside mt-3 text-gray-700 space-y-1">
            <li>Macallimiin khubaro ah oo leh waayo-aragnimo dhab ah.</li>
            <li>Casharro tayo sare leh oo la jaanqaadaya suuqa shaqada.</li>
            <li>Shahaadooyin la aqoonsan yahay iyo tababaro shaqo dhameystiran.</li>
          </ul>
        </div>

        {/* ✅ FAQ List */}
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="border border-gray-200 hover:border-emerald-400 cusrpo bg-[#edf4f5] rounded-md hover:shadow-sm transition"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center px-6 py-4 cursor-pointer text-left text-gray-800 font-medium"
              >
                <span>{item.q}</span>
                {openIndex === i ? (
                  <FaMinus className="text-[#00cc8f]" />
                ) : (
                  <FaPlus className="text-[#00cc8f]" />
                )}
              </button>

              {openIndex === i && (
                <div className="px-6 pb-4 text-gray-600 border-t border-gray-100">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
