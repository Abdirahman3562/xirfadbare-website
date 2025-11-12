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
} from "lucide-react";
import { FaBookOpen, FaChevronDown, FaChevronUp } from "react-icons/fa";

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
  // 🚨 function fetchCourseData meel sare dhig
  const fetchCourseData = async () => {
    try {
      setLoading(true);

      const resCourse = await fetch(`http://localhost:3000/courses`);
      const allCourses = await resCourse.json();

      const courseInfo =
        allCourses.find((c) => slugify(c.title) === courseSlug) || null;
      if (!courseInfo) {
        navigate("/dashboard/student", { replace: true });
        return;
      }

      // ✅ Hubi in order uu active yahay
      const resOrders = await fetch("http://localhost:4010/orders");
      const orders = await resOrders.json();

      const user =
        JSON.parse(localStorage.getItem("loggedInUser")) ||
        JSON.parse(localStorage.getItem("user"));
      const userId = user?.id || user?._id || user?.uid;

      const hasAccess = orders.some(
        (o) =>
          String(o.userId) === String(userId) &&
          String(o.courseId) === String(courseInfo.id) &&
          o.status === "active"
      );

      if (!hasAccess) {
        navigate("/dashboard/student", { replace: true });
        return;
      }

      // ✅ Fetch curriculum
      const resCurriculum = await fetch(
        `http://localhost:4003/curriculum?courseId=${courseInfo.id}`
      );
      const dataCurriculum = await resCurriculum.json();

      // ✅ Fetch lessons
      const resLessons = await fetch("http://localhost:4004/lessons");
      const allLessonsRaw = await resLessons.json();
      const allLessons = allLessonsRaw.map((l) => ({
        ...l,
        slug: l.slug || slugify(l.title),
      }));

      // ✅ Group lessons
      const grouped = dataCurriculum.map((section) => {
        const sectionLessons = allLessons.filter(
          (lesson) => String(lesson.curriculumId) === String(section.id)
        );
        return { ...section, lessons: sectionLessons };
      });

      setCourse(courseInfo);
      setCurriculum(grouped);
      setLessons(allLessons);

      // ✅ Progress
      // ✅ Fetch user progress from JSON server
      const resProgress = await fetch(
        `http://localhost:4011/userProgress?userId=${userId}&courseId=${courseInfo.id}`
      );
      const progressData = await resProgress.json();

      if (progressData.length > 0) {
        const userProgress = progressData[0];
        setCompletedLessons(userProgress.completedLessons || []);
        if (userProgress.currentLesson) {
          const current = allLessons.find(
            (l) => String(l.id) === String(userProgress.currentLesson)
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
        allLessons.find((l) => l.id === savedCurrentId) ||
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
  }, [courseSlug, lessonSlug, navigate]);

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
        const res = await fetch(
          `http://localhost:4011/userProgress?userId=${userId}&courseId=${course?.id}`
        );
        const existing = await res.json();

        if (existing.length > 0) {
          // ✅ Update existing progress (include id)
          await fetch(`http://localhost:4011/userProgress/${existing[0].id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...existing[0],
              ...savedData, // ✅ ensures completedLessons are updated
            }),
          });
        } else {
          // ✅ Create new record with unique id
          await fetch(`http://localhost:4011/userProgress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: crypto.randomUUID(), // 🆕 generate id
              ...savedData,
            }),
          });
        }
      } catch (error) {
        console.error("❌ Error syncing user progress:", error);
      }
    };

    syncProgress();
  }, [completedLessons, currentLesson, courseSlug]);

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
    const idx = allLessonIds.indexOf(currentLesson.id);
    const prevId = allLessonIds[idx - 1];
    const prev = lessons.find((l) => l.id === prevId) || null;
    if (prev) goToLesson(prev);
  };

  const goNext = () => {
    if (!currentLesson) return;
    const idx = allLessonIds.indexOf(currentLesson.id);
    const nextId = allLessonIds[idx + 1];
    const next = lessons.find((l) => l.id === nextId) || null;
    if (next) goToLesson(next);
  };

  // 🟢 Next button: Move to next lesson only (no completion)
  const goNextLessonOnly = () => {
    if (!currentLesson) return;
    const idx = allLessonIds.indexOf(currentLesson.id);
    const nextId = allLessonIds[idx + 1];
    const nextLesson = lessons.find((l) => l.id === nextId);
    if (nextLesson) {
      goToLesson(nextLesson);
    }
  };

  // -----------------------------
  // Mark as Completed (and auto-next)
  // -----------------------------
  const handleMarkAsCompleted = async () => {
    if (!currentLesson) return;

    // already done? just move to next lesson
    if (completedLessons.includes(currentLesson.id)) {
      goNext();
      return;
    }

    const updated = [...completedLessons, currentLesson.id];
    setCompletedLessons(updated);

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 1400);

    // auto go next if exists
    const idx = allLessonIds.indexOf(currentLesson.id);
    const nextId = allLessonIds[idx + 1];
    if (nextId) {
      const nextLesson = lessons.find((l) => l.id === nextId);
      if (nextLesson) goToLesson(nextLesson);
    }

    // optional backend sync
    try {
      if (course?.id) {
        await fetch(`http://localhost:3000/courses/${course.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completedLessons: updated }),
        });
      }
    } catch {
      // ignore (local progress still ok)
    }
  };

  useEffect(() => {
    if (!lessonSlug || !lessons.length) return;

    const nextLesson =
      lessons.find((l) => slugify(l.title) === lessonSlug) || null;

    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  }, [lessonSlug, lessons]);
  // -----------------------------
  // Loading / not found
  // -----------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading course content...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Course not found!
      </div>
    );
  }

  const isPaid = course.status === "locked"; // if you need to lock future lessons

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative">
      {/* Alert */}
      {showAlert && (
        <div className="fixed top-20 right-5 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Lesson marked as completed!
        </div>
      )}

      {/* HEADER */}
      <header className="flex mt-15 items-center justify-between px-4 py-2 pt-5 bg-[#edf4f5] shadow-sm fixed top-0 left-0 w-full z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/student")}
            className="flex items-center text-gray-700 hover:text-emerald-600 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAsCompleted}
            disabled={completedLessons.includes(currentLesson?.id)}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition
              ${
                completedLessons.includes(currentLesson?.id)
                  ? "bg-emerald-200 text-emerald-900 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
          >
            {completedLessons.includes(currentLesson?.id) ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-900" />
                Completed
              </>
            ) : (
              "Mark as Completed"
            )}
          </button>

          <button
            onClick={() => setShowLessons(true)}
            className="block lg:hidden text-gray-700 hover:text-emerald-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* LAYOUT */}
      <main className="flex flex-1 pt-[72px] mt-12 bg-[#edf4f5]">
        {/* SIDEBAR */}
        <aside
          className="hidden lg:block scrollbar-hide w-[500px] border-r border-[#d6dedf] bg-[#edf4f5]
           p-5 sticky top-[90px] self-start max-h-[calc(100vh-100px)] overflow-y-auto
           scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-gray-100"
        >
          {/* Progress card */}
          <div className="bg-[#edf4f5] mt-2 shadow-sm rounded-xl p-7 mb-6 border border-gray-100">
            <h1 className="text-lg sm:text-xl font-semibold text-[#0f172a] mb-1">
              {course.title}
            </h1>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <FaBookOpen className="text-emerald-500 w-4 h-4" />
                {totalLessonsCount} Lessons
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-medium text-emerald-600">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
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
          <div className="space-y-4">
            {curriculum.map((section, index) => {
              const sectionDuration = calcSectionDuration(section.lessons);
              return (
                <div
                  key={section.id ?? index}
                  className="group border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/40 transition"
                >
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full flex justify-between items-center p-4"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="bg-emerald-100 text-emerald-600 font-semibold w-8 h-8 flex items-center justify-center rounded-full">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-emerald-400">
                          {section.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {sectionDuration}
                        </p>
                      </div>
                    </div>
                    {openSections[index] ? (
                      <FaChevronUp className="text-emerald-500 text-sm" />
                    ) : (
                      <FaChevronDown className="text-gray-400 text-sm" />
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
                            className={`flex justify-between items-center border rounded-lg p-2 transition duration-300 cursor-pointer
                              ${
                                isActive
                                  ? "bg-emerald-100 border-emerald-500"
                                  : isCompleted
                                  ? "bg-emerald-50 border-emerald-300"
                                  : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                              }`}
                          >
                            <div className="flex items-center gap-2 text-gray-700 text-sm">
                              {isActive ? (
                                <span className="text-emerald-600 font-bold">
                                  ▶
                                </span>
                              ) : isCompleted ? (
                                <span className="text-emerald-500 font-bold">
                                  ✔
                                </span>
                              ) : (
                                <PlayCircle className="text-emerald-500 w-4 h-4" />
                              )}
                              <span
                                className={
                                  isCompleted
                                    ? "line-through text-gray-400"
                                    : isActive
                                    ? "font-semibold text-emerald-700"
                                    : ""
                                }
                              >
                                {lesson.title}
                              </span>
                            </div>
                            <span className="text-gray-500 text-xs">
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
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 overflow-y-auto p-5 md:p-8 flex flex-col">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <iframe
              className="w-full h-[240px] sm:h-[320px] md:h-[480px]"
              src={formatVideoUrl(currentLesson?.videoUrl)}
              title="Lesson Player"
              allowFullScreen
            />
            {/* Lesson title below the video */}
            <div className="p-4 border-t border-gray-100 bg-[#edf4f5]">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {currentLesson?.title || "Select a lesson to start learning"}
              </h2>
            </div>
          </div>

          <div className="flex justify-between items-center mb-10">
            <button
              disabled={!currentLesson}
              onClick={goPrev}
              className="flex items-center px-5 py-2 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>

            <button
              onClick={goNextLessonOnly}
              className="flex items-center px-5 py-2 rounded-md text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          {/* Course Community Section */}
          {course?.communityLink && (
            <div className="bg-[#edf4f5] border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-800 text-base">
                  Course Community
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">Join our community</p>

              <a
                href={course.communityLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-medium px-4 py-3 rounded-lg hover:bg-emerald-100 transition"
              >
                <MessageCircle className="w-5 h-5" />
                Join WhatsApp Group
              </a>

              <p className="text-xs text-gray-500 mt-2">
                Connect with other students and get help from instructors.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* 📱 Mobile Sidebar Overlay */}
      {showLessons && (
        <div className="fixed inset-0 z-50 bg-black/40 flex lg:hidden md:hidden">
          {/* Sidebar panel */}
          <div className="w-[85%] sm:w-[400px] bg-[#edf4f5] p-5 overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Course Content</h2>
              <button onClick={() => setShowLessons(false)}>
                <X className="w-6 h-6 text-gray-600 hover:text-emerald-600" />
              </button>
            </div>

            <div className="bg-[#edf4f5] mt-2 shadow-sm rounded-xl p-7 mb-6 border border-gray-100">
              <h1 className="text-lg sm:text-xl font-semibold text-[#0f172a] mb-1">
                {course.title}
              </h1>
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <FaBookOpen className="text-emerald-500 w-4 h-4" />
                  {totalLessonsCount} Lessons
                </span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="font-medium text-emerald-600">
                  {progress}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
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
                    className="group border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/40 transition"
                  >
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex justify-between items-center p-4"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="bg-emerald-100 text-emerald-600 font-semibold w-8 h-8 flex items-center justify-center rounded-full">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-emerald-400">
                            {section.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {sectionDuration}
                          </p>
                        </div>
                      </div>
                      {openSections[index] ? (
                        <FaChevronUp className="text-emerald-500 text-sm" />
                      ) : (
                        <FaChevronDown className="text-gray-400 text-sm" />
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
                              className={`flex justify-between items-center border rounded-lg p-2 transition duration-300 cursor-pointer
                                ${
                                  isActive
                                    ? "bg-emerald-100 border-emerald-500"
                                    : isCompleted
                                    ? "bg-emerald-50 border-emerald-300"
                                    : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                                }`}
                            >
                              <div className="flex items-center gap-2 text-gray-700 text-sm">
                                {isActive ? (
                                  <span className="text-emerald-600 font-bold">
                                    ▶
                                  </span>
                                ) : isCompleted ? (
                                  <span className="text-emerald-500 font-bold">
                                    ✔
                                  </span>
                                ) : (
                                  <PlayCircle className="text-emerald-500 w-4 h-4" />
                                )}
                                <span
                                  className={
                                    isCompleted
                                      ? "line-through text-gray-400"
                                      : isActive
                                      ? "font-semibold text-emerald-700"
                                      : ""
                                  }
                                >
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-gray-500 text-xs">
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
      )}
    </div>
  );
};

export default CourseDashboard;
