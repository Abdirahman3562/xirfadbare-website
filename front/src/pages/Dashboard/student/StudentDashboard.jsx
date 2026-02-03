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
  Search,
  Layers,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/format";
import { getAllUserProgress } from "../../../api/userProgressService";
import PremiumLoader from "../../../components/ui/PremiumLoader";
import BundleCoursesModal from "../../../components/course/BundleCoursesModal";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../hooks/useAuth";
import { useMyOrders } from "../../../hooks/useMyOrders";

export default function StudentDashboard() {
  const { courses: allCoursesInContext, loading: dataLoading, syncing: dataSyncing } = useData();
  const { user } = useAuth();
  const { orders: userOrders, loading: ordersLoading, refreshing: ordersRefreshing } = useMyOrders(user);

  const [courses, setCourses] = useState(() => {
    // 🚀 Instant Hydration: Try to load from cache immediately to have it ready
    const cachedOrders = JSON.parse(localStorage.getItem('orders_cache'));
    const cachedProgress = JSON.parse(localStorage.getItem('user_progress_cache'));

    if (cachedOrders && cachedOrders.length > 0) {
      const activeOrders = cachedOrders.filter(o => o.status === 'active');
      return activeOrders
        .filter(order => order.paymentType !== 'Bundle Access')
        .map(order => {
          const progress = cachedProgress?.find(p =>
            String(p.course?._id || p.course) === String(order.course || order.courseId)
          );

          // Reconstruct as much as possible from order + progress cache
          return {
            ...order,
            id: order._id,
            title: order.courseTitle || order.course?.title,
            description: order.courseDetails?.description || "Loading course details...",
            image: order.courseDetails?.thumbnail || "https://i.ibb.co/Yk2JmWv/default-course.jpg",
            lessonsCount: order.bundleCourses?.length || order.courseDetails?.curriculum?.reduce((s, sec) => s + (sec.lessons?.length || 0), 0) || 0,
            progress: progress?.progress || 0,
            lastAccess: progress?.lastAccess || order.updatedAt,
            isHydrated: true
          };
        });
    }
    return [];
  });

  // ✅ Start with loading false if we have hydrated data to show it immediately
  const [loading, setLoading] = useState(() => {
    const cachedOrders = JSON.parse(localStorage.getItem('orders_cache'));
    return !(cachedOrders && cachedOrders.length > 0);
  });

  // ✅ Use more granular syncing status
  const isSyncing = dataLoading || ordersLoading || dataSyncing || ordersRefreshing;


  const [showBundleModal, setShowBundleModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isCoursesPage = location.pathname.includes("/courses");

  // ✅ Helper function: slugify titles
  const slugify = (text) =>
    text?.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  useEffect(() => {
    const processDashboardData = async () => {
      // If we are still waiting for critical data and don't have enough to show
      // But only if we don't already have hydrated courses
      if ((dataLoading || ordersLoading) && userOrders.length === 0 && courses.length === 0) {
        return;
      }

      try {
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

        // ✅ Hel dhammaan progress records (Optimized fetch)
        const allProgressRecords = await getAllUserProgress();

        // ✅ Ku dar xogta course + progress
        const enrichedCourses = validOrders
          .filter(order => order.paymentType !== 'Bundle Access')
          .map((order) => {
            try {
              if (order.isBundle) {
                const coursesInBundle = order.bundleCourses || [];
                let totalProgress = 0;
                coursesInBundle.forEach(bc => {
                  const p = allProgressRecords.find(record =>
                    String(record.course?._id || record.course) === String(bc._id)
                  );
                  totalProgress += (p?.progress || 0);
                });

                const avgProgress = coursesInBundle.length > 0
                  ? Math.round(totalProgress / coursesInBundle.length)
                  : 0;

                return {
                  ...order,
                  id: order._id,
                  title: order.courseTitle,
                  image: order.courseDetails?.thumbnail || "https://i.ibb.co/Yk2JmWv/default-course.jpg",
                  lessonsCount: coursesInBundle.length,
                  progress: avgProgress,
                  lastAccess: order.updatedAt,
                  isBundle: true
                };
              }

              const course = allCoursesInContext.find(
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
                  progress: 0,
                  lastAccess: null,
                };
              }

              const totalLessons = (course.curriculum || []).reduce(
                (sum, section) => sum + (section.lessons?.length || 0),
                0
              );

              const userProgress = allProgressRecords.find(p =>
                String(p.course?._id || p.course) === String(course._id)
              );

              return {
                ...order,
                id: order._id,
                title: course.title || order.courseTitle,
                description: course.description || "No description available.",
                image: course.thumbnail || "https://i.ibb.co/Yk2JmWv/default-course.jpg",
                lessonsCount: totalLessons,
                progress: userProgress?.progress || 0,
                lastAccess: userProgress?.lastAccess || null,
                courseSlug: slugify(course.title),
                currentLesson: userProgress?.currentLesson,
              };
            } catch (error) {
              return { ...order, id: order._id, progress: 0 };
            }
          });

        setCourses(enrichedCourses);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error loading dashboard:", err);
        setLoading(false);
      }
    };

    processDashboardData();
  }, [allCoursesInContext, userOrders, dataLoading, ordersLoading]);

  // ✅ Handle transition and syncing status
  useEffect(() => {
    if (!dataLoading && !ordersLoading) {
      // Add a small 600ms delay so the "loading yar" is actually visible if it was very fast
      const timer = setTimeout(() => {
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [dataLoading, ordersLoading]);

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
          {isCoursesPage ? "My Courses" : "Dashboard"}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {isCoursesPage ? "My Courses" : "My Learning"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-[14px] mb-6">
          {isCoursesPage
            ? "Manage and access all your enrolled courses."
            : "Access your enrolled courses and track your learning progress."}
        </p>
      </div>

      {/* Stats Section - ONLY SHOW ON DASHBOARD AND WHEN DATA IS READY */}
      {!isCoursesPage && (courses.length > 0 || (!loading && !isSyncing)) && (
        <section>
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
      )}

      {/* Course List */}
      <section className="mt-4">
        {!isCoursesPage && (
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Courses</h2>
          </div>
        )}

        {(loading || (isSyncing && courses.length === 0)) ? (
          <div className="flex justify-center py-12">
            <PremiumLoader text={null} fullScreen={false} />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white/10 dark:bg-slate-800/50 backdrop-blur-md border border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-center transition-colors duration-500">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full mb-4">
              <BookOpen className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Start Your Learning Journey</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              You haven't enrolled in any courses yet. Explore our catalog and find the perfect course for you.
            </p>
            <Link
              to="/courses"
              className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-95"
            >
              <Search className="w-5 h-5" />
              Browse Courses
            </Link>
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
                  className="group relative bg-white/10 dark:bg-slate-800/50 backdrop-blur-md border border-gray-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col md:flex-row"
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
                        <h3 className="font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-gray-900 dark:text-white text-lg transition-colors line-clamp-2 leading-tight mb-2 break-all">
                          {course.title}
                        </h3>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                          {progressValue}%
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-relaxed line-clamp-2 break-words">
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
                          {course.isBundle ? 'Included Courses' : `${done} of ${totalLessons} lessons`}
                        </span>
                        <span>{course.isBundle ? 'Available' : `${remaining} remaining`}</span>
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

                    <button
                      onClick={() => {
                        if (course.isBundle) {
                          setSelectedBundle(course);
                          setShowBundleModal(true);
                        } else {
                          navigate(`/watch/courses/${course.courseSlug || slugify(course.title)}/lessons/${slugify(course.currentLesson || "introduction")}`);
                        }
                      }}
                      className={`mt-6 font-medium px-5 py-2 rounded-lg text-sm transition self-start shadow-sm flex items-center gap-2 ${course.status === "pending"
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed pointer-events-none"
                        : "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600"
                        }`}
                    >
                      {course.status === "pending" ? (
                        <>
                          <Clock className="w-4 h-4" />
                          Awaiting Approval
                        </>
                      ) : course.isBundle ? (
                        <>
                          <Layers className="w-4 h-4" />
                          View Courses
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

      {/* ✅ Bundle Courses Modal */}
      <BundleCoursesModal
        isOpen={showBundleModal}
        onClose={() => setShowBundleModal(false)}
        bundleOrder={selectedBundle}
        allCourses={allCoursesInContext}
      />
    </div>
  );
}
