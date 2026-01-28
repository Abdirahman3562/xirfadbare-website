import { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaPlayCircle,
  FaSignal,
  FaCheckCircle,
  FaArrowRight,
  FaLock,
  FaUserGraduate,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Curriculum({
  level,
  curriculum = [],
  learningOutcomes = [],
  price,
  discountPercentage = 0,
  courseId,
  enrolledCount = 0,
  courseTitle
}) {
  const [openSections, setOpenSections] = useState({});
  const navigate = useNavigate();

  // ✅ Loading state ma jiro - data props ka timid
  if (!curriculum || curriculum.length === 0) {
    return (
      <div className="text-center py-10 text-emerald-600 font-semibold">
        Loading curriculum...
      </div>
    );
  }
  const isPaid = Number(price) > 0;

  // 🔹 Toggle sections
  const toggleSection = (index) =>
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));

  const handleToggleAll = () => {
    const isAllOpen = Object.values(openSections).every(Boolean);
    const updated = {};
    curriculum.forEach((_, i) => (updated[i] = !isAllOpen));
    setOpenSections(updated);
  };

  const allOpen = Object.values(openSections).every(Boolean);

  // 🔹 Helper: duration calculation
  const calcSectionDuration = (lessons) => {
    let s = 0;
    lessons.forEach((l) => {
      if (!l.duration) return;
      const [m, sec] = l.duration.split(":").map(Number);
      s += (m || 0) * 60 + (sec || 0);
    });
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const totalLessons = curriculum.reduce(
    (sum, s) => sum + (s.lessons?.length || 0),
    0
  );

  const totalDuration = (() => {
    let s = 0;
    curriculum.forEach((sec) =>
      sec.lessons?.forEach((l) => {
        if (!l.duration) return;
        const [m, sec] = l.duration.split(":").map(Number);
        s += (m || 0) * 60 + (sec || 0);
      })
    );
    const min = Math.floor(s / 60);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  })();

  return (
    <div className="bg-[#edf4f5] mt-10 p-8 rounded-2xl shadow-lg border border-gray-100">
      {/* ✅ Summary Boxes */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8 text-center">

        {/* ✅ Students Enrolled (Box Afraad) */}
        <div className="p-5 rounded-xl border border-gray-200 hover:border-emerald-400 bg-[#edf4f5] transition">
          <FaUserGraduate className="text-emerald-500 text-2xl mx-auto mb-2" />
          <p className="text-xl font-semibold text-gray-800">
            {enrolledCount || 0}
          </p>
          <p className="text-gray-500 text-sm">Students Enrolled</p>
        </div>



        {/* Total Duration */}
        <div className="p-5 rounded-xl border border-gray-200 hover:border-emerald-400 bg-[#edf4f5] transition">
          <FaClock className="text-emerald-500 text-2xl mx-auto mb-2" />
          <p className="text-xl font-semibold text-gray-800">{totalDuration}</p>
          <p className="text-gray-500 text-sm">Total Duration</p>
        </div>

        {/* Video Lessons */}
        <div className="p-5 rounded-xl border border-gray-200 hover:border-emerald-400 bg-[#edf4f5] transition">
          <FaPlayCircle className="text-emerald-500 text-2xl mx-auto mb-2" />
          <p className="text-xl font-semibold text-gray-800">{totalLessons}</p>
          <p className="text-gray-500 text-sm">Video Lessons</p>
        </div>

        {/* Skill Level */}
        <div className="p-5 rounded-xl border border-gray-200 hover:border-emerald-400 bg-[#edf4f5] transition">
          <FaSignal className="text-emerald-500 text-2xl mx-auto mb-2" />
          <p className="text-xl font-semibold text-gray-800">{level}</p>
          <p className="text-gray-500 text-sm">Skill Level</p>
        </div>


      </div>

      {/* ✅ Curriculum Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-emerald-600">
          Course Curriculum ({curriculum.length} Sections)
        </h2>
        <button
          onClick={handleToggleAll}
          className="text-sm text-emerald-600 font-medium"
        >
          {allOpen ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* ✅ Sections */}
      <div className="space-y-4 mb-8">
        {curriculum.map((section, index) => {
          const sectionDuration = calcSectionDuration(section.lessons);
          return (
            <div
              key={index}
              className="group border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/40 transition"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex justify-between items-center p-5"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="bg-emerald-100 text-emerald-600 font-semibold w-8 h-8 flex items-center justify-center rounded-full">
                    {index + 1}
                  </span>

                  {/* Titles & duration */}
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-800 group-hover:text-emerald-400">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 ">
                      {section.lessons.length} lessons • {sectionDuration}
                    </p>
                  </div>
                </div>

                {openSections[index] ? (
                  <FaChevronUp className="text-emerald-500" />
                ) : (
                  <FaChevronDown className="text-gray-400 group-hover:text-emerald-400" />
                )}
              </button>

              {/* Lessons */}
              {openSections[index] && (
                <div className="px-8 pb-5 space-y-3">
                  {section.lessons.map((lesson, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center border border-gray-200 rounded-lg p-3 transition duration-300 
          hover:border-emerald-400 hover:bg-emerald-50/50 shadow-sm
          ${isPaid ? "cursor-not-allowed opacity-95" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        {isPaid ? (
                          <FaLock className="text-emerald-500 text-xs" />
                        ) : (
                          <FaPlayCircle className="text-emerald-500 text-xs" />
                        )}
                        <span>{lesson.title}</span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {lesson.duration}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ CTA Section */}
      <div className="border border-gray-200 hover:border-emerald-400 rounded-xl p-6 text-gray-800">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full">
            <FaCheckCircle className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">What You’ll Learn</h3>
            <p className="text-gray-600 text-sm">
              Below is an overview of the core skills you’ll gain from this
              course.
            </p>
          </div>
        </div>

        {Array.isArray(learningOutcomes) && (
          <ul className="space-y-2 text-sm text-gray-700 mb-6 pl-10">
            {learningOutcomes.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-500 text-sm mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-gray-100 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-gray-500 font-medium">Course Price:</span>
            <div className="flex flex-col items-end">
              {discountPercentage > 0 ? (
                <>
                  <span className="text-sm text-gray-400 line-through font-bold">
                    ${price}
                  </span>
                  <span className="text-3xl font-black text-emerald-600">
                    ${(price * (1 - discountPercentage / 100)).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-emerald-600">
                  {Number(price) === 0 ? "Free" : `$${price}`}
                </span>
              )}
            </div>
          </div>
          {isPaid ? (
            <button
              onClick={() => {
                if (courseTitle) {
                  navigate(
                    `/payment/${courseTitle
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`
                  );
                }
              }}
              className="w-full bg-emerald-500 cursor-pointer hover:bg-emerald-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-100"
            >
              Buy Course To Get Full Access <FaArrowRight />
            </button>
          ) : (
            <button className="w-full bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-100">
              Continue Learning <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
