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
import { getImageUrl } from "../../../utils/format";
import { getMyOrders } from "../../../api/orderService";
import { getAllCourses } from "../../../api/courseService";
import { getUserProgress } from "../../../api/userProgressService";
import PremiumLoader from "../../../components/ui/PremiumLoader";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Helper function: slugify titles
  const slugify = (text) =>
    text?.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // ✅ Hel orders ee user-kan (backend API)
        const userOrders = await getMyOrders();

        if (userOrders.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        // ✅ Kaliya u dhaaf dalabka 'active', ka saar 'rejected' iyo 'pending'
        const validOrders = userOrders.filter(order => order.status === 'active');

        if (validOrders.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        // ✅ Hel dhammaan courses-ka
        const allCourses = await getAllCourses();

        // ✅ Ku dar xogta course + progress
        const enrichedCourses = await Promise.all(
          validOrders.map(async (order) => {
            try {
              // Hel course info from allCourses
              const course = allCourses.find(
                (c) => c._id === order.course || c._id === order.courseId
              );

              if (!course) {
                return {
                  ...order,
                  id: order._id,
                  title: order.courseTitle,
                  description: "Course details unavailable.",
                  image: "https://i.ibb.co/Yk2JmWv/default-course.jpg",
                  lessonsCount: 0,
                  progress: order.status === "pending" ? 0 : 0,
                  lastAccess: null,
                };
              }

              // ✅ Xisaabi total lessons from curriculum
              const totalLessons = (course.curriculum || []).reduce(
                (sum, section) => sum + (section.lessons?.length || 0),
                0
              );

              // ✅ Hel progress ka backend API
              let userProgress = null;
              try {
                const progressData = await getUserProgress(course._id);
                userProgress = progressData;
              } catch (err) {
                console.warn("⚠️ Failed to fetch user progress:", err);
              }

              // ✅ Xisaabi progress
              const progress = userProgress?.progress || 0;
              const lastAccess = userProgress?.lastAccess || null;

              return {
                ...order,
                id: order._id,
                title: course.title || order.courseTitle,
                description: course.description || "No description available for this course.",
                image: course.thumbnail || "https://i.ibb.co/Yk2JmWv/default-course.jpg",
                lessonsCount: totalLessons,
                progress: order.status === "pending" ? 0 : progress,
                lastAccess: order.status === "pending" ? null : lastAccess,
                courseSlug: course.title?.toLowerCase().replace(/\s+/g, "-"),
                currentLesson: userProgress?.currentLesson,
              };
            } catch (error) {
              console.error("Error processing order:", error);
              return {
                ...order,
                id: order._id,
                title: order.courseTitle,
                description: "Course details unavailable.",
                image: "https://i.ibb.co/Yk2JmWv/default-course.jpg",
                lessonsCount: 0,
                progress: 0,
                lastAccess: null,
              };
            }
          })
        );

        setCourses(enrichedCourses);
      } catch (err) {
        console.error("❌ Error loading courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // 📊 Stats
  const pendingCourses = courses.filter((c) => c.status === "pending").length;
  const activeCourses = courses.filter(
    (c) =>
      c.status !== "pending" &&
      Number(c.progress) > 0 &&
      Number(c.progress) < 100
  ).length;
  const completedCourses = courses.filter(
    (c) => c.status !== "pending" && Number(c.progress) >= 100
  ).length;

  const avgProgress = courses.length
    ? Math.min(
      Math.round(
        courses.reduce((sum, c) => sum + (c.progress || 0), 0) /
        courses.length
      ),
      100
    )
    : 0;

  const userLevel =
    avgProgress >= 80
      ? "Advanced"
      : avgProgress >= 50
        ? "Intermediate"
        : avgProgress > 0
          ? "Beginner"
          : "Not Started";

  const levelColor =
    userLevel === "Advanced"
      ? "text-emerald-600"
      : userLevel === "Intermediate"
        ? "text-yellow-600"
        : userLevel === "Beginner"
          ? "text-blue-600"
          : "text-gray-600";

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex gap-1 items-center">
        <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <ChevronRight className="w-5 h-5 text-emerald-600" />
        <span className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-300">
          Student
        </span>
        <ChevronRight className="w-5 h-5 text-emerald-600" />
        <span className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-300">
          Dashboard
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">My Learning</h1>
      <p className="text-gray-500 dark:text-gray-400 text-[14px] mb-6">
        Access your enrolled courses and track your learning progress.
      </p>

      {/* Stats Section */}
      <section>
        <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">My Courses</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          View and continue your enrolled courses
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* User Level */}
          <div className="relative overflow-hidden rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/20 dark:to-emerald-900/10 p-5 flex flex-col justify-between shadow-sm transition-colors duration-500">
            <div>
              <h3 className={`${levelColor} font-semibold text-lg`}>
                {userLevel}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {userLevel === "Not Started"
                  ? "Start learning today"
                  : "Current Learning Level"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {avgProgress}% overall progress
              </p>
            </div>
            <div className="absolute top-4 right-4 bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-full">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Active */}
          <div className="relative bg-white/10 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm transition-colors duration-500">
            <h3 className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {activeCourses}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Active Courses</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {completedCourses} completed
            </p>
            <div className="absolute top-4 right-4 bg-emerald-50 dark:bg-emerald-500/20 p-2 rounded-full">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Completed */}
          <div className="relative bg-white/10 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm transition-colors duration-500">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Completed Courses
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {completedCourses} completed · {avgProgress}% avg progress
            </p>
            <div className="absolute top-4 right-4 bg-emerald-50 dark:bg-emerald-500/20 p-2 rounded-full">
              <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Course List */}
      <section className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">My Courses</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Your enrolled courses and available content.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <PremiumLoader text={null} fullScreen={false} />
          </div>
        ) : courses.length === 0 ? (
          <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl text-gray-600 dark:text-gray-400 text-center transition-colors duration-500">
            <p>No courses found for your account.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {courses.map((course) => {
              const progressValue = Math.min(Number(course.progress) || 0, 100);
              const totalLessons = Number(course.lessonsCount) || 0;
              const done = Math.round((progressValue / 100) * totalLessons);
              const remaining = Math.max(totalLessons - done, 0);

              return (
                <div
                  key={course._id || course.id}
                  className="group relative bg-white/10 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col md:flex-row"
                >
                  {/* Thumbnail */}
                  <div className="md:w-64 w-full h-44 md:h-auto relative">
                    <img
                      src={getImageUrl(course.image)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Badge */}
                    {course.status === "pending" ? (
                      <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                        <Clock size={13} />
                        Pending
                      </span>
                    ) : course.progress === 100 ? (
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                        <CheckCircle size={13} />
                        Completed
                      </span>
                    ) : course.progress > 0 ? (
                      <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                        <PlayCircle size={13} />
                        In Progress
                      </span>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-gray-900 dark:text-white text-lg transition-colors">
                          {course.title}
                        </h3>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                          {progressValue}%
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-relaxed">
                        {course.description}
                      </p>

                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Course Progress
                      </span>
                      <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-2 w-full mt-1">
                        <div
                          className={`h-2 rounded-full ${course.status === "pending"
                            ? "bg-yellow-400"
                            : "bg-emerald-500"
                            }`}
                          style={{ width: `${progressValue}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span className="flex gap-2 items-center">
                          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1" />
                          {done} of {totalLessons} lessons
                        </span>
                        <span>{remaining} remaining</span>
                      </div>

                      {/* Completion & Last Access */}
                      <div className="flex flex-wrap items-center gap-8 mt-5 text-sm text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-full shadow-sm">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                              Completion
                            </p>
                            <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">
                              {progressValue}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-full shadow-sm">
                            <CalendarClock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                              Last access
                            </p>
                            <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">
                              {course.lastAccess
                                ? new Date(
                                  course.lastAccess.date || course.lastAccess
                                ).toLocaleDateString("en-US", {
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

                    <Link
                      to={`/watch/courses/${course.courseSlug || slugify(
                        course.title
                      )}/lessons/${slugify(
                        course.currentLesson || course.lastAccess?.lessonTitle || "introduction"
                      )}`}
                      className={`mt-6 font-medium px-5 py-2 rounded-lg text-sm transition self-start shadow-sm flex items-center gap-2 ${course.status === "pending"
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed pointer-events-none"
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
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
