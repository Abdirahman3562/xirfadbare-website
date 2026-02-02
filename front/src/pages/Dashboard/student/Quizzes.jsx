import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, CheckCircle2, Trophy, Clock, BookOpen } from 'lucide-react';
import { getMyOrders } from "../../../api/orderService";
import { getAllCourses } from "../../../api/courseService";
import { getAllUserProgress, saveQuizResult as saveQuizAPI } from "../../../api/userProgressService";
import LessonQuizModal from "../../../components/course/LessonQuizModal";
import PremiumLoader from "../../../components/ui/PremiumLoader";

const Quizzes = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [progress, setProgress] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [showQuizModal, setShowQuizModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [orders, allCourses, allProgress] = await Promise.all([
                    getMyOrders(),
                    getAllCourses(),
                    getAllUserProgress()
                ]);

                // Filter courses user has access to
                const enrolledCourseIds = orders
                    .filter(order => order.status === 'active')
                    .map(order => order.course || order.courseId);

                const enrolledCourses = allCourses.filter(course =>
                    enrolledCourseIds.includes(course._id)
                );

                // Extract all quizzes from these courses
                const allQuizzes = [];
                enrolledCourses.forEach(course => {
                    course.curriculum?.forEach(section => {
                        section.lessons?.forEach(lesson => {
                            if (lesson.quizQuestions && lesson.quizQuestions.length > 0) {
                                allQuizzes.push({
                                    ...lesson,
                                    courseId: course._id,
                                    courseTitle: course.title,
                                    sectionTitle: section.title
                                });
                            }
                        });
                    });
                });

                setCourses(enrolledCourses);
                setQuizzes(allQuizzes);
                setProgress(allProgress);
            } catch (error) {
                console.error("Error fetching quizzes data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getQuizResult = (lessonId, courseId) => {
        const courseProgress = progress.find(p => p.course === courseId || p.course?._id === courseId);
        if (!courseProgress || !courseProgress.quizResults) return null;
        return courseProgress.quizResults.find(r => String(r.lessonId) === String(lessonId));
    };

    const handleTakeQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setShowQuizModal(true);
    };

    const handleQuizComplete = async (quizData) => {
        try {
            if (!selectedQuiz) return;

            const data = {
                lessonId: selectedQuiz._id,
                score: quizData.score,
                totalQuestions: quizData.totalQuestions
            };

            // Save to API
            await saveQuizAPI(selectedQuiz.courseId, data);

            // Refresh progress to show new scores
            const allProgress = await getAllUserProgress();
            setProgress(allProgress);
            setShowQuizModal(false);
        } catch (error) {
            console.error("❌ Error saving quiz complete:", error);
            setShowQuizModal(false);
        }
    };

    if (loading) return <PremiumLoader />;

    return (
        <div className="w-full lg:mt-4 md:mt-4 mt-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                    My Quizzes
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    Track your progress and test your knowledge
                </p>
            </div>

            {quizzes.length === 0 ? (
                <div className="bg-white/10 border border-gray-200 dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Quizzes Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium max-w-xs mx-auto">
                        Once you enroll in courses with quizzes, they will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz, idx) => {
                        const result = getQuizResult(quiz._id, quiz.courseId);
                        const isCompleted = !!result;

                        return (
                            <div
                                key={idx}
                                className="group bg-white/10 border border-gray-300 dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-6 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 relative overflow-hidden"
                            >
                                {/* Header Decoration */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-[4rem]" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                                            <Brain size={24} />
                                        </div>
                                        {isCompleted && (
                                            <div className="flex flex-col items-end">
                                                <div className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1 shadow-lg shadow-emerald-200 dark:shadow-none">
                                                    <CheckCircle2 size={10} />
                                                    Completed
                                                </div>
                                                <p className="text-[14px] font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                                    {result.score}/{result.totalQuestions}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 line-clamp-1">
                                            {quiz.courseTitle}
                                        </p>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {quiz.title}
                                        </h3>

                                        <div className="space-y-2.5 mb-6">
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <BookOpen size={14} className="shrink-0" />
                                                <span className="text-[11px] font-bold uppercase tracking-wider">{quiz.sectionTitle}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Clock size={14} className="shrink-0" />
                                                <span className="text-[11px] font-bold uppercase tracking-wider">{quiz.quizDuration ? `${quiz.quizDuration} min` : (quiz.duration || '5-10 min')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleTakeQuiz(quiz)}
                                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 group/btn ${isCompleted
                                            ? "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-600 hover:text-white"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-none"
                                            }`}
                                    >
                                        {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
                                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showQuizModal && selectedQuiz && (
                <LessonQuizModal
                    isOpen={showQuizModal}
                    onClose={() => setShowQuizModal(false)}
                    lesson={selectedQuiz}
                    onComplete={handleQuizComplete}
                    closable={true}
                />
            )}
        </div>
    );
};

export default Quizzes;
