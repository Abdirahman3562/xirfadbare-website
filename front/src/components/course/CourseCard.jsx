import {
  FaClock,
  FaPlayCircle,
  FaCode,
  FaInfinity,
  FaCalendarAlt,
  FaAward,
  FaStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { FaUserGraduate } from "react-icons/fa6";
import { getImageUrl } from "../../utils/format";
import { useAuth } from "../../hooks/useAuth";
import { useMyOrders } from "../../hooks/useMyOrders";
import { slugify } from "../../utils/slugify";

function CourseCard({ course, isBundle = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEnrolledInCourse, isEnrolledInBundle } = useMyOrders(user);

  // If it's a bundle, we might not have a slug, so generate one or use ID
  const bundleSlug = isBundle ? (course.slug || course._id) : course.slug;
  const detailsLink = isBundle ? `/bundles/${course._id}` : `/courses/${course.slug}`;

  const isEnrolled = isBundle
    ? isEnrolledInBundle(course._id)
    : isEnrolledInCourse(course._id);

  const calcTotalDuration = (curriculumInput) => {
    const curr = curriculumInput || course.curriculum;
    if (!Array.isArray(curr)) return 0;
    let totalSeconds = 0;
    curr.forEach((section) => {
      (section.lessons || []).forEach((lesson) => {
        if (!lesson.duration) return;
        const parts = lesson.duration.split(":");
        if (parts.length === 2) {
          const [m, s] = parts.map(Number);
          totalSeconds += (m || 0) * 60 + (s || 0);
        } else if (parts.length === 3) {
          const [h, m, s] = parts.map(Number);
          totalSeconds += (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
        }
      });
    });
    return totalSeconds;
  };

  const formatDuration = (seconds) => {
    if (seconds === 0) return null;
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // ✅ Aggregate Bundle Stats
  const bundleStats = useMemo(() => {
    if (!isBundle || !Array.isArray(course.courses)) return null;

    let lessons = 0;
    let seconds = 0;
    let cert = false;
    let access = "Lifetime";
    let techs = new Set();

    course.courses.forEach(c => {
      // Lessons
      if (Array.isArray(c.curriculum)) {
        c.curriculum.forEach(section => {
          lessons += (section.lessons?.length || 0);
        });
      }

      // Duration
      seconds += calcTotalDuration(c.curriculum);

      // Certificate
      if (c.hasCertificate) cert = true;

      // Technology
      if (c.technology) techs.add(c.technology);
    });

    return {
      totalLessons: lessons,
      totalDuration: formatDuration(seconds) || "N/A",
      hasCertificate: cert,
      accessType: access,
      technologies: Array.from(techs).join(", ")
    };
  }, [course, isBundle]);

  const totalLessons = isBundle
    ? bundleStats?.totalLessons
    : (Array.isArray(course.curriculum)
      ? course.curriculum.reduce((sum, section) => sum + (section.lessons?.length || 0), 0)
      : 0);

  const totalDuration = isBundle
    ? bundleStats?.totalDuration
    : (formatDuration(calcTotalDuration()) || course.duration || "N/A");

  const hasCertificate = isBundle ? bundleStats?.hasCertificate : course.hasCertificate;
  const accessType = isBundle ? bundleStats?.accessType : course.accessType;
  const technology = isBundle ? bundleStats?.technologies : course.technology;

  const isFree = !course.price || Number(course.price) === 0;

  // ✅ Instructor helpers
  const instructor = course.instructor || {};
  const instructorTitle = instructor.name || "Instructor";

  // ✅ Course Rating Logic
  const courseReviews = instructor?.reviews?.filter(r => String(r.courseId) === String(course._id)) || [];
  const avgRating = parseFloat(courseReviews.length > 0
    ? (courseReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / courseReviews.length).toFixed(1)
    : 0);
  const reviewCount = courseReviews.length;

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= Math.floor(rating);
          const isHalf = !isFull && star <= Math.ceil(rating) && rating % 1 !== 0;
          return isFull ? (
            <FaStar key={star} size={11} className="text-amber-400 shadow-sm" />
          ) : isHalf ? (
            <FaStarHalfAlt key={star} size={11} className="text-amber-400 shadow-sm" />
          ) : (
            <FaStar key={star} size={11} className="text-gray-200 dark:text-slate-700" />
          );
        })}
      </div>
    );
  };
  const initials = useMemo(() => {
    const parts = instructorTitle.trim().split(" ").filter(Boolean);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("");
  }, [instructorTitle]);


  const getFirstLessonSlug = () => {
    if (!course.curriculum || !Array.isArray(course.curriculum)) return null;
    for (const section of course.curriculum) {
      if (section.lessons && section.lessons.length > 0) {
        // Try slug first, then fallback to slugify(title), then ID
        const firstLesson = section.lessons[0];
        return firstLesson.slug || slugify(firstLesson.title) || firstLesson._id || firstLesson.id;
      }
    }
    return null;
  };

  const watchLink = useMemo(() => {
    const lessonSlug = getFirstLessonSlug();
    const courseSlug = course.slug || slugify(course.title);
    if (lessonSlug && courseSlug) {
      return `/watch/courses/${courseSlug}/lessons/${lessonSlug}`;
    }
    return detailsLink;
  }, [course, detailsLink]);

  const handleCtaClick = (e) => {
    if (isEnrolled) {
      e.preventDefault();
      if (isBundle) {
        navigate('/dashboard/orders');
      } else {
        navigate(watchLink);
      }
    }
  };

  return (
    <div className="group relative bg-[#edf4f5] dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden z-0">
        <Link to={isEnrolled ? (isBundle ? '/dashboard/orders' : watchLink) : detailsLink}>
          <img
            src={getImageUrl(course.thumbnail) || "/default-course.jpg"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>

        <span className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full shadow transition-colors">
          {isBundle ? "Bundle" : (course.level || "Beginner")}
        </span>

        {isBundle && (
          <div className="absolute top-3 left-3 bg-emerald-600 text-white p-2 rounded-xl shadow-xl z-20">
            <FaPlayCircle size={14} className="text-white" />
          </div>
        )}

        {!isBundle && course.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse z-10">
            {course.discountPercentage}% OFF
          </span>
        )}

      </div>

      <div className="relative z-20 p-5">
        {course.type && !isBundle && (
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">
            {course.type}
          </span>
        )}
        {isBundle && (
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
            Course Bundle Package
          </span>
        )}
        <Link
          to={detailsLink}
          className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition"
        >
          {course.title}
        </Link>

        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2.5 line-clamp-2">
          {course.description}
        </p>

        {/* 👨‍🏫 Instructor row (NEW) */}
        {!isBundle && (
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
        )}

        {/* Lessons + Duration */}
        <div className="flex justify-between text-[13px] text-gray-700 dark:text-gray-300 mb-3.5 transition-colors">
          <div className="flex gap-1 items-center">
            <FaUserGraduate className="text-emerald-500 text-[12px]" />
            <span className="text-gray-700 dark:text-gray-300 font-medium ml-1">
              {course.enrolledCount || 0}
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
          {accessType ? (
            <span className="flex items-center gap-2 bg-[#edf4f5] dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full shadow-sm transition-colors text-[12px]">
              {accessType.toLowerCase() === "lifetime" ? (
                <FaInfinity className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <FaCalendarAlt className="text-emerald-600 dark:text-emerald-400" />
              )}
              <span>
                {accessType === "Lifetime"
                  ? "Lifetime"
                  : `${accessType}`}
              </span>
            </span>
          ) : (
            <span
              title={technology}
              className="flex items-center gap-2 bg-[#edf4f5] dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full shadow-sm max-w-[180px] truncate transition-colors text-[12px]"
            >
              <FaCode className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="truncate">{technology || "Tech"}</span>
            </span>
          )}

          {/* Price */}
          <div className="flex flex-col items-end">
            {!isEnrolled && (
              <>
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
              </>
            )}
            {isEnrolled && (
              <span className="text-[17px] font-black text-emerald-600 dark:text-emerald-400 leading-none">
                {/* Enrolled status is shown on thumbnail */}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {hasCertificate && (
            <div className="group/cert relative flex items-center gap-2 bg-gradient-to-r from-amber-100/50 to-orange-50/50 dark:from-amber-500/10 dark:to-orange-500/5 text-amber-700 dark:text-amber-400 font-black px-3.5 py-1.5 rounded-xl shadow-sm border border-amber-200/50 dark:border-amber-500/20 w-fit transition-all hover:shadow-md hover:shadow-amber-200/40 dark:hover:shadow-none group-hover:scale-[1.02] duration-300">
              <div className="relative">
                <FaAward className="text-amber-500 text-sm animate-pulse" />
                <div className="absolute inset-0 bg-amber-400 blur-md opacity-20 group-hover/cert:opacity-40 animate-pulse"></div>
              </div>
              <span className="text-[9px] uppercase tracking-[0.05em] relative z-10">Certificate</span>
              <div className="ml-0.5 w-1 h-1 bg-amber-500 rounded-full animate-[pulse_2s_infinite]"></div>
            </div>
          )}

          {reviewCount > 0 && (
            <div className="flex items-center gap-1.5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-gray-100/50 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md hover:border-amber-200/50">
              {renderStars(avgRating)}
              <span className="text-[10px] font-black text-gray-700 dark:text-gray-200">{avgRating}</span>
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">({reviewCount})</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mb-3.5 transition-colors"></div>

        <Link
          to={isEnrolled ? (isBundle ? '/dashboard/orders' : watchLink) : detailsLink}
          className={`block text-center ${isEnrolled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-semibold py-2.5 rounded-full transition duration-300 transform hover:-translate-y-0.5 relative z-30 text-sm`}
        >
          {isEnrolled ? (isBundle ? "My Bundles →" : "Watch Now →") : "View Details →"}
        </Link>
      </div>
    </div>
  );
}

export default CourseCard;
