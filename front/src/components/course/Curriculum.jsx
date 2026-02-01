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
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { useMyOrders } from "../../hooks/useMyOrders";
import { slugify } from "../../utils/slugify";
import { enrollInFreeCourse } from "../../api/orderService";

export default function Curriculum({
  level,
  curriculum = [],
  learningOutcomes = [],
  price,
  discountPercentage = 0,
  courseId,
  enrolledCount = 0,
  courseTitle,
  isEnrolled,
  courseSlug
}) {
  const [openSections, setOpenSections] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshOrders } = useMyOrders(user);

  // ✅ Loading state check
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


  // 🔹 Get First Lesson Slug Helper
  const getFirstLessonSlug = () => {
    if (!curriculum || !Array.isArray(curriculum)) return null;
    for (const section of curriculum) {
      if (section.lessons && section.lessons.length > 0) {
        const firstLesson = section.lessons[0];
        return firstLesson.slug || slugify(firstLesson.title) || firstLesson._id || firstLesson.id;
      }
    }
    return null;
  };

  return (
    <div className="bg-[#edf4f5] dark:bg-slate-900 mt-10 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 transition-colors duration-500">
      {/* ✅ Summary Boxes */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8 text-center">

        {/* ✅ Students Enrolled */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 bg-[#edf4f5] dark:bg-slate-900 transition">
          <FaUserGraduate className="text-emerald-500 dark:text-emerald-400 text-2xl mx-auto mb-2" />
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {enrolledCount || 0}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Students Enrolled</p>
        </div>

        {/* Total Duration */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 bg-[#edf4f5] dark:bg-slate-900 transition">
          <FaClock className="text-emerald-500 dark:text-emerald-400 text-2xl mx-auto mb-2" />
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{totalDuration}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Duration</p>
        </div>

        {/* Video Lessons */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 bg-[#edf4f5] dark:bg-slate-900 transition">
          <FaPlayCircle className="text-emerald-500 dark:text-emerald-400 text-2xl mx-auto mb-2" />
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{totalLessons}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Video Lessons</p>
        </div>

        {/* Skill Level */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 bg-[#edf4f5] dark:bg-slate-900 transition">
          <FaSignal className="text-emerald-500 dark:text-emerald-400 text-2xl mx-auto mb-2" />
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{level}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Skill Level</p>
        </div>

      </div>

      {/* ✅ Curriculum Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          Course Curriculum ({curriculum.length} Sections)
        </h2>
        <button
          onClick={handleToggleAll}
          className="text-sm text-emerald-600 dark:text-emerald-400 font-medium"
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
              className="group border border-gray-200 dark:border-slate-800 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-500/10 transition"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex justify-between items-center p-5"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold w-8 h-8 flex items-center justify-center rounded-full">
                    {index + 1}
                  </span>

                  {/* Titles & duration */}
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-emerald-400 break-all whitespace-pre-wrap">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                      className={`flex justify-between items-center border border-gray-200 dark:border-slate-800 rounded-lg p-3 transition duration-300 
          hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 shadow-sm
          ${isPaid && !isEnrolled ? "cursor-not-allowed opacity-95" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                        {isPaid && !isEnrolled ? (
                          <FaLock className="text-emerald-500 dark:text-emerald-400 text-xs" />
                        ) : (
                          <FaPlayCircle className="text-emerald-500 dark:text-emerald-400 text-xs" />
                        )}
                        <span className="break-all whitespace-pre-wrap">{lesson.title}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
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
      <div className="border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-xl p-6 text-gray-800 dark:text-gray-200 transition-all duration-300">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-full">
            <FaCheckCircle className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">What You’ll Learn</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Below is an overview of the core skills you’ll gain from this
              course.
            </p>
          </div>
        </div>

        {Array.isArray(learningOutcomes) && (
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-6 pl-10">
            {learningOutcomes.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 text-lg mt-0.5 flex-shrink-0" />
                <span className="break-all whitespace-pre-wrap">{point}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Course Price:</span>
            <div className="flex flex-col items-end">
              {!isEnrolled && discountPercentage > 0 ? (
                <>
                  <span className="text-sm text-gray-400 line-through font-bold">
                    ${price}
                  </span>
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    ${(price * (1 - discountPercentage / 100)).toFixed(2)}
                  </span>
                </>
              ) : (
                isEnrolled ? (
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider">
                    Enrolled
                  </span>
                ) : (
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {Number(price) === 0 ? "Free" : `$${price}`}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Logic for Buttons */}
          {isEnrolled ? (
            <button
              onClick={() => {
                const lessonSlug = getFirstLessonSlug();
                const cSlug = courseSlug || slugify(courseTitle);
                if (lessonSlug && cSlug) {
                  navigate(`/watch/courses/${cSlug}/lessons/${lessonSlug}`);
                } else {
                  console.warn("Could not navigate to lesson", { lessonSlug, cSlug });
                }
              }}
              className="w-full bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-100 dark:shadow-none"
            >
              Continue Learning <FaArrowRight />
            </button>
          ) : (
            isPaid ? (
              <button
                onClick={() => {
                  if (!user) {
                    toast.error("Please sign in to your account to purchase this course!");
                    navigate("/auth/login");
                    return;
                  }
                  if (courseTitle) {
                    navigate(
                      `/payment/${courseTitle
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`
                    );
                  }
                }}
                className="w-full bg-emerald-500 cursor-pointer hover:bg-emerald-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-100 dark:shadow-none"
              >
                Buy Course To Get Full Access <FaArrowRight />
              </button>
            ) : (
              // Free course but not enrolled? Usually should enroll, but if logic allows direct access:
              <button
                onClick={async () => {
                  if (!user) {
                    toast.error("Please sign in to your account to start learning this course!");
                    navigate("/auth/login");
                    return;
                  }

                  // If not enrolled, enroll first
                  if (!isEnrolled) {
                    const toastId = toast.loading("Enrolling you in this free course...");
                    try {
                      await enrollInFreeCourse(courseId);
                      refreshOrders();
                      toast.update(toastId, {
                        render: "Successfully enrolled! Enjoy your course.",
                        type: "success",
                        isLoading: false,
                        autoClose: 3000
                      });
                    } catch (error) {
                      toast.update(toastId, {
                        render: error.message || "Failed to enroll",
                        type: "error",
                        isLoading: false,
                        autoClose: 3000
                      });
                      return;
                    }
                  }

                  const lessonSlug = getFirstLessonSlug();
                  const cSlug = courseSlug || slugify(courseTitle);
                  if (lessonSlug && cSlug) {
                    navigate(`/watch/courses/${cSlug}/lessons/${lessonSlug}`);
                  }
                }}
                className="w-full bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-100 dark:shadow-none"
              >
                Start Learning <FaArrowRight />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
