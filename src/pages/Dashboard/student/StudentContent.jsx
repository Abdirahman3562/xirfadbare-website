import React from "react";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Home,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentContent = ({ user }) => {
  const courses = [
    {
      id: 1,
      title: "Modern JavaScript For Beginners",
      description:
        "Dhis Projects real life ah kuwaas oo aad ku noqon karto professional JavaScript developer.",
      image: "https://i.ibb.co/3zDtkcy/js-course.jpg",
      progress: 0,
      status: "In Progress",
    },
    {
      id: 2,
      title: "PHP For Professionals",
      description:
        "Baro PHP si qoto dheer oo la samee project-yo dhab ah oo lagu shaqayn karo.",
      image: "https://i.ibb.co/7yR7hW3/php-course.jpg",
      progress: 0,
      status: "Not Started",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 mt-20">
      <div className="flex gap-1 items-center ">
        <Link to="/dashboard/student">
          <Home className="w-5 h-5 text-emerald-600 cursor-pointer" />
        </Link>
        <ChevronRight
          className="w-5 h-5 font-bold text-emerald-600"
          style={{ fontSize: "16px" }}
        />
        <span className="text-lg font-semibold mb-1 text-gray-700">
          Student
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 text-[14px] mb-6">
        Welcome to your dashboard.
      </p>
      <div></div>
      {/* Student Dashboard */}
      <section>
        <h1 className="text-2xl font-semibold mb-2">Student Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">
          View your enrolled courses and track your progress.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* No Level */}
          <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-emerald-600 font-semibold text-lg">
                No Level
              </h3>
              <p className="text-gray-700 font-medium">Not Assigned to Level</p>
              <p className="text-sm text-gray-500 mt-2">
                Current Learning Level
              </p>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Regular course access
            </div>
            <div className="absolute top-4 right-4 bg-emerald-100 p-2 rounded-full">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          {/* Active Courses */}
          <div className="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-2xl font-semibold text-emerald-600">2</h3>
            <p className="text-gray-700 font-medium">Active Courses</p>
            <p className="text-sm text-gray-500 mt-1">completed</p>
            <div className="absolute top-4 right-4 bg-emerald-50 p-2 rounded-full">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          {/* Completed */}
          <div className="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">
              Completed Courses
            </h3>
            <p className="text-sm text-gray-500 mt-1">% avg progress</p>
            <div className="absolute top-4 right-4 bg-emerald-50 p-2 rounded-full">
              <Settings className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </section>

      {/* My Courses */}
      <section className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-800">My Courses</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Your enrolled courses and available content
        </p>
        <div className="flex flex-col space-y-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gradient-to-br from-white to-emerald-50/40 border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition"
            >
              {/* image */}
              <div className="md:w-64 w-full h-44 md:h-auto relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {/* badge */}
                {course.status === "In Progress" && (
                  <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full shadow">
                    In Progress
                  </span>
                )}
              </div>
              {/* info */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {course.title}
                    </h3>
                    <span className="text-emerald-600 font-semibold text-sm">
                      {course.progress}%
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    {course.description}
                  </p>
                  <span className="text-sm font-medium text-gray-700">
                    Course Progress
                  </span>
                  <div className="bg-gray-200 rounded-full h-2 w-full mt-1">
                    {/* Corrected inline style for progress bar */}
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>81 of 0 lessons</span>
                    <span>0 remaining</span>
                  </div>
                  <div className="flex items-center gap-8 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">📚</span>
                      <span>Completion 0%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">🗓️</span>
                      <span>Last access 10 months ago</span>
                    </div>
                  </div>
                </div>
                <button className="mt-6 bg-emerald-500 text-white font-medium px-5 py-2 rounded-lg text-sm hover:bg-emerald-600 transition self-start shadow-sm">
                  Continue Learning →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentContent;
