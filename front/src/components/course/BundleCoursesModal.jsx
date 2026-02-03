import React, { useEffect, useState } from "react";
import { X, ChevronRight, PlayCircle, BookOpen, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/format";
import { getUserProgress } from "../../api/userProgressService";

export default function BundleCoursesModal({ isOpen, onClose, bundleOrder, allCourses = [] }) {
    const [courseProgress, setCourseProgress] = useState({});
    const [loadingProgress, setLoadingProgress] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && bundleOrder?.bundleCourses) {
            fetchProgress();
        }
    }, [isOpen, bundleOrder]);

    const fetchProgress = async () => {
        setLoadingProgress(true);
        const progressMap = {};

        await Promise.all(
            bundleOrder.bundleCourses.map(async (course) => {
                try {
                    const data = await getUserProgress(course._id);
                    if (data) {
                        progressMap[course._id] = data;
                    }
                } catch (err) {
                    console.warn(`Failed to fetch progress for course ${course._id}`, err);
                }
            })
        );

        setCourseProgress(progressMap);
        setLoadingProgress(false);
    };

    if (!isOpen || !bundleOrder) return null;

    // ✅ Helper function: slugify titles
    const slugify = (text) =>
        text?.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-2xl w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-10px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 border border-white/40 dark:border-white/5 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-8 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center bg-transparent sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Bundle Courses</h3>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">
                            {bundleOrder.courseTitle || bundleOrder.courseDetails?.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200/50 dark:hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Course List */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                    {bundleOrder.bundleCourses?.map((courseSnapshot, idx) => {
                        const courseProgressData = courseProgress[courseSnapshot._id];
                        const progress = courseProgressData?.progress || 0;
                        const fullCourse = allCourses.find(c => String(c._id) === String(courseSnapshot._id));

                        // Calculate lessons done/total
                        const totalLessons = (fullCourse?.curriculum || []).reduce(
                            (sum, section) => sum + (section.lessons?.length || 0),
                            0
                        );
                        const done = Math.round((progress / 100) * totalLessons);

                        return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-5 bg-white dark:bg-white/5 p-5 rounded-[2rem] border border-gray-200/50 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
                                {/* Thumbnail */}
                                <div className="w-full sm:w-24 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white dark:border-slate-700 shadow-sm">
                                    <img src={getImageUrl(courseSnapshot.thumbnail)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight">{courseSnapshot.title}</h4>
                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{progress}%</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{totalLessons} Lessons</span>
                                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                        <span className="text-[9px] text-emerald-500/70 font-black uppercase tracking-widest">{courseSnapshot.level || 'Beginner'}</span>
                                    </div>
                                </div>

                                {/* Continue Button */}
                                {["completed", "active"].includes(bundleOrder.status) ? (
                                    <button
                                        onClick={() => {
                                            const courseSlug = slugify(courseSnapshot.title);
                                            // Determine current lesson slug - priority order: userProgress.currentLessonTitle -> "introduction"
                                            const currentLesson = slugify(courseProgressData?.currentLessonTitle || courseProgressData?.lastAccess?.lessonTitle || "introduction");
                                            navigate(`/watch/courses/${courseSlug}/lessons/${currentLesson}`);
                                            onClose();
                                        }}
                                        className="w-full sm:w-auto cursor-pointer mt-2 sm:mt-0 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider active:scale-95"
                                    >
                                        <PlayCircle size={16} />
                                        Continue Learning
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-not-allowed border border-gray-200 dark:border-slate-600"
                                    >
                                        <Clock size={14} />
                                        {bundleOrder.status === "rejected" ? "Access Denied" : "Pending Access"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-8 bg-transparent border-t border-gray-200/50 dark:border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full py-4 cursor-pointer bg-emerald-600 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 hover:opacity-90"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
