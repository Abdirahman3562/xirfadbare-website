import {
  FaClock,
  FaPlayCircle,
  FaCode,
  FaInfinity,
  FaCalendarAlt,
  FaAward,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { FaUserGraduate } from "react-icons/fa6";
import { getImageUrl } from "../../utils/format";

function CourseCard({ course }) {
  const navigate = useNavigate();

  const totalLessons = Array.isArray(course.curriculum)
    ? course.curriculum.reduce(
      (sum, section) => sum + (section.lessons?.length || 0),
      0
    )
    : 0;

  const calcTotalDuration = () => {
    if (!Array.isArray(course.curriculum)) return null;
    let totalSeconds = 0;
    course.curriculum.forEach((section) => {
      (section.lessons || []).forEach((lesson) => {
        if (!lesson.duration) return;
        const [m, s] = lesson.duration.split(":").map(Number);
        totalSeconds += (m || 0) * 60 + (s || 0);
      });
    });
    if (totalSeconds === 0) return null;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const totalDuration = calcTotalDuration() || course.duration || "N/A";
  const isFree = !course.price || Number(course.price) === 0;

  // ✅ Instructor helpers
  const instructor = course.instructor || {};
  const instructorTitle = instructor.name || "Instructor";
  const initials = useMemo(() => {
    const parts = instructorTitle.trim().split(" ").filter(Boolean);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("");
  }, [instructorTitle]);

  return (
    <div className="group relative bg-[#edf4f5] dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden z-0">
        <Link to={`/courses/${course.slug}`}>
          <img
            src={getImageUrl(course.thumbnail) || "/default-course.jpg"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>

        <span className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full shadow transition-colors">
          {course.level || "Beginner"}
        </span>

        {course.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse z-10">
            {course.discountPercentage}% OFF
          </span>
        )}
      </div>

      <div className="relative z-20 p-5">
        {course.type && (
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">
            {course.type}
          </span>
        )}
        <Link
          to={`/courses/${course.slug}`}
          className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition"
        >
          {course.title}
        </Link>

        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2.5 line-clamp-2">
          {course.description}
        </p>

        {/* 👨‍🏫 Instructor row (NEW) */}
        <div className="flex items-center gap-3 mb-3">
          {instructor.image ? (
            <img
              src={getImageUrl(instructor.image)}
              alt={instructorTitle}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-semibold ring-2 ring-white dark:ring-slate-800 shadow-sm"
              aria-hidden="true"
            >
              {initials || "IN"}
            </div>
          )}
          <div className="min-w-0">
            <p
              className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate"
              title={instructorTitle}
            >
              {instructorTitle}
            </p>
            {instructor.instructorTitle && (
              <p
                className="text-xs bg-[#edf4f5] dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 text-center rounded-full shadow-sm truncate"
                title={instructor.instructorTitle}
              >
                {instructor.instructorTitle}
              </p>
            )}
          </div>
        </div>

        {/* Lessons + Duration */}
        <div className="flex justify-between text-[13px] text-gray-700 dark:text-gray-300 mb-3.5 transition-colors">
          <div className="flex gap-1 items-center">
            <FaUserGraduate className="text-emerald-500 text-[12px]" />
            <span className="text-gray-700 dark:text-gray-300 font-medium ml-1">
              {course.enrolledCount}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">Enrolled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaPlayCircle className="text-emerald-500" />
            <span>{totalLessons} Lessons</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaClock className="text-emerald-500" />
            <span>{totalDuration}</span>
          </div>
        </div>

        {/* Access Type / Tech + Price */}
        <div className="flex justify-between items-center mb-4 text-sm font-medium">
          {course.accessType ? (
            <span className="flex items-center gap-2 bg-[#edf4f5] dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full shadow-sm transition-colors text-[12px]">
              {course.accessType.toLowerCase() === "lifetime" ? (
                <FaInfinity className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <FaCalendarAlt className="text-emerald-600 dark:text-emerald-400" />
              )}
              <span>
                {course.accessType === "Lifetime"
                  ? "Lifetime"
                  : `${course.accessType}`}
              </span>
            </span>
          ) : (
            <span
              title={course.technology}
              className="flex items-center gap-2 bg-[#edf4f5] dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full shadow-sm max-w-[180px] truncate transition-colors text-[12px]"
            >
              <FaCode className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="truncate">{course.technology || "Tech"}</span>
            </span>
          )}

          {/* Price */}
          <div className="flex flex-col items-end">
            {course.discountPercentage > 0 ? (
              <>
                <span className="text-gray-400 text-[10px] line-through font-bold">
                  ${course.price}
                </span>
                <span className="text-[17px] font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  ${(course.price * (1 - course.discountPercentage / 100)).toFixed(2)}
                </span>
              </>
            ) : (
              <span
                className={`text-[17px] font-semibold ${isFree
                  ? "bg-[#edf4f5] dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-6 py-0 rounded-full shadow-sm"
                  : "text-emerald-600 dark:text-emerald-400"
                  }`}
              >
                {isFree ? "free" : `$${course.price}`}
              </span>
            )}
          </div>
        </div>

        {course.hasCertificate && (
          <div className="group/cert relative flex items-center gap-2 bg-gradient-to-r from-amber-100/50 to-orange-50/50 dark:from-amber-500/10 dark:to-orange-500/5 text-amber-700 dark:text-amber-400 font-black px-3.5 py-1.5 rounded-xl shadow-sm border border-amber-200/50 dark:border-amber-500/20 w-fit mb-4 transition-all hover:shadow-md hover:shadow-amber-200/40 dark:hover:shadow-none group-hover:scale-[1.02] duration-300">
            <div className="relative">
              <FaAward className="text-amber-500 text-sm animate-pulse" />
              <div className="absolute inset-0 bg-amber-400 blur-md opacity-20 group-hover/cert:opacity-40 animate-pulse"></div>
            </div>
            <span className="text-[9px] uppercase tracking-[0.05em] relative z-10">Certificate</span>
            <div className="ml-0.5 w-1 h-1 bg-amber-500 rounded-full animate-[pulse_2s_infinite]"></div>
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-800 mb-3.5 transition-colors"></div>

        <Link
          to={`/courses/${course.slug}`}
          className="block text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-full transition duration-300 transform hover:-translate-y-0.5 relative z-30 text-sm"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

export default CourseCard;
