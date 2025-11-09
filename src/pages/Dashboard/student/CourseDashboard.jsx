import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, PlayCircle, ArrowRight, Menu, X } from "lucide-react";
import { FaBookOpen, FaChevronDown, FaChevronUp, FaLock } from "react-icons/fa";

const CourseDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]); // ✅ array
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({});
  const [showLessons, setShowLessons] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // ✅ Fetch course + restore local progress
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        const resCourse = await fetch(`http://localhost:3000/courses?id=${id}`);
        const dataCourse = await resCourse.json();
        const courseInfo = dataCourse[0];

        const resCurriculum = await fetch(
          `http://localhost:4003/curriculum?courseId=${id}`
        );
        const dataCurriculum = await resCurriculum.json();

        const resLessons = await fetch("http://localhost:4004/lessons");
        const allLessons = await resLessons.json();

        const grouped = dataCurriculum.map((section) => {
          const sectionLessons = allLessons.filter(
            (lesson) => String(lesson.curriculumId) === String(section.id)
          );
          return { ...section, lessons: sectionLessons };
        });

        setCourse(courseInfo);
        setCurriculum(grouped);
        setLessons(allLessons);

        // ✅ Restore local storage progress
        const saved = JSON.parse(localStorage.getItem(`progress_${id}`));
        if (saved) {
          setCompletedLessons(saved.completedLessons || []);
          const lesson = allLessons.find((l) => l.id === saved.currentLesson);
          setCurrentLesson(lesson || grouped[0]?.lessons[0]);
        } else if (grouped[0]?.lessons?.length > 0) {
          setCurrentLesson(grouped[0].lessons[0]);
        }
      } catch (err) {
        console.error("❌ Error loading course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  // ✅ Save progress locally
  useEffect(() => {
    if (currentLesson) {
      localStorage.setItem(
        `progress_${id}`,
        JSON.stringify({
          completedLessons,
          currentLesson: currentLesson.id,
        })
      );
    }
  }, [completedLessons, currentLesson, id]);

  // ✅ Progress calculation
  const totalLessonsCount = curriculum.reduce(
    (sum, section) => sum + section.lessons.length,
    0
  );
  const completedLessonsCount = completedLessons.length;
  const progress =
    totalLessonsCount > 0
      ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
      : 0;

  const toggleSection = (index) =>
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));

  const calcSectionDuration = (lessons) => {
    const totalMinutes = lessons.reduce((sum, lesson) => {
      const duration = lesson.duration?.split(":") || ["0", "0"];
      const minutes = parseInt(duration[0]) || 0;
      return sum + minutes;
    }, 0);
    return `${lessons.length} lessons • ${totalMinutes} min`;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading course content...
      </div>
    );

  if (!course)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Course not found!
      </div>
    );

  const isPaid = course.status === "locked";

  // ✅ Mark as Completed
  const handleMarkAsCompleted = () => {
    if (!currentLesson) return;

    // ha dhameyn haddii uu horey u dhammaaday
    if (completedLessons.includes(currentLesson.id)) return;

    const updated = [...completedLessons, currentLesson.id];
    setCompletedLessons(updated);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);

    // ✅ Next lesson
    const allLessonIds = curriculum.flatMap((s) => s.lessons.map((l) => l.id));
    const currentIndex = allLessonIds.indexOf(currentLesson.id);
    const nextLessonId = allLessonIds[currentIndex + 1];
    if (nextLessonId) {
      const nextLesson = lessons.find((l) => l.id === nextLessonId);
      setCurrentLesson(nextLesson);
    }

    // ✅ Optional backend update
    fetch(`http://localhost:3000/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedLessons: updated }),
    });
  };

  // helper function
  const formatVideoUrl = (url) => {
    if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ"; // default
    if (url.includes("youtu.be/")) {
      // short link
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("embed/")) {
      // already embed format
      return url;
    }
    return url; // fallback
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative">
      {/* ✅ Alert */}
      {showAlert && (
        <div className="fixed top-20 right-5 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ✅ Lesson marked as completed!
        </div>
      )}

      {/* HEADER */}
      <header className="flex mt-15 items-center justify-between px-4 py-2 pt-10 bg-[#edf4f5] shadow-sm fixed top-0 left-0 w-full z-40">
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
            className="hidden sm:block bg-emerald-500 text-white px-3 py-1.5 rounded-md hover:bg-emerald-600 text-xs sm:text-sm"
          >
            Mark as Completed
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
             p-5 sticky top-[90px] self-start max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-gray-100"
        >
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
              ></div>
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
                  key={index}
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
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => !isPaid && setCurrentLesson(lesson)}
                            className={`flex justify-between items-center border rounded-lg p-2 transition duration-300 
                              ${
                                isCompleted
                                  ? "bg-emerald-50 border-emerald-300"
                                  : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                              } ${
                              isPaid
                                ? "cursor-not-allowed opacity-80"
                                : "cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-gray-700 text-sm">
                              {isCompleted ? (
                                <span className="text-emerald-500 font-bold">
                                  ✔
                                </span>
                              ) : (
                                <PlayCircle className="text-emerald-500 text-xs" />
                              )}
                              <span
                                className={
                                  isCompleted
                                    ? "line-through text-gray-400"
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
            ></iframe>
          </div>

          <div className="flex justify-between items-center mb-20">
            <button
              disabled={!currentLesson}
              onClick={() => {
                const allIds = curriculum.flatMap((s) =>
                  s.lessons.map((l) => l.id)
                );
                const currentIndex = allIds.indexOf(currentLesson.id);
                const prevLesson =
                  lessons.find((l) => l.id === allIds[currentIndex - 1]) ||
                  null;
                if (prevLesson) setCurrentLesson(prevLesson);
              }}
              className="flex items-center px-5 py-2 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>

            <button
              onClick={handleMarkAsCompleted}
              className="flex items-center px-5 py-2 rounded-md text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
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
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {completedLessonsCount} of {totalLessonsCount} lessons completed
            </p>
          </div>

            {/* 👉 Copy same accordion as desktop sidebar */}
            <div className="space-y-4">
              {curriculum.map((section, index) => {
                const sectionDuration = calcSectionDuration(section.lessons);
                return (
                  <div
                    key={index}
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
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                setCurrentLesson(lesson);
                                setShowLessons(false); // close after selecting
                              }}
                              className={`flex justify-between items-center border rounded-lg p-2 transition duration-300 ${
                                isCompleted
                                  ? "bg-emerald-50 border-emerald-300"
                                  : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                              } cursor-pointer`}
                            >
                              <div className="flex items-center gap-2 text-gray-700 text-sm">
                                {isCompleted ? (
                                  <span className="text-emerald-500 font-bold">
                                    ✔
                                  </span>
                                ) : (
                                  <PlayCircle className="text-emerald-500 text-xs" />
                                )}
                                <span
                                  className={
                                    isCompleted
                                      ? "line-through text-gray-400"
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
          ></div>
        </div>
      )}
    </div>
  );
};

export default CourseDashboard;
