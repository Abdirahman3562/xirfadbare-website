import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PlayCircle,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  Users,
  MessageCircle,
  Trophy,
} from "lucide-react";
import { FaBookOpen, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { getAllCourses } from "../../../api/courseService";
import { getMyOrders } from "../../../api/orderService";
import { getUserProgress, updateUserProgress } from "../../../api/userProgressService";
import PremiumLoader from "../../../components/ui/PremiumLoader";
import CompletionModal from "../../../components/ui/CompletionModal";

const CourseDashboard = () => {
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();

  // Data
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]); // sections with lessons[]
  const [lessons, setLessons] = useState([]); // all lessons (flat)

  // UI / state
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]); // [lessonId]
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({}); // { [index]: bool }
  const [showLessons, setShowLessons] = useState(false); // mobile
  const [showAlert, setShowAlert] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Helpers
  const allLessonIds = useMemo(
    () => curriculum.flatMap((s) => s.lessons.map((l) => l.id)),
    [curriculum]
  );

  const totalLessonsCount = useMemo(
    () => curriculum.reduce((sum, s) => sum + s.lessons.length, 0),
    [curriculum]
  );

  // ✅ Hubi in completedLessons aanu ka badin totalLessonsCount
  const completedLessonsCount = Math.min(
    completedLessons.length,
    totalLessonsCount
  );

  // ✅ Xisaabi progress-ka adigoo hubinaya inuusan dhaafin 100%
  const progress =
    totalLessonsCount > 0
      ? Math.min(
        100,
        Math.round((completedLessonsCount / totalLessonsCount) * 100)
      )
      : 0;

  // Helper function (ku dar meel sare, ka hor useEffect)
  const slugify = (text) =>
    text
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  // -----------------------------
  // Fetch course + curriculum + lessons
  // -----------------------------
  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // ✅ Get all courses from backend
      const allCourses = await getAllCourses();

      // ✅ Find course by slug
      const courseInfo =
        allCourses.find((c) => slugify(c.title) === courseSlug) || null;
      if (!courseInfo) {
        navigate("/dashboard/student", { replace: true });
        return;
      }

      // ✅ Check if user has access to this course
      const userOrders = await getMyOrders();

      const hasAccess = userOrders.some(
        (order) =>
          (order.course === courseInfo._id || order.courseId === courseInfo._id) &&
          order.status === "active"
      );

      if (!hasAccess) {
        navigate("/dashboard/student", { replace: true });
        return;
      }

      // ✅ Process curriculum data (already embedded in course)
      const curriculumData = courseInfo.curriculum || [];

      // ✅ Flatten lessons and preserve section reference
      const allLessons = curriculumData.flatMap((section) =>
        (section.lessons || []).map((lesson) => ({
          ...lesson,
          id: String(lesson._id || lesson.id),
          sectionId: String(section._id || section.id),
        }))
      );

      // ✅ Add slugs to lessons for navigation
      const lessonsWithSlugs = allLessons.map((lesson) => ({
        ...lesson,
        slug: lesson.slug || slugify(lesson.title),
        curriculumId: String(lesson.curriculumId || lesson.sectionId)
      }));

      // ✅ Group lessons by curriculum sections
      const grouped = curriculumData.map((section) => {
        const sId = String(section._id || section.id);
        const sectionLessons = lessonsWithSlugs.filter(
          (lesson) => String(lesson.curriculumId) === sId
        );
        return { ...section, id: sId, lessons: sectionLessons };
      });

      setCourse(courseInfo);
      setCurriculum(grouped);
      setLessons(lessonsWithSlugs);

      // ✅ Fetch user progress from backend
      const userProgress = await getUserProgress(courseInfo._id);

      let savedCurrentLessonId = null;
      if (userProgress && userProgress.completedLessons) {
        // Normalize completed lessons to strings
        const normalizedCompleted = (userProgress.completedLessons || []).map(id => String(id));
        setCompletedLessons(normalizedCompleted);

        if (userProgress.currentLesson) {
          savedCurrentLessonId = String(userProgress.currentLesson);
          const current = lessonsWithSlugs.find(
            (l) => String(l.id) === savedCurrentLessonId
          );
          if (current) setCurrentLesson(current);
        }
      } else {
        // fallback if no progress found
        setCompletedLessons([]);
      }

      // ✅ Initial lesson
      let initial =
        allLessons.find((l) => slugify(l.title) === lessonSlug) ||
        (savedCurrentLessonId ? allLessons.find((l) => String(l.id) === String(savedCurrentLessonId)) : null) ||
        grouped?.[0]?.lessons?.[0] ||
        null;

      setCurrentLesson(initial);
      if (!lessonSlug && initial) {
        navigate(
          `/watch/courses/${courseSlug}/lessons/${slugify(initial.title)}`,
          { replace: true }
        );
      }
    } catch (err) {
      console.error("❌ Error fetching course data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user =
      JSON.parse(localStorage.getItem("loggedInUser")) ||
      JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    fetchCourseData();
  }, [courseSlug, navigate]);

  // -----------------------------
  // Persist progress for this course
  // -----------------------------
  // ✅ Persist progress to userProgress.json via JSON Server
  // -----------------------------
  useEffect(() => {
    if (!currentLesson) return;

    const user =
      JSON.parse(localStorage.getItem("loggedInUser")) ||
      JSON.parse(localStorage.getItem("user"));
    const userId = user?.id || user?._id || user?.uid;
    if (!userId) return;

    const now = new Date().toISOString();

    const savedData = {
      userId,
      courseId: course?.id,
      completedLessons,
      currentLesson: currentLesson.id,
      lastAccess: {
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        date: now,
      },
    };

    const syncProgress = async () => {
      try {
        if (loading || !course?._id || totalLessonsCount === 0) return;

        const progressData = {
          completedLessons: completedLessons.map(id => String(id)),
          currentLesson: String(currentLesson.id),
          progress: progress, // Use the already calculated progress state/variable
          timeSpent: 0,
        };

        await updateUserProgress(course._id, progressData);
      } catch (error) {
        console.error("❌ Error syncing user progress:", error);
      }
    };

    if (!loading) {
      syncProgress();
    }
  }, [completedLessons, currentLesson, courseSlug, loading]);

  // -----------------------------
  // Auto open active lesson's section (and close others)
  // -----------------------------
  useEffect(() => {
    if (!currentLesson || !curriculum.length) return;

    const sectionIndex = curriculum.findIndex((section) =>
      section.lessons.some((lesson) => lesson.id === currentLesson.id)
    );

    if (sectionIndex !== -1) {
      setOpenSections(() => {
        const next = {};
        for (let i = 0; i < curriculum.length; i++)
          next[i] = i === sectionIndex;
        return next;
      });
    }
  }, [currentLesson, curriculum]);

  // -----------------------------
  // UI helpers
  // -----------------------------
  const toggleSection = (index) =>
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));

  const calcSectionDuration = (ls) => {
    const totalMinutes = ls.reduce((sum, lesson) => {
      const duration = lesson.duration?.split(":") || ["0", "0"];
      const minutes = parseInt(duration[0]) || 0;
      return sum + minutes;
    }, 0);
    return `${ls.length} lessons • ${totalMinutes} min`;
  };

  const formatVideoUrl = (url) => {
    if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ";
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("embed/")) return url;
    return url;
  };

  // -----------------------------
  // Navigation (prev/next)
  // -----------------------------
  const goToLesson = (lesson) => {
    if (!lesson) return;
    setCurrentLesson(lesson);
    const lessonSlug = lesson.slug ? lesson.slug : slugify(lesson.title);
    navigate(`/watch/courses/${courseSlug}/lessons/${lessonSlug}`);
  };

  const goPrev = () => {
    if (!currentLesson) return;
    const idx = allLessonIds.indexOf(String(currentLesson.id));
    if (idx > 0) {
      const prevId = allLessonIds[idx - 1];
      const prev = lessons.find((l) => String(l.id) === String(prevId)) || null;
      if (prev) goToLesson(prev);
    }
  };

  const goNext = () => {
    if (!currentLesson) return;
    const idx = allLessonIds.indexOf(String(currentLesson.id));
    if (idx !== -1 && idx < allLessonIds.length - 1) {
      const nextId = allLessonIds[idx + 1];
      const next = lessons.find((l) => String(l.id) === String(nextId)) || null;
      if (next) goToLesson(next);
    }
  };

  // 🟢 Next button: Move to next lesson only (no completion)
  const goNextLessonOnly = () => {
    if (!currentLesson) return;
    const idx = allLessonIds.indexOf(String(currentLesson.id));
    if (idx !== -1 && idx < allLessonIds.length - 1) {
      const nextId = allLessonIds[idx + 1];
      const nextLesson = lessons.find((l) => String(l.id) === String(nextId));
      if (nextLesson) {
        goToLesson(nextLesson);
      }
    }
  };

  // -----------------------------
  // Mark as Completed (and auto-next)
  // -----------------------------
  const handleMarkAsCompleted = async () => {
    if (!currentLesson) return;

    const lessonId = String(currentLesson.id);

    // already done? just move to next lesson
    if (completedLessons.includes(lessonId)) {
      goNext();
      return;
    }

    // Use a Set to ensure unique IDs and filter out any potential nulls/undefineds
    const updated = Array.from(new Set([...completedLessons, lessonId])).filter(id => id);
    setCompletedLessons(updated);

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 1400);

    // auto go next if exists
    const idx = allLessonIds.indexOf(lessonId);
    if (idx !== -1 && idx < allLessonIds.length - 1) {
      const nextId = allLessonIds[idx + 1];
      const nextLesson = lessons.find((l) => String(l.id) === String(nextId));
      if (nextLesson) goToLesson(nextLesson);
    }

    // Progress is now synced via UserProgress API in the useEffect above
  };

  useEffect(() => {
    if (!lessonSlug || !lessons.length) return;

    const nextLesson =
      lessons.find((l) => slugify(l.title) === lessonSlug) || null;

    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  }, [lessonSlug, lessons]);


  const handleClaimCertificate = () => {
    // Navigate to certificates page
    navigate("/dashboard/certificates");
    setShowCompletionModal(false);
  };
  // -----------------------------
  // Loading / not found
  // -----------------------------
  if (loading) {
    return <PremiumLoader text={null} />;
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc] dark:bg-slate-900 text-red-500 dark:text-red-400 font-bold transition-colors">
        Course not found!
      </div>
    );
  }

  const isPaid = course.status === "locked"; // if you need to lock future lessons

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex flex-col relative transition-colors duration-500">
      {/* Alert */}
      {showAlert && (
        <div className="fixed top-24 right-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-300 font-bold text-sm tracking-tight">
          Lesson marked as completed!
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm fixed top-0 left-0 w-full z-40 transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/student")}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAsCompleted}
            disabled={completedLessons.includes(currentLesson?.id)}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-bold transition cursor-pointer
              ${completedLessons.includes(currentLesson?.id)
                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
              }`}
          >
            {completedLessons.includes(currentLesson?.id) ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Completed
              </>
            ) : (
              "Mark as Completed"
            )}
          </button>

          {progress === 100 && (
            <button
              onClick={() => setShowCompletionModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none transition transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Trophy className="w-5 h-5" />
              Finish Course
            </button>
          )}

          <button
            onClick={() => setShowLessons(true)}
            className="block lg:hidden text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 pt-[72px] bg-[#f8fafc] dark:bg-slate-900 transition-colors">
        <aside
          className="hidden lg:block scrollbar-hide w-[450px] border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900
          p-5 sticky top-[72px] self-start h-[calc(100vh-72px)] overflow-y-auto
          scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-transparent"
        >
          {/* Progress card */}
          <div className="bg-gray-50 dark:bg-slate-800/50 mt-2 shadow-sm rounded-xl p-6 mb-6 border border-gray-100 dark:border-slate-800 transition-colors" >
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              {course.title}
            </h1>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <FaBookOpen className="text-emerald-500 w-4 h-4" />
                {totalLessonsCount} Lessons
              </span>
              <span className="mx-2 text-gray-300 dark:text-slate-700">|</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {completedLessonsCount} of {totalLessonsCount} lessons completed
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-4" >
            {
              curriculum.map((section, index) => {
                const sectionDuration = calcSectionDuration(section.lessons);
                return (
                  <div
                    key={section.id ?? index}
                    className="group border border-gray-100 dark:border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all"
                  >
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex justify-between items-center p-4"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold w-8 h-8 flex items-center justify-center rounded-lg transition-colors">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {section.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {sectionDuration}
                          </p>
                        </div>
                      </div>
                      {openSections[index] ? (
                        <FaChevronUp className="text-emerald-500 text-sm" />
                      ) : (
                        <FaChevronDown className="text-gray-400 dark:text-slate-600 text-sm" />
                      )}
                    </button>

                    {openSections[index] && (
                      <div className="px-8 pb-4 space-y-3">
                        {section.lessons.map((lesson) => {
                          const isCompleted = completedLessons.includes(
                            lesson.id
                          );
                          const isActive = currentLesson?.id === lesson.id;
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => goToLesson(lesson)}
                              className={`flex justify-between items-center border rounded-xl p-3 transition-all duration-300 cursor-pointer
                              ${isActive
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 dark:border-emerald-500/50 shadow-sm"
                                  : isCompleted
                                    ? "bg-gray-50 dark:bg-slate-800/30 border-gray-200 dark:border-slate-700"
                                    : "border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                }`}
                            >
                              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
                                {isActive ? (
                                  <span className="text-emerald-600 font-bold">▶</span>
                                ) : isCompleted ? (
                                  <span className="text-emerald-500 font-bold">✔</span>
                                ) : (
                                  <PlayCircle className="text-emerald-500 w-4 h-4" />
                                )}
                                <span
                                  className={
                                    isCompleted
                                      ? "line-through text-gray-400 dark:text-gray-600"
                                      : isActive
                                        ? "font-bold text-emerald-700 dark:text-emerald-400"
                                        : "font-medium"
                                  }
                                >
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-gray-500 dark:text-gray-500 text-xs font-medium">
                                {lesson.duration}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 flex flex-col bg-[#f8fafc] dark:bg-slate-900 transition-colors" >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden mb-8 border border-gray-100 dark:border-slate-800 transition-colors">
            <iframe
              className="w-full aspect-video"
              src={formatVideoUrl(currentLesson?.videoUrl)}
              title="Lesson Player"
              allowFullScreen
            />
            {/* Lesson title below the video */}
            <div className="p-6 bg-white dark:bg-slate-800 transition-colors">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {currentLesson?.title || "Select a lesson to start learning"}
              </h2>
            </div>
          </div>

          <div className="flex justify-between items-center mb-12">
            <button
              disabled={!currentLesson}
              onClick={goPrev}
              className="flex items-center px-6 py-3 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>

            <button
              onClick={goNextLessonOnly}
              className="flex items-center px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95 cursor-pointer"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          {/* Course Community Section */}
          {
            course?.communityLink && (
              <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm mt-4 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-lg">
                      Course Community
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Halkan ka hel caawinaad</p>
                  </div>
                </div>

                <a
                  href={course.communityLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl transition-all shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  Join WhatsApp Group
                </a>
              </div>
            )
          }
        </section>
      </main>

      {/* 📱 Mobile Sidebar Overlay */}
      {
        showLessons && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex lg:hidden">
            {/* Sidebar panel */}
            <div className="w-[85%] sm:w-[400px] bg-white dark:bg-slate-900 p-6 overflow-y-auto scrollbar-hide border-r border-gray-100 dark:border-slate-800 animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Course Content</h2>
                <button onClick={() => setShowLessons(false)} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-500 hover:text-emerald-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/50 mt-2 shadow-sm rounded-2xl p-6 mb-6 border border-gray-100 dark:border-slate-800 transition-colors">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <FaBookOpen className="text-emerald-500 w-4 h-4" />
                    {totalLessonsCount} Lessons
                  </span>
                  <span className="mx-2 text-gray-300 dark:text-slate-700">|</span>
                  <span className="font-bold text-emerald-600">
                    {progress}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {completedLessonsCount} of {totalLessonsCount} lessons completed
                </p>
              </div>

              {/* Same accordion as desktop */}
              <div className="space-y-4">
                {curriculum.map((section, index) => {
                  const sectionDuration = calcSectionDuration(section.lessons);
                  return (
                    <div
                      key={section.id ?? index}
                      className="group border border-gray-100 dark:border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all mb-4"
                    >
                      <button
                        onClick={() => toggleSection(index)}
                        className="w-full flex justify-between items-center p-4"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold w-8 h-8 flex items-center justify-center rounded-lg transition-colors">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {section.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {sectionDuration}
                            </p>
                          </div>
                        </div>
                        {openSections[index] ? (
                          <FaChevronUp className="text-emerald-500 text-sm" />
                        ) : (
                          <FaChevronDown className="text-gray-400 dark:text-slate-600 text-sm" />
                        )}
                      </button>

                      {openSections[index] && (
                        <div className="px-8 pb-4 space-y-3">
                          {section.lessons.map((lesson) => {
                            const isCompleted = completedLessons.includes(
                              lesson.id
                            );
                            const isActive = currentLesson?.id === lesson.id;
                            return (
                              <div
                                key={lesson.id}
                                onClick={() => {
                                  setCurrentLesson(lesson);
                                  const lessonSlug = lesson.slug
                                    ? lesson.slug
                                    : slugify(lesson.title);
                                  navigate(
                                    `/watch/courses/${courseSlug}/lessons/${lessonSlug}`
                                  );

                                  setShowLessons(false);
                                }}
                                className={`flex justify-between items-center border rounded-xl p-3 transition-all duration-300 cursor-pointer mb-2
                                ${isActive
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 dark:border-emerald-500/50 shadow-sm"
                                    : isCompleted
                                      ? "bg-gray-50 dark:bg-slate-800/30 border-gray-200 dark:border-slate-700"
                                      : "border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                  }`}
                              >
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
                                  {isActive ? (
                                    <span className="text-emerald-600 font-bold">▶</span>
                                  ) : isCompleted ? (
                                    <span className="text-emerald-500 font-bold">✔</span>
                                  ) : (
                                    <PlayCircle className="text-emerald-500 w-4 h-4" />
                                  )}
                                  <span
                                    className={
                                      isCompleted
                                        ? "line-through text-gray-400 dark:text-gray-600"
                                        : isActive
                                          ? "font-bold text-emerald-700 dark:text-emerald-400"
                                          : "font-medium"
                                    }
                                  >
                                    {lesson.title}
                                  </span>
                                </div>
                                <span className="text-gray-500 dark:text-gray-500 text-xs font-medium">
                                  {lesson.duration}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* click backdrop to close */}
            <div
              onClick={() => setShowLessons(false)}
              className="flex-1 bg-transparent"
            />
          </div>
        )
      }
      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        courseTitle={course.title}
        hasCertificate={course.hasCertificate}
        onClaimCertificate={handleClaimCertificate}
      />
    </div>
  );
};

export default CourseDashboard;
