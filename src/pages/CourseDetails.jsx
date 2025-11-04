import { toast } from "react-toastify";
import { FaCode, FaArrowLeft } from "react-icons/fa6";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:3000/course/${id}`);
        const data = await res.json();
        setCourse(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCourse();
  }, [id]);

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3000/course/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setShowModal(false);
      toast.success("✅ Course deleted successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate("/courses");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-indigo-600 font-semibold text-xl">
        Loading course details...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-indigo-50 via-white to-indigo-100 min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative w-full h-72 md:h-96 overflow-hidden">
        <img
          src={course.thumbnail || "/default-course.jpg"}
          alt={course.title}
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
            {course.title}
          </h1>
          <p className="text-lg font-medium opacity-90 capitalize">
            {course.type}
          </p>
        </div>
      </section>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto p-6">
        <Link
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-medium"
          to="/courses"
        >
          <FaArrowLeft /> Back to Courses
        </Link>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-[7fr_4fr] gap-10">
        {/* Left: Course Info */}
        <main>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-3 py-1 rounded-full">
                {course.type}
              </span>
              <div className="flex items-center gap-2 text-emerald-600 font-medium mt-3 sm:mt-0">
                <FaCode />
                {course.technology}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Course Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {course.description}
            </p>

            <div className="mt-8 border-t border-gray-200 pt-4 flex justify-between text-indigo-600 font-semibold">
              <p>⏱ Duration: {course.duration}</p>
              <p>💰 Price: ${course.price}</p>
            </div>
          </div>
        </main>

        {/* Right: Instructor Info */}
        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              👨‍🏫 Instructor
            </h2>
            <p className="text-lg font-semibold text-indigo-700">
              {course.instructor.name}
            </p>
            <p className="text-gray-600 mt-2">
              {course.instructor.description}
            </p>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Contact Email
              </h3>
              <p className="text-indigo-600 bg-indigo-50 py-2 px-3 rounded-md mb-3">
                {course.instructor.contactEmail}
              </p>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Contact Phone
              </h3>
              <p className="text-indigo-600 bg-indigo-50 py-2 px-3 rounded-md">
                {course.instructor.contactPhone}
              </p>
            </div>
          </div>

          {/* Manage Buttons */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              ⚙️ Manage Course
            </h3>
            <Link
              to={`/edit-course/${id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="block w-full text-center bg-emerald-500 text-white font-semibold py-2 rounded-full shadow-md cursor-pointer hover:bg-emerald-600 transition hover:shadow-lg duration-300"
            >
              Edit Course
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="w-full mt-3 cursor-pointer  bg-red-500 text-white py-2 rounded-full font-semibold hover:bg-red-600 transition"
            >
              Delete Course
            </button>
          </div>
        </aside>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[90%] sm:w-[26rem] shadow-2xl animate-[fadeInUp_0.3s_ease]">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this course? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 px-5 py-2 rounded-full hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 font-medium"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetails;
