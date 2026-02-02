import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/format";
import {
  FaPlayCircle,
  FaClock,
  FaInfinity,
  FaCode,
  FaCalendarAlt,
  FaAward,
  FaUserGraduate
} from "react-icons/fa";
import { getInstructorBySlug } from "../../api/instructorService";
import { getAllCourses } from "../../api/courseService";
import { useAuth } from "../../hooks/useAuth";
import { useMyOrders } from "../../hooks/useMyOrders";
import PremiumLoader from "../ui/PremiumLoader";

const InstructorCourses = ({ instructorSlug }) => {


  const [courses, setCourses] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { isEnrolledInCourse } = useMyOrders(user);

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

  if (loading) return <PremiumLoader text="Loading courses..." fullScreen={false} />;

  if (!instructor)
    return (
      <p className="text-center py-10 text-red-500">
        Instructor not found for slug: {instructorSlug}
      </p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            className="group relative bg-white/10 border border-gray-300 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full"
          >
            {/* ✅ Thumbnail */}
            <div className="relative h-52 w-full overflow-hidden z-0">
              <Link to={`/courses/${slug}`}>
                <img
                  src={getImageUrl(course.thumbnail) || "/default-course.jpg"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </Link>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
              <span className="absolute top-3 right-3 bg-white/90 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
                {course.level || "Beginner"}
              </span>

              {course.discountPercentage > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse z-10">
                  {course.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* ✅ Info */}
            <div className="relative z-20 p-6 flex flex-col flex-1">
              <Link
                to={`/courses/${slug}`}
                className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition block line-clamp-2 break-words leading-snug"
                title={course.title}
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
                    src={getImageUrl(instructor.image)}
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
              <div className="flex lg:flex-row  md:flex-row flex-wrap justify-start gap-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <FaUserGraduate className="text-emerald-500 text-[14px]" />
                  <span>{course.enrolledCount || 0} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPlayCircle className="text-emerald-500" />
                  <span>{course.totalLessons || 0} Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-emerald-500" />
                  <span>{totalDuration}</span>
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

                <div className="flex flex-col items-end">
                  {course.discountPercentage > 0 ? (
                    <>
                      <span className="text-gray-400 text-xs line-through font-bold">
                        ${course.price}
                      </span>
                      <span className="text-[18px] font-black text-emerald-600">
                        ${(course.price * (1 - course.discountPercentage / 100)).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span
                      className={`text-[18px] font-semibold ${isFree
                        ? "bg-white text-emerald-600 px-6 py-0 rounded-full shadow-sm"
                        : "text-emerald-600"
                        }`}
                    >
                      {isFree ? "Free" : `$${course.price}`}
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

              <div className="border-t border-gray-100 mb-4 mt-auto"></div>

              <div className="border-t border-gray-100 mb-4 mt-auto"></div>

              {isEnrolledInCourse(course._id) ? (
                <Link
                  to={getWatchLink(course, slug)}
                  className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-full transition duration-300 transform hover:-translate-y-0.5 relative z-30"
                >
                  Continue Learning →
                </Link>
              ) : (
                <Link
                  to={`/courses/${slug}`}
                  className="block text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-full transition duration-300 transform hover:-translate-y-0.5 relative z-30"
                >
                  View Details →
                </Link>
              )}
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
const getWatchLink = (course, courseSlug) => {
  if (!course.curriculum || !Array.isArray(course.curriculum)) return `/courses/${courseSlug}`; // Fallback

  for (const section of course.curriculum) {
    if (section.lessons && section.lessons.length > 0) {
      const firstLesson = section.lessons[0];
      const lessonSlug = firstLesson.slug || generateSlug(firstLesson.title) || firstLesson._id;
      return `/watch/courses/${courseSlug}/lessons/${lessonSlug}`;
    }
  }
  return `/courses/${courseSlug}`;
};

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
