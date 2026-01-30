import { FaCode, FaArrowLeft } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";
import { getImageUrl } from "../../../utils/format";
import { useState, useEffect } from "react";
import Curriculum from "../../../components/course/Curriculum";
import Testimonials from "../../../components/Home/Testimonials";
import FAQ from "../../../components/Home/FAQ";
import { useData } from "../../../contexts/DataContext";

function CourseDetails() {
  const { getCourseBySlug, loading } = useData();
  const { slug } = useParams();

  // ✅ Hel course-ka si toos ah oo data preloaded ah
  const course = getCourseBySlug(slug);

  // ✅ Update browser tab title
  useEffect(() => {
    if (course?.title) {
      document.title = `${course.title} | Xirfadbaxe`;
    }
  }, [course]);

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-[#edf4f5] dark:bg-slate-900 transition-colors duration-500">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-emerald-600 dark:text-emerald-400 font-bold italic animate-pulse tracking-widest text-sm uppercase">Soo aqrinaya koorsada...</p>
      </div>
    );
  }

  // ❌ Error or not found
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 bg-[#edf4f5] dark:bg-slate-900 transition-colors duration-500">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 text-4xl">😕</div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">KOORSADAN LAMA HELIN!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm font-medium italic">Waan ka xunnahay, koorsada aad raadinayso ma muuqato ama dib ayaa loo saaray. Fadlan iska hubi link-ga.</p>
        <Link to="/courses" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-100 dark:shadow-none active:scale-95">Raadi koorso kale</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#edf4f5] dark:bg-slate-900 relative min-h-screen transition-colors duration-500">
      {/* ✅ Hero Section */}
      <section className="relative  w-full h-72 md:h-96 overflow-hidden rounded-b-2xl shadow-lg">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(course.thumbnail) || "/default-course.jpg"}
            alt={course.title}
            className="w-full h-full object-cover scale-105 blur-[2px]"
          />
          <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
        </div>

        <div className="absolute  inset-0 flex flex-col justify-center items-center text-white text-center px-6 drop-shadow-lg">
          {course.discountPercentage > 0 && (
            <div className="mb-4 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl animate-pulse flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Special Offer: {course.discountPercentage}% Off
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
            {course.title}
          </h1>
          <p className="mt-2 text-sm font-semibold text-emerald-400 uppercase tracking-wide bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            {course.type || "General"}
          </p>
        </div>
      </section>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto p-6 ">
        <Link
          className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium"
          to="/courses"
        >
          <FaArrowLeft /> Back to Courses
        </Link>
      </div>

      {/* ✅ Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-[7fr_4fr] gap-10">
        {/* ===== LEFT ===== */}
        <main>
          {/* ✅ Course Overview */}
          <div className="bg-[#edf4f5] dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-8">
            {/* Course Type + Languages */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3 sm:gap-4">
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full shadow-sm w-fit">
                {course.type || "General"}
              </span>

              <div className="flex flex-col sm:items-end">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  Languages Used:
                </p>
                <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                  {(Array.isArray(course.technology)
                    ? course.technology
                    : course.technology?.split(",") || []
                  ).map((tech, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 text-sm bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium px-3 py-1 rounded-full shadow-sm"
                    >
                      <FaCode className="text-emerald-500" />
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Overview */}
            <h2 className="text-2xl font-bold mb-4 text-emerald-700 dark:text-emerald-400">
              Course Overview
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* ✅ Curriculum Section */}
          <Curriculum
            level={course.level}
            curriculum={course.curriculum}
            learningOutcomes={course.learningOutcomes}
            price={course.price}
            discountPercentage={course.discountPercentage}
            courseId={course._id || course.id}
            enrolledCount={course.enrolledCount}
            courseTitle={course.title}
          />
        </main>

        {/* ===== RIGHT ===== */}
        <aside className="space-y-6">
          {/* ✅ Instructor Info */}
          <div className="bg-[#edf4f5] dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 p-8 rounded-2xl shadow-lg text-center transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
              👨🏫 Instructor
            </h2>

            {course.instructor?.image && (
              <img
                src={getImageUrl(course.instructor.image)}
                alt={course.instructor.name}
                className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-emerald-100 dark:border-slate-800 shadow-md"
              />
            )}

            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {course.instructor?.name || "Instructor"}
            </p>

            {course.instructor?.instructorTitle && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400/80 mt-1">
                {course.instructor.instructorTitle}
              </p>
            )}

            {course.instructor?.description && (
              <p className="text-emerald-700 dark:text-emerald-300 mt-3">
                {course.instructor.description}
              </p>
            )}

            <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4 text-left">
              {course.instructor?.contactEmail && (
                <>
                  <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                    Contact Email
                  </h3>
                  <a
                    href={`mailto:${course.instructor.contactEmail}`}
                    className="text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 py-2 px-3 rounded-md mb-3 break-all block transition duration-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
                  >
                    {course.instructor.contactEmail}
                  </a>
                </>
              )}

              {course.instructor?.contactPhone && (
                <>
                  <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                    Contact Phone
                  </h3>
                  <a
                    href={`https://wa.me/${course.instructor.contactPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 py-2 px-3 rounded-md block transition duration-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
                  >
                    {course.instructor.contactPhone}
                  </a>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ✅ Testimonials Section */}
      <Testimonials />

      {/* ✅ FAQ Section */}
      <FAQ />
    </div>
  );
}

export default CourseDetails;
