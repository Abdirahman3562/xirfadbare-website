import { FaCode } from "react-icons/fa6";
import { Link } from "react-router-dom";

function CourseCard({ course }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* ✅ Course Thumbnail */}
      <div className="relative">
        <img
          src={course.thumbnail || "/default-course.jpg"}
          alt={course.title}
          className="h-48 w-full object-cover"
        />
        {/* overlay badge for course type */}
        <span className="absolute top-3 left-3 bg-[#00cc8f] text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md">
          {course.type}
        </span>
      </div>

      {/* ✅ Course Info */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* ✅ Duration & Price */}
        <div className="flex justify-between items-center mb-5 text-sm font-medium">
          <span className="text-indigo-600">⏱ {course.duration || "N/A"}</span>
          <span className="text-indigo-600 font-semibold">
            💰 ${course.price}
          </span>
        </div>

        <div className="border-t border-gray-100 mb-5"></div>

        {/* ✅ Bottom Row */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <span className="flex flex-wrap items-center gap-2 bg-orange-50 text-orange-700 font-semibold px-3 py-1 rounded-full shadow-sm break-words max-w-full">
            <FaCode className="text-orange-500 flex-shrink-0" />
            <span className="break-words leading-snug">
              {course.technology}
            </span>
          </span>

          <Link
            to={`/courses/${course.id}`}
            className="bg-[#00cc8f] hover:bg-[#00b67a] text-white font-semibold px-5 py-2 rounded-full shadow-md transition-transform transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
