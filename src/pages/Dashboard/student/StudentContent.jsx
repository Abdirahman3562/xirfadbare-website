import React, { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Home,
  Settings,
  PlayCircle,
  Clock,
  CheckCircle,
  CalendarClock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const StudentContent = () => {
  const navigate = useNavigate(); 
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // ✅ Hel user-kii login-garay
        const user =
          JSON.parse(localStorage.getItem("loggedInUser")) ||
          JSON.parse(localStorage.getItem("user"));
        const userId = user?.id || user?._id || user?.uid;

        if (!userId) {
          console.warn("⚠️ No logged-in user found!");
          setCourses([]);
          setLoading(false);
          return;
        }

        // ✅ Hel orders-ka
        const res = await fetch("http://localhost:4010/orders");
        const orders = await res.json();

        // ✅ Filter user-kan keliya
        const userOrders = orders.filter(
          (order) => String(order.userId) === String(userId)
        );

        if (userOrders.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        // ✅ Enrich courses
        const enrichedCourses = await Promise.all(
          userOrders.map(async (order) => {
            try {
              const resCourse = await fetch(
                `http://localhost:3000/courses?id=${Number(order.courseId)}`
              );
              const courseData = await resCourse.json();
              const course = courseData[0];

              const resCurriculum = await fetch(
                `http://localhost:4003/curriculum?courseId=${order.courseId}`
              );
              const curriculum = await resCurriculum.json();
              const curriculumIds = curriculum.map((c) => c.id);

              // ✅ Hel casharada saxda ah
              let lessons = [];
              try {
                const resLessons = await fetch("http://localhost:4004/lessons");
                const allLessons = await resLessons.json();
                lessons = allLessons.filter((lesson) =>
                  curriculumIds
                    .map(String)
                    .includes(String(lesson.curriculumId))
                );
              } catch (err) {
                console.error("⚠️ Error fetching lessons:", err);
              }

              return {
                ...order,
                title: course?.title || order.courseTitle,
                description:
                  course?.description ||
                  "No description available for this course.",
                image:
                  course?.thumbnail ||
                  "https://i.ibb.co/Yk2JmWv/default-course.jpg",
                lessonsCount: lessons.length || 0,
                progress: Number(order.progress) || 0, // ✅ Hubi in uu number yahay
              };
            } catch (err) {
              console.error("⚠️ Error enriching course:", err);
              return {
                ...order,
                title: order.courseTitle,
                description: "Course details unavailable.",
                image: "https://i.ibb.co/Yk2JmWv/default-course.jpg",
                lessonsCount: 0,
                progress: 0,
              };
            }
          })
        );

        setCourses(enrichedCourses);
      } catch (err) {
        console.error("❌ Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // 📊 Stats
  const activeCourses = courses.filter((c) => c.status === "active").length;
  const pendingCourses = courses.filter((c) => c.status === "pending").length;
  const completedCourses = courses.filter(
    (c) => c.status === "completed"
  ).length;

  const avgProgress = courses.length
    ? Math.round(
        courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length
      )
    : 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 mt-20">
      {/* Breadcrumb */}
      <div className="flex gap-1 items-center">
        <Link to="/dashboard/student">
          <Home className="w-5 h-5 text-emerald-600 cursor-pointer" />
        </Link>
        <ChevronRight className="w-5 h-5 font-bold text-emerald-600" />
        <span className="text-lg font-semibold mb-1 text-gray-700">
          Student
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 text-[14px] mb-6">
        Welcome to your dashboard.
      </p>

      {/* Stats Section */}
      <section>
        <h1 className="text-2xl font-semibold mb-2">Student Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">
          View your enrolled courses and track your progress.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Level */}
          <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-emerald-600 font-semibold text-lg">
                No Level
              </h3>
              <p className="text-gray-700 font-medium">Not Assigned</p>
              <p className="text-sm text-gray-500 mt-2">
                Current Learning Level
              </p>
            </div>
            <div className="absolute top-4 right-4 bg-emerald-100 p-2 rounded-full">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Active & Pending */}
          <div className="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-2xl font-semibold text-emerald-600">
              {activeCourses}
            </h3>
            <p className="text-gray-700 font-medium">Active Courses</p>
            <p className="text-sm text-gray-500 mt-1">
              {pendingCourses} Pending
            </p>
            <div className="absolute top-4 right-4 bg-emerald-50 p-2 rounded-full">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Completed */}
          <div className="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">
              Completed Courses
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {completedCourses} completed · {avgProgress}% avg progress
            </p>
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
          Your enrolled courses and available content.
        </p>

        {loading ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-center">
            <p>Loading your courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-center">
            <p>No courses found for your account.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {courses.map((course) => {
              const progressValue = Number(course.progress) || 0;
              const totalLessons = Number(course.lessonsCount) || 0;
              const lessonsDone = Math.round(
                (progressValue / 100) * totalLessons
              );
              const remaining = totalLessons - lessonsDone;

              return (
                <div
                  key={course.id}
                  className="group relative bg-[#ffffff] border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col md:flex-row"
                >
                  {/* Thumbnail */}
                  <div className="md:w-64 w-full h-44 md:h-auto relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {course.status === "active" && (
                      <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                        <PlayCircle size={13} />
                        In Progress
                      </span>
                    )}
                    {course.status === "pending" && (
                      <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                        <Clock size={13} />
                        Pending Approval
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold group-hover:text-emerald-600 text-gray-900 text-lg">
                          {course.title}
                        </h3>
                        <span className="text-emerald-600 font-semibold text-sm">
                          {progressValue}%
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {course.description}
                      </p>

                      <span className="text-sm font-medium text-gray-700">
                        Course Progress
                      </span>
                      <div className="bg-gray-200 rounded-full h-2 w-full mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            course.status === "pending"
                              ? "bg-yellow-400"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${progressValue}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span className="flex gap-2 items-center">
                          <BookOpen className="w-4 h-4 text-emerald-600 mt-1" />
                          {lessonsDone} of {totalLessons} lessons
                        </span>
                        <span>{remaining} remaining</span>
                      </div>

                      {/* Completion & Last Access */}
                      <div className="flex flex-wrap items-center gap-8 mt-5 text-sm text-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-50 p-2 rounded-full shadow-sm">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-gray-500">
                              Completion
                            </p>
                            <p className="text-[14px] font-semibold text-gray-800">
                              {progressValue}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-50 p-2 rounded-full shadow-sm">
                            <CalendarClock className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-gray-500">
                              Last access
                            </p>
                            <p className="text-[14px] font-semibold text-gray-800">
                              {progressValue > 0
                                ? new Date().toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Not started yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                       onClick={() => {
                        if (course.status === "active") {
                          navigate(`/watch/courses/${course.courseId}`); // ✅ sida Dugsiiye.com
                        }
                      }}
                      disabled={course.status === "pending"}
                      className={`mt-6 font-medium px-5 py-2 cursor-pointer rounded-lg text-sm transition self-start shadow-sm flex items-center gap-2 ${
                        course.status === "pending"
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-emerald-500 text-white hover:bg-emerald-600"
                      }`}
                    >
                      {course.status === "pending" ? (
                        <>
                          <Clock className="w-4 h-4" />
                          Awaiting Approval
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          Continue Learning
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentContent;
