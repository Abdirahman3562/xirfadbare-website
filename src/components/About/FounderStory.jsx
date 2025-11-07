import React from "react";
import { Quote } from "lucide-react";
import founderceo from "../../assets/founderceo.png"
export default function FounderStory() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* Left: Founder Image + Quote */}
        <div className="relative">
          <img
            src={founderceo}
            alt="Founder of Dugsiye"
            className="rounded-2xl w-full max-w-sm mx-auto shadow-md"
          />

          {/* Quote Box */}
          <div className="absolute -bottom-8 lg:left-80 md:left-80 left-40   shaddow-lg bg-[#edf4f5] border border-gray-200 hover:border-emerald-400  rounded-xl p-4 max-w-[220px]">
            <div className="flex items-start gap-2">
              <Quote className="text-emerald-500 w-5 h-5 mt-1" />
              <p className="text-[13px] text-slate-600 leading-snug italic">
                “Language should never be a barrier to building, every talented
                person deserves a chance to build, create, and succeed.”
              </p>
            </div>
          </div>
        </div>

        {/* Right: Text Content */}
        <div>
          <div className="inline-block mb-5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-sm border border-emerald-100">
            From the Founder
          </div>
          <h2 className="text-[28px] sm:text-4xl font-extrabold text-emerald-600 mb-4">
            Why I Started Xirfadbare
          </h2>

          <div className="inline-block mb-5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-sm border border-emerald-100">
            Fariin katimid Aasaasaha
          </div>

          <p className="text-slate-600 mb-4 leading-relaxed">
            When I started xirfadbare, I didn’t want to build just another
            platform. I wanted to make learning tech something that a Somali
            student could truly understand — in their own language, at their
            own pace.
          </p>
          <p className="text-slate-600 mb-4 leading-relaxed">
            I grew up seeing talented people stuck, not because they lacked
            ability, but because the learning wasn’t made for them. xirfadbare
            aims to change that.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Our mission is simple: open the doors to global opportunities for
            Somalis through direct, high-quality tech education.
          </p>

          <div>
            <h4 className="font-semibold text-emerald-600">Abdirahman Mohamed</h4>
            <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-sm border border-emerald-100">
              Founder &amp; CEO
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
