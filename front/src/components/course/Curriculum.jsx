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
import { X, PlayCircle as PlayIcon } from "lucide-react";
import PremiumLoader from "../ui/PremiumLoader";
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
  const [previewLesson, setPreviewLesson] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshOrders } = useMyOrders(user);

  // ✅ Loading state check
  if (!curriculum || curriculum.length === 0) {
    return <PremiumLoader text="Loading curriculum..." fullScreen={false} />;
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


  const getFirstLesson = () => {
    if (!curriculum || !Array.isArray(curriculum)) return null;
    for (const section of curriculum) {
      if (section.lessons && section.lessons.length > 0) {
        return section.lessons[0];
      }
    }
    return null;
  };

  const firstLesson = getFirstLesson();

  const getFirstLessonSlug = () => {
    if (firstLesson) {
      return firstLesson.slug || slugify(firstLesson.title) || firstLesson._id || firstLesson.id;
    }
    return null;
  };

  const formatVideoUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("embed/")) return `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
    return url;
  };

  return (
    <div className="bg-[#edf4f5] dark:bg-slate-900 mt-10 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 transition-colors duration-500">
      {/* ✅ Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
        {/* Students Enrolled */}
        <div className="p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white/50 dark:bg-slate-900/50 transition flex flex-col items-center justify-center">
          <FaUserGraduate className="text-emerald-500 dark:text-emerald-400 text-xl sm:text-2xl mb-2" />
          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100">
            {enrolledCount || 0}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold">Students</p>
        </div>

        {/* Duration */}
        <div className="p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white/50 dark:bg-slate-900/50 transition flex flex-col items-center justify-center">
          <FaClock className="text-emerald-500 dark:text-emerald-400 text-xl sm:text-2xl mb-2" />
          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100">{totalDuration}</p>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold">Hours</p>
        </div>

        {/* Video Lessons */}
        <div className="p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white/50 dark:bg-slate-900/50 transition flex flex-col items-center justify-center">
          <FaPlayCircle className="text-emerald-500 dark:text-emerald-400 text-xl sm:text-2xl mb-2" />
          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100">{totalLessons}</p>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold">Lessons</p>
        </div>

        {/* Skill Level */}
        <div className="p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white/50 dark:bg-slate-900/50 transition flex flex-col items-center justify-center">
          <FaSignal className="text-emerald-500 dark:text-emerald-400 text-xl sm:text-2xl mb-2" />
          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100">{level}</p>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold">Level</p>
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
                  {section.lessons.map((lesson, i) => {
                    const isFirst = firstLesson && String(lesson._id || lesson.id) === String(firstLesson._id || firstLesson.id);
                    const isLocked = isPaid && !isEnrolled && !isFirst;

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (isLocked) return;
                          if (isFirst && !isEnrolled && isPaid) {
                            setPreviewLesson(lesson);
                          } else if (isEnrolled || !isPaid) {
                            const lessonSlug = lesson.slug || slugify(lesson.title) || lesson._id || lesson.id;
                            const cSlug = courseSlug || slugify(courseTitle);
                            navigate(`/watch/courses/${cSlug}/lessons/${lessonSlug}`);
                          }
                        }}
                        className={`flex justify-between items-center border border-gray-200 dark:border-slate-800 rounded-lg p-3 transition duration-300 
                          ${isLocked ? "cursor-not-allowed opacity-95" : "cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 shadow-sm"}`}
                      >
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          {isLocked ? (
                            <FaLock className="text-emerald-500 dark:text-emerald-400 text-xs" />
                          ) : (
                            <FaPlayCircle className="text-emerald-500 dark:text-emerald-400 text-xs" />
                          )}
                          <div className="flex items-center gap-2">
                            <span className="break-all whitespace-pre-wrap">{lesson.title}</span>
                            {isFirst && isPaid && !isEnrolled && (
                              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                Preview
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {lesson.duration}
                        </span>
                      </div>
                    );
                  })}
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
                id="buy-course-btn"
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

      {/* ✅ Preview Video Modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white dark:border-slate-800 animate-in zoom-in-95 duration-500">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-gray-50 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-50 dark:border-emerald-500/20">
                  <PlayIcon size={18} fill="currentColor" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Preview</p>
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-sm sm:text-base tracking-tight line-clamp-1">{previewLesson.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setPreviewLesson(null)}
                className="w-9 h-9 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-gray-500 rounded-xl flex items-center justify-center transition-all active:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Player Section */}
            <div className="aspect-video w-full bg-slate-900">
              {previewLesson.videoUrl ? (
                <iframe
                  className="w-full h-full"
                  src={formatVideoUrl(previewLesson.videoUrl)}
                  title="Lesson Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                  <PlayIcon size={32} className="opacity-20" />
                  <p className="font-black uppercase tracking-widest text-[10px]">Video not available</p>
                </div>
              )}
            </div>

            {/* Modal Footer / CTA */}
            <div className="p-4 sm:p-5 bg-gray-50/30 dark:bg-slate-800/20 border-t border-gray-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs font-medium text-center sm:text-left leading-relaxed max-w-[280px]">
                Enjoyed the preview? Get full access to <span className="text-emerald-600 dark:text-emerald-400 font-bold">{courseTitle}</span>.
              </p>
              <button
                onClick={() => {
                  setPreviewLesson(null);
                  const buyBtn = document.getElementById('buy-course-btn');
                  if (buyBtn) {
                    buyBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    buyBtn.classList.add('animate-bounce');
                    setTimeout(() => buyBtn.classList.remove('animate-bounce'), 2000);
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Enroll Now <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
