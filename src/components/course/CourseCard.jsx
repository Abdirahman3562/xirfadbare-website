import {
  FaClock,
  FaPlayCircle,
  FaCode,
  FaInfinity,
  FaCalendarAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { FaUserGraduate } from "react-icons/fa6";

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
    <div className="group relative bg-[#edf4f5] border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      {/* Thumbnail */}
      <div className="relative h-52 w-full overflow-hidden z-0">
        <Link to={`/courses/${course.slug}`}>
          <img
            src={course.thumbnail || "/default-course.jpg"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>

        <span className="absolute top-3 right-3 bg-white/90 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
          {course.level || "Beginner"}
        </span>
      </div>

      {/* Info */}
      <div className="relative z-20 p-6">
        <Link
          to={`/courses/${course.slug}`}
          className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition"
        >
          {course.title}
        </Link>

        <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
          {course.description}
        </p>

        {/* 👨‍🏫 Instructor row (NEW) */}
        <div className="flex items-center gap-3 mb-4">
          {instructor.image ? (
            <img
              src={instructor.image}
              alt={instructorTitle}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold ring-2 ring-white shadow-sm"
              aria-hidden="true"
            >
              {initials || "IN"}
            </div>
          )}
          <div className="min-w-0">
            <p
              className="text-sm font-semibold text-gray-800 truncate"
              title={instructorTitle}
            >
              {instructorTitle}
            </p>
            {instructor.instructorTitle && (
              <p
                className="text-xs bg-[#edf4f5] text-emerald-600 font-semibold px-2 py-1 text-center rounded-full shadow-sm truncate"
                title={instructor.instructorTitle}
              >
                {instructor.instructorTitle}
              </p>
            )}
          </div>
        </div>

        {/* Lessons + Duration */}
        <div className="flex justify-between text-sm text-gray-700 mb-4">
          <div className="flex gap-1 items-center">
            <FaUserGraduate className="text-emerald-500 text-[13px]" />
            <span className="text-gray-700 font-medium ml-1">
              {course.enrolledCount}
            </span>
            <span className="text-gray-500 text-sm">Enrolled</span>
          </div>
          <div className="flex items-center gap-2">
            <FaPlayCircle className="text-emerald-500" />
            <span>{totalLessons} Lessons</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-emerald-500" />
            <span>Total: {totalDuration}</span>
          </div>
        </div>

        {/* Access Type / Tech + Price */}
        <div className="flex justify-between items-center mb-5 text-sm font-medium">
          {course.accessType ? (
            <span className="flex items-center gap-2 bg-[#edf4f5] text-emerald-600 font-semibold px-3 py-1 rounded-full shadow-sm">
              {course.accessType.toLowerCase() === "lifetime" ? (
                <FaInfinity className="text-emerald-600" />
              ) : (
                <FaCalendarAlt className="text-emerald-600" />
              )}
              <span>
                {course.accessType === "Lifetime"
                  ? "Lifetime Access"
                  : `${course.accessType} Access`}
              </span>
            </span>
          ) : (
            <span
              title={course.technology}
              className="flex items-center gap-2 bg-[#edf4f5] text-emerald-600 font-semibold px-3 py-1 rounded-full shadow-sm max-w-[180px] truncate"
            >
              <FaCode className="text-emerald-600 flex-shrink-0" />
              <span className="truncate">{course.technology || "Tech"}</span>
            </span>
          )}

          {/* Price */}
          <span
            className={`text-[18px] font-semibold ${
              isFree
                ? "bg-[#edf4f5] text-emerald-600 px-6 py-0 rounded-full shadow-sm"
                : "text-emerald-600"
            }`}
          >
            {isFree ? "free" : `$${course.price}`}
          </span>
        </div>

        <div className="border-t border-gray-100 mb-4"></div>

        <Link
          to={`/courses/${course.slug}`}
          className="block text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-full transition duration-300 transform hover:-translate-y-0.5 relative z-30"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

export default CourseCard;
