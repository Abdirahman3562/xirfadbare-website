import React from 'react';
import { X, BookOpen, Clock, Award, PlayCircle } from 'lucide-react';
import { getImageUrl } from '../../utils/format';

export default function AdminBundleViewModal({ isOpen, onClose, bundle }) {
    if (!isOpen || !bundle) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Included Courses</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                            Content inside <span className="text-emerald-600 dark:text-emerald-400 font-bold">{bundle.title}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Course List */}
                <div className="p-8 overflow-y-auto space-y-4 flex-1 custom-scrollbar bg-gray-50/50 dark:bg-slate-900/50">
                    {bundle.courses?.map((course, idx) => {
                        const totalLessons = course.curriculum?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;

                        return (
                            <div key={course._id || idx} className="flex flex-col sm:flex-row gap-5 bg-white dark:bg-slate-800 p-4 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:translate-y-[-2px] hover:shadow-emerald-100/50 dark:hover:shadow-black/30 transition-all duration-300 group">
                                {/* Thumbnail */}
                                <div className="w-full sm:w-32 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm relative">
                                    <img
                                        src={getImageUrl(course.thumbnail)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={course.title}
                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h4 className="text-base font-black text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {course.title}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-x-4 gap-y-2 mt-2 flex-wrap">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <div className={`w-1.5 h-1.5 rounded-full ${course.level === 'Beginner' ? 'bg-emerald-500' : course.level === 'Intermediate' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                {course.level || 'Beginner'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <BookOpen size={12} strokeWidth={2.5} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                {totalLessons} Lessons
                                            </span>
                                        </div>
                                        {course.hasCertificate && (
                                            <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500">
                                                <Award size={12} strokeWidth={2.5} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">
                                                    Certificate
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {(!bundle.courses || bundle.courses.length === 0) && (
                        <div className="text-center py-10">
                            <p className="text-gray-400 font-medium italic">No courses added to this bundle yet.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full py-4 cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-gray-900 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 group"
                    >
                        <span className="group-hover:tracking-[0.3em] transition-all duration-300">Close Window</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
