import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlayCircle,
  FaClock,
  FaInfinity,
  FaCode,
  FaCalendarAlt,
} from "react-icons/fa";
import { getInstructorBySlug } from "../../api/instructorService";
import { getAllCourses } from "../../api/courseService";

const InstructorCourses = ({ instructorSlug }) => {


  const [courses, setCourses] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        const foundInstructor = await getInstructorBySlug(instructorSlug);

        if (!foundInstructor) {
          setInstructor(null);
          setLoading(false);
          return;
        }

        setInstructor(foundInstructor);

        const courseData = await getAllCourses();

        const instructorCourses = courseData.filter((c) => {
          const courseInstructorId = c.instructor?._id || c.instructor;
          return courseInstructorId && String(courseInstructorId) === String(foundInstructor._id);
        });

        // ✅ Process courses with curriculum data (already embedded from backend)
        const detailedCourses = instructorCourses.map((course) => {
          const totalLessons = (course.curriculum || []).reduce(
            (sum, section) => sum + (section.lessons?.length || 0),
            0
          );

          const totalDuration = (course.curriculum || []).reduce(
            (sum, section) =>
              sum +
              (section.lessons || []).reduce(
                (sectionSum, lesson) =>
                  sectionSum + parseDurationToSeconds(lesson.duration),
                0
              ),
            0
          );

          return { ...course, totalLessons, totalDuration };
        });

        setCourses(detailedCourses);
      } catch (err) {
        console.error("❌ Error fetching instructor courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorCourses();
  }, [instructorSlug]);

  if (loading)
    return (
      <p className="text-center py-10 text-emerald-600 font-semibold">
        Loading courses...
      </p>
    );

  if (!instructor)
    return (
      <p className="text-center py-10 text-red-500">
        Instructor not found for slug: {instructorSlug}
      </p>
    );

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
      {courses.map((course) => {
        const totalDuration = formatSeconds(course.totalDuration);
        const isFree = !course.price || Number(course.price) === 0;

        // ✅ Auto-generate slug from title if missing
        const slug =
          course.slug ||
          course.title?.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

        // ✅ Instructor initials
        const initials = instructor.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();

        return (
          <div
            key={course._id || course.id}
            className="group relative bg-[#edf4f5] border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
          >
            {/* ✅ Thumbnail */}
            <div className="relative h-52 w-full overflow-hidden z-0">
              <Link to={`/courses/${slug}`}>
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

            {/* ✅ Info */}
            <div className="relative z-20 p-6">
              <Link
                to={`/courses/${slug}`}
                className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition"
              >
                {course.title}
              </Link>

              <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                {course.description}
              </p>

              {/* ✅ Instructor Info */}
              <div className="flex items-center gap-3 mb-4">
                {instructor.image ? (
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold ring-2 ring-white shadow-sm">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold text-gray-800 truncate"
                    title={instructor.name}
                  >
                    {instructor.name}
                  </p>
                  {instructor.instructorTitle && (
                    <p
                      className="text-xs bg-white text-emerald-600 font-semibold px-2 py-1 text-center rounded-full shadow-sm truncate"
                      title={instructor.instructorTitle}
                    >
                      {instructor.instructorTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ Lessons + Duration */}
              <div className="flex justify-between text-sm text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <FaPlayCircle className="text-emerald-500" />
                  <span>{course.totalLessons || 0} Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-emerald-500" />
                  <span>Total: {totalDuration}</span>
                </div>
              </div>

              {/* ✅ Access Type / Tech + Price */}
              <div className="flex justify-between items-center mb-5 text-sm font-medium">
                {course.accessType ? (
                  <span className="flex items-center gap-2 bg-white text-emerald-600 font-semibold px-3 py-1 rounded-full shadow-sm">
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
                    className="flex items-center gap-2 bg-white text-emerald-600 font-semibold px-3 py-1 rounded-full shadow-sm max-w-[180px] truncate"
                  >
                    <FaCode className="text-emerald-600 flex-shrink-0" />
                    <span className="truncate">
                      {course.technology || "Tech"}
                    </span>
                  </span>
                )}

                <span
                  className={`text-[18px] font-semibold ${isFree
                      ? "bg-white text-emerald-600 px-6 py-0 rounded-full shadow-sm"
                      : "text-emerald-600"
                    }`}
                >
                  {isFree ? "Free" : `$${course.price}`}
                </span>
              </div>

              <div className="border-t border-gray-100 mb-4"></div>

              <Link
                to={`/courses/${slug}`}
                className="block text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-full transition duration-300 transform hover:-translate-y-0.5 relative z-30"
              >
                View Details →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------------------------------------------
 ✅ Helpers
----------------------------------------------*/


/* ---------------------------------------------
 ✅ Helpers
----------------------------------------------*/
const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

const parseDurationToSeconds = (duration) => {
  if (!duration) return 0;
  if (typeof duration === "number") return duration * 60;

  const hourMatch = duration.match(/(\d+)\s*h/i);
  const minuteMatch = duration.match(/(\d+)\s*m/i);
  if (hourMatch || minuteMatch) {
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    return hours * 3600 + minutes * 60;
  }

  if (duration.includes(":")) {
    const [m, s] = duration.split(":").map(Number);
    return (m || 0) * 60 + (s || 0);
  }

  const numeric = parseFloat(duration.replace(/[^\d.]/g, ""));
  return isNaN(numeric) ? 0 : numeric * 60;
};





const formatSeconds = (seconds) => {
  if (!seconds || isNaN(seconds)) return "N/A";
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export default InstructorCourses;
