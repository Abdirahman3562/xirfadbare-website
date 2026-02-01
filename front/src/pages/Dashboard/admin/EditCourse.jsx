import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronLeft,
    Save,
    Plus,
    Trash2,
    Video,
    Layout,
    Clock,
    DollarSign,
    Target,
    Layers,
    User,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    XCircle,
    Award,
    HelpCircle,
    List,
    PlusCircle,
    Users,
    Upload,
    GripVertical,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getFullCourseDetails, updateCourse } from '../../../api/courseService';
import PremiumLoader from '../../../components/ui/PremiumLoader';
import { getAllInstructors } from '../../../api/instructorService';
import { API_BASE_URL } from '../../../config';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../../utils/format';
import ResourceManager from '../../../components/course/ResourceManager';

const SortableLesson = ({ lesson, lIndex, sIndex, handleLessonChange, removeLesson }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: lesson._id || `temp-lesson-${sIndex}-${lIndex}` });

    const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(0);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const hasVideo = lesson.type === 'video' || lesson.type === 'hybrid' || !lesson.type;
    const hasQuiz = lesson.type === 'quiz' || lesson.type === 'hybrid';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-4 md:p-6 rounded-2xl border bg-white dark:bg-slate-700/30 transition-all ${isDragging ? 'opacity-30' : 'opacity-100'
                } ${(hasVideo && hasQuiz)
                    ? 'border-emerald-200 dark:border-emerald-500/40 shadow-md ring-1 ring-emerald-500/10'
                    : hasQuiz
                        ? 'border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-200 dark:hover:border-emerald-500/40 shadow-sm'
                        : 'border-gray-100 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-emerald-500/30'
                }`}
        >
            {/* Lesson Header: Grip, Number, Title, Type, Remove */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-[150px]">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-emerald-500 transition-colors"
                    >
                        <GripVertical size={16} />
                    </div>

                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${hasVideo
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {lIndex + 1}
                    </div>

                    <div className="flex-1">
                        <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(sIndex, lIndex, 'title', e.target.value)}
                            className="w-full text-sm md:text-base font-bold text-gray-900 dark:text-white bg-transparent outline-none border-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Lesson title..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 md:gap-2 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 ml-auto md:ml-0">
                    <button
                        onClick={() => {
                            let newType = lesson.type || 'video';
                            if (newType === 'quiz') newType = 'hybrid';
                            else if (newType === 'hybrid') newType = 'quiz';
                            else if (newType === 'video' && hasQuiz) newType = 'quiz';
                            handleLessonChange(sIndex, lIndex, 'type', newType);
                        }}
                        className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${hasVideo
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                    >
                        <Video size={10} className="md:w-3 md:h-3" />
                        Video
                    </button>
                    <button
                        onClick={() => {
                            let newType = lesson.type || 'video';
                            if (newType === 'video') newType = 'hybrid';
                            else if (newType === 'hybrid') newType = 'video';
                            else if (newType === 'quiz' && hasVideo) newType = 'video';
                            handleLessonChange(sIndex, lIndex, 'type', newType);
                        }}
                        className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${hasQuiz
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                    >
                        <HelpCircle size={10} className="md:w-3 md:h-3" />
                        Quiz
                    </button>
                </div>

                <button
                    onClick={() => removeLesson(sIndex, lIndex)}
                    className="p-1.5 md:p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Content: Video and/or Quiz */}
            <div className="pl-0 md:pl-12 space-y-6">
                {hasVideo && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all focus-within:border-emerald-500/50">
                                <Video size={14} className="text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    value={lesson.videoUrl || ''}
                                    onChange={(e) => handleLessonChange(sIndex, lIndex, 'videoUrl', e.target.value)}
                                    className="bg-transparent text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 flex-1 outline-none w-full"
                                    placeholder="YouTube or Vimeo URL"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all focus-within:border-emerald-500/50">
                                <Clock size={14} className="text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    value={lesson.duration || ''}
                                    onChange={(e) => handleLessonChange(sIndex, lIndex, 'duration', e.target.value)}
                                    className="bg-transparent text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 w-full outline-none"
                                    placeholder="Duration (e.g. 10:00)"
                                />
                            </div>
                        </div>

                        <ResourceManager
                            label="Lesson Resources"
                            resources={lesson.lessonResources || []}
                            onUpdate={(newResources) => handleLessonChange(sIndex, lIndex, 'lessonResources', newResources)}
                        />
                    </div>
                )}

                {hasQuiz && (
                    <div className="bg-emerald-50/30 dark:bg-emerald-500/5 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-emerald-100/50 dark:border-emerald-500/10 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100/30 dark:border-emerald-500/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 md:p-2 bg-emerald-500 text-white rounded-xl">
                                    <HelpCircle size={16} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-xs md:text-sm font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest">
                                        Quiz Builder
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 px-2 py-0.5 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-500/10 w-fit shadow-sm">
                                        <Clock size={10} className="text-emerald-500" />
                                        <input
                                            type="number"
                                            value={lesson.quizDuration || 10}
                                            onChange={(e) => handleLessonChange(sIndex, lIndex, 'quizDuration', parseInt(e.target.value) || 0)}
                                            className="w-8 bg-transparent text-[10px] font-black text-emerald-600 dark:text-emerald-400 outline-none border-none p-0"
                                            placeholder="10"
                                        />
                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Min Limit</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const questions = [...(lesson.quizQuestions || [])];
                                    const newIdx = questions.length;
                                    questions.push({
                                        question: '',
                                        type: 'multiple-choice',
                                        options: ['', '', '', ''],
                                        correctAnswer: 0,
                                        explanation: ''
                                    });
                                    handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                    setExpandedQuestionIdx(newIdx);
                                }}
                                className="flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
                            >
                                <Plus size={14} />
                                Add Question
                            </button>
                        </div>

                        <div className="space-y-6">
                            {(lesson.quizQuestions || []).map((q, qIdx) => {
                                const isExpanded = expandedQuestionIdx === qIdx;
                                return (
                                    <div key={qIdx} className={`bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm group/q ${isExpanded ? 'border-emerald-200 dark:border-emerald-500/40 ring-1 ring-emerald-500/5' : 'border-emerald-100/50 dark:border-emerald-500/20 opacity-90 hover:opacity-100'}`}>
                                        <div
                                            onClick={() => setExpandedQuestionIdx(isExpanded ? null : qIdx)}
                                            className="flex items-center justify-between p-4 md:p-5 cursor-pointer hover:bg-emerald-50/10 dark:hover:bg-emerald-500/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 md:gap-4 flex-1 mr-4 min-w-0">
                                                <span className={`w-6 h-6 md:w-8 md:h-8 rounded-xl flex items-center justify-center text-[10px] md:text-[11px] font-black shrink-0 transition-colors ${isExpanded ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                                                    {qIdx + 1}
                                                </span>
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                            {q.type?.replace('-', ' ')}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-2 break-words">
                                                        {q.question || 'Question Details...'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const questions = lesson.quizQuestions.filter((_, i) => i !== qIdx);
                                                        handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                                        if (isExpanded) setExpandedQuestionIdx(null);
                                                    }}
                                                    className="p-1.5 md:p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className={`p-1 rounded-lg transition-all ${isExpanded ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'text-gray-300'}`}>
                                                    {isExpanded ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-4 md:p-6 pt-0 space-y-4 md:space-y-6 animate-in slide-in-from-top-2 duration-300">
                                                <div className="h-px bg-emerald-50 dark:bg-emerald-500/10 mb-6" />
                                                <div className="space-y-6">
                                                    <div className="space-y-3">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Question Type</label>
                                                            <div className="relative">
                                                                <select
                                                                    value={q.type}
                                                                    onChange={(e) => {
                                                                        const questions = [...lesson.quizQuestions];
                                                                        const oldType = questions[qIdx].type;
                                                                        questions[qIdx].type = e.target.value;

                                                                        if (e.target.value === 'true-false') {
                                                                            questions[qIdx].options = ['True', 'False'];
                                                                            questions[qIdx].correctAnswer = 0;
                                                                        } else if (e.target.value === 'multiple-choice' && oldType === 'true-false') {
                                                                            questions[qIdx].options = ['', '', '', ''];
                                                                            questions[qIdx].correctAnswer = 0;
                                                                        }

                                                                        handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                                                    }}
                                                                    className="appearance-none bg-gray-50 dark:bg-slate-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest pl-2 md:pl-3 pr-8 py-1.5 rounded-lg border-none outline-none cursor-pointer text-emerald-600 dark:text-emerald-400 w-full md:w-auto"
                                                                >
                                                                    <option value="multiple-choice">Multiple Choice</option>
                                                                    <option value="true-false">True / False</option>
                                                                    <option value="short-answer">Short Answer</option>
                                                                </select>
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                                                                    <ChevronDown size={10} strokeWidth={3} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            value={q.question}
                                                            onChange={(e) => {
                                                                const questions = [...lesson.quizQuestions];
                                                                questions[qIdx].question = e.target.value;
                                                                handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                                            }}
                                                            className="w-full bg-gray-50/50 dark:bg-slate-900 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs md:text-sm font-semibold placeholder-gray-400 transition-all focus:border-emerald-500/50"
                                                            placeholder="Enter your question here..."
                                                            rows="2"
                                                        />
                                                    </div>

                                                    {q.type !== 'short-answer' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                            {q.options.map((opt, oIdx) => (
                                                                <div key={oIdx} className="flex items-center gap-3 bg-gray-50/30 dark:bg-slate-900/50 p-2.5 md:p-3 rounded-2xl border border-gray-100 dark:border-gray-700 group/opt relative">
                                                                    <input
                                                                        type="radio"
                                                                        name={`correct-${sIndex}-${lIndex}-${qIdx}`}
                                                                        checked={q.correctAnswer == oIdx}
                                                                        onChange={() => {
                                                                            const questions = [...lesson.quizQuestions];
                                                                            questions[qIdx].correctAnswer = oIdx;
                                                                            handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                                                        }}
                                                                        className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) => {
                                                                            const questions = [...lesson.quizQuestions];
                                                                            questions[qIdx].options[oIdx] = e.target.value;
                                                                            handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                                                        }}
                                                                        className="bg-transparent text-[11px] md:text-xs font-bold text-gray-600 dark:text-gray-300 flex-1 min-w-0 outline-none border-none py-1 h-full placeholder-gray-400"
                                                                        placeholder={`Option ${oIdx + 1}`}
                                                                        disabled={q.type === 'true-false'}
                                                                    />
                                                                    {q.type === 'multiple-choice' && q.options.length > 2 && (
                                                                        <button
                                                                            onClick={() => {
                                                                                const questions = [...lesson.quizQuestions];
                                                                                questions[qIdx].options = questions[qIdx].options.filter((_, i) => i !== oIdx);
                                                                                handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                                                            }}
                                                                            className="absolute -top-2 -right-2 text-red-500 bg-white dark:bg-slate-800 rounded-full shadow-md hover:scale-110 transition-all md:opacity-0 group-hover/opt:opacity-100 p-0.5 border border-red-100 dark:border-red-900/30 flex items-center justify-center"
                                                                            title="Remove Option"
                                                                        >
                                                                            <XCircle size={18} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {q.type === 'multiple-choice' && (
                                                                <button
                                                                    onClick={() => {
                                                                        const questions = [...lesson.quizQuestions];
                                                                        questions[qIdx].options.push('');
                                                                        handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                                                    }}
                                                                    className="flex items-center gap-2 text-emerald-500 hover:text-emerald-600 font-black text-[9px] uppercase tracking-widest p-2.5 md:p-3"
                                                                >
                                                                    <Plus size={12} strokeWidth={3} />
                                                                    Add Option
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {q.type === 'short-answer' && (
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correct Answer</label>
                                                            <input
                                                                type="text"
                                                                value={q.correctAnswer || ''}
                                                                onChange={(e) => {
                                                                    const questions = [...lesson.quizQuestions];
                                                                    questions[qIdx].correctAnswer = e.target.value;
                                                                    handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                                                }}
                                                                className="w-full bg-emerald-50/30 dark:bg-emerald-500/5 px-4 py-2.5 md:py-3 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 text-xs md:text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none"
                                                                placeholder="The expected answer..."
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Explanation (Optional)</label>
                                                        <input
                                                            type="text"
                                                            value={q.explanation || ''}
                                                            onChange={(e) => {
                                                                const questions = [...lesson.quizQuestions];
                                                                questions[qIdx].explanation = e.target.value;
                                                                handleLessonChange(sIndex, lIndex, 'quizQuestions', questions);
                                                            }}
                                                            className="w-full bg-gray-50/50 dark:bg-slate-900/50 px-4 py-2.5 md:py-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] md:text-[11px] font-medium text-gray-500 dark:text-gray-400 italic outline-none"
                                                            placeholder="Why is this answer correct?"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {(lesson.quizQuestions || []).length === 0 && (
                                <div className="text-center py-8 md:py-10 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-2xl md:rounded-3xl border border-dashed border-emerald-200 dark:border-emerald-500/10">
                                    <p className="text-emerald-400 dark:text-emerald-500 font-medium italic text-xs md:text-sm">Hadda wax su'aalo ah kuma jiraan.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SortableSection = ({ section, sIndex, handleSectionTitleChange, removeSection, addLesson, handleLessonChange, removeLesson, onLessonDragEnd }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section._id || `temp-section-${sIndex}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const lessonIds = section.lessons.map((lesson, lIndex) => lesson._id || `temp-lesson-${sIndex}-${lIndex}`);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-gray-50/50 dark:bg-slate-800/50 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100/50 dark:border-gray-700/50 p-4 md:p-8 space-y-6 relative group/section transition-all duration-300 ${isCollapsed ? 'pb-4 md:pb-6' : ''}`}
        >
            <div className="flex items-center gap-3 md:gap-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="p-1 md:p-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-emerald-500 transition-colors"
                >
                    <GripVertical size={20} />
                </div>
                <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionTitleChange(sIndex, e.target.value)}
                    className="bg-transparent border-none outline-none text-base md:text-lg font-bold text-gray-900 dark:text-white flex-1 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Section Title..."
                />
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 text-gray-400 hover:text-emerald-500 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                        title={isCollapsed ? "Expand Section" : "Collapse Section"}
                    >
                        <span className="hidden md:inline mr-1">{isCollapsed ? 'Expand' : 'Collapse'}</span>
                        {isCollapsed ? <ChevronDown size={18} strokeWidth={3} /> : <ChevronUp size={18} strokeWidth={3} />}
                    </button>
                    <button
                        onClick={() => removeSection(sIndex)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors sm:opacity-0 sm:group-hover/section:opacity-100"
                        title="Remove Section"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <div className="space-y-4 pl-0 md:pl-10 animate-in slide-in-from-top-2 duration-300">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => onLessonDragEnd(sIndex, event)}
                    >
                        <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
                            {section.lessons.map((lesson, lIndex) => (
                                <SortableLesson
                                    key={`lesson-${sIndex}-${lIndex}`}
                                    lesson={lesson}
                                    lIndex={lIndex}
                                    sIndex={sIndex}
                                    handleLessonChange={handleLessonChange}
                                    removeLesson={removeLesson}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    <button
                        onClick={() => addLesson(sIndex)}
                        className="flex items-center gap-2 text-emerald-500 hover:text-emerald-600 font-bold text-[9px] md:text-[10px] uppercase tracking-widest pt-2 ml-2"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Add Lesson
                    </button>
                </div>
            )}
        </div>
    );
};

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [instructors, setInstructors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [certificateTemplates, setCertificateTemplates] = useState([]);
    const [courseData, setCourseData] = useState({
        title: '',
        type: '',
        description: '',
        price: '',
        discountCode: '',
        discountPercentage: 0,
        discountExpiry: '',
        technology: '',
        level: 'Beginner',
        accessType: 'Lifetime',
        thumbnail: '',
        instructor: '',
        communityLink: '',
        learningOutcomes: [],
        curriculum: [],
        hasCertificate: false,
        certificateTemplate: '',
        courseResources: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [course, allInstructors, allCategories, templatesRes] = await Promise.all([
                    id === 'new' ? Promise.resolve(null) : getFullCourseDetails(id),
                    getAllInstructors(),
                    fetch('http://localhost:5000/api/categories').then(res => res.json()),
                    fetch('http://localhost:5000/api/certificates/templates', {
                        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('loggedInUser'))?.token}` }
                    }).then(res => res.json())
                ]);

                if (course) {
                    setCourseData({
                        ...course,
                        type: course.type || '',
                        discountCode: course.discountCode || '',
                        discountPercentage: course.discountPercentage || 0,
                        discountExpiry: course.discountExpiry ? (() => {
                            const d = new Date(course.discountExpiry);
                            const pad = (n) => n < 10 ? '0' + n : n;
                            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        })() : '',
                        instructor: course.instructor?._id || course.instructor || '',
                        communityLink: course.communityLink || '',
                        learningOutcomes: course.learningOutcomes || [],
                        hasCertificate: course.hasCertificate || false,
                        certificateTemplate: course.certificateTemplate?._id || course.certificateTemplate || '',
                        courseResources: course.courseResources || []
                    });
                } else {
                    // Reset to empty for new courses specifically
                    setCourseData({
                        title: '',
                        type: '',
                        description: '',
                        price: '',
                        discountCode: '',
                        discountPercentage: 0,
                        technology: '',
                        level: 'Beginner',
                        accessType: 'Lifetime',
                        thumbnail: '',
                        instructor: '',
                        communityLink: '',
                        learningOutcomes: [],
                        curriculum: [],
                        hasCertificate: false,
                        certificateTemplate: '',
                        courseResources: []
                    });
                }
                setInstructors(allInstructors);
                setCategories(allCategories || []);
                setCertificateTemplates(templatesRes || []);
            } catch (error) {
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const userInfo = JSON.parse(localStorage.getItem('loggedInUser'));
            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            // Handle {url: "..." } or {image: "..." } or plain string if JSON parse fails (though res.json throws)
            // Assuming simplified backend response:
            setCourseData(prev => ({ ...prev, thumbnail: data.url || data.image || data }));
            toast.success("Sawirka waa la upload gareeyay!");
        } catch (error) {
            console.error(error);
            toast.error("Wuu fashilmay upload-ka sawirka");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();

        const isNew = id === 'new';
        const loadingMsg = isNew ? "Koorsada cusub waa la diyaarinayaa..." : "Koorsada waa la cusubaysiinayaa...";
        const successMsg = isNew ? "Koorsada si guul leh ayaa loo daabacay!" : "Koorsada waa la cusubaysiiyay si guul leh!";
        const errorMsg = isNew ? "Wuu fashilmay daabacaadda koorsada. " : "Wuu fashilmay cusubaysiinta koorsada. ";

        const toastId = toast.loading(loadingMsg);
        try {
            setSaving(true);

            // Clean up temporary IDs before sending to backend
            const sanitizedCourseData = {
                ...courseData,
                curriculum: courseData.curriculum.map(section => ({
                    ...section,
                    _id: section._id?.startsWith('new-') ? undefined : section._id,
                    lessons: section.lessons.map(lesson => ({
                        ...lesson,
                        _id: lesson._id?.startsWith('new-') ? undefined : lesson._id
                    }))
                }))
            };

            await updateCourse(id, sanitizedCourseData);

            toast.update(toastId, {
                render: successMsg,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

            // Redirect to course list after a short delay to allow toast to be seen
            setTimeout(() => {
                navigate('/admin/courses');
            }, 2000);
        } catch (error) {
            toast.update(toastId, {
                render: errorMsg,
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // Learning Outcomes Management
    const addOutcome = () => {
        setCourseData(prev => ({
            ...prev,
            learningOutcomes: [...prev.learningOutcomes, '']
        }));
    };

    const removeOutcome = (index) => {
        setCourseData(prev => ({
            ...prev,
            learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
        }));
    };

    const handleOutcomeChange = (index, value) => {
        setCourseData(prev => {
            const newOutcomes = [...prev.learningOutcomes];
            newOutcomes[index] = value;
            return { ...prev, learningOutcomes: newOutcomes };
        });
    };

    // Curriculum Management
    const addSection = () => {
        setCourseData(prev => ({
            ...prev,
            curriculum: [...prev.curriculum, {
                _id: `new-${Date.now()}`,
                title: 'New Section',
                lessons: []
            }]
        }));
    };

    const removeSection = (sectionIndex) => {
        setCourseData(prev => ({
            ...prev,
            curriculum: prev.curriculum.filter((_, i) => i !== sectionIndex)
        }));
    };

    const handleSectionTitleChange = (sectionIndex, title) => {
        setCourseData(prev => {
            const newCurriculum = JSON.parse(JSON.stringify(prev.curriculum));
            newCurriculum[sectionIndex].title = title;
            return { ...prev, curriculum: newCurriculum };
        });
    };

    const addLesson = (sectionIndex) => {
        setCourseData(prev => {
            const newCurriculum = JSON.parse(JSON.stringify(prev.curriculum));
            newCurriculum[sectionIndex].lessons.push({
                _id: `new-lesson-${Date.now()}`,
                title: 'New Lesson',
                type: 'video', // Default type
                duration: '00:00',
                videoUrl: '',
                quizQuestions: [],
                lessonResources: []
            });
            return { ...prev, curriculum: newCurriculum };
        });
    };

    const removeLesson = (sectionIndex, lessonIndex) => {
        setCourseData(prev => {
            const newCurriculum = [...prev.curriculum];
            newCurriculum[sectionIndex].lessons = newCurriculum[sectionIndex].lessons.filter((_, i) => i !== lessonIndex);
            return { ...prev, curriculum: newCurriculum };
        });
    };

    const handleLessonChange = (sectionIndex, lessonIndex, field, value) => {
        setCourseData(prev => {
            const newCurriculum = JSON.parse(JSON.stringify(prev.curriculum));
            newCurriculum[sectionIndex].lessons[lessonIndex][field] = value;
            return { ...prev, curriculum: newCurriculum };
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onSectionDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            setCourseData((prev) => {
                const oldIndex = prev.curriculum.findIndex(s => (s._id || `temp-section-${prev.curriculum.indexOf(s)}`) === active.id);
                const newIndex = prev.curriculum.findIndex(s => (s._id || `temp-section-${prev.curriculum.indexOf(s)}`) === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    return {
                        ...prev,
                        curriculum: arrayMove(prev.curriculum, oldIndex, newIndex),
                    };
                }
                return prev;
            });
        }
    };

    const onLessonDragEnd = (sectionIndex, event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            setCourseData((prev) => {
                const newCurriculum = [...prev.curriculum];
                const section = newCurriculum[sectionIndex];

                const oldIndex = section.lessons.findIndex(l => (l._id || `temp-lesson-${sectionIndex}-${section.lessons.indexOf(l)}`) === active.id);
                const newIndex = section.lessons.findIndex(l => (l._id || `temp-lesson-${sectionIndex}-${section.lessons.indexOf(l)}`) === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    section.lessons = arrayMove(section.lessons, oldIndex, newIndex);
                }

                return { ...prev, curriculum: newCurriculum };
            });
        }
    };

    if (loading) {
        return <PremiumLoader text="Checking course data..." />;
    }

    return (
        <div className="w-full space-y-8 pb-20 animate-in fade-in duration-700 font-[Inter]">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm sticky top-4 z-30 transition-all duration-300 gap-4 sm:gap-0">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <Link
                        to="/admin/courses"
                        className="p-2.5 md:p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl md:rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:white transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
                    >
                        <ChevronLeft size={20} className="md:w-6 md:h-6" />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-sm md:text-xl font-black text-gray-900 dark:text-white break-words">
                            {id === 'new' ? 'DIWANGELI KOORSO CUSUB' : (courseData.title || 'BEDEL KOORSADA')}
                        </h1>
                        <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 ${id === 'new' ? 'text-emerald-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {id === 'new' ? 'ADD MODE — CREATE' : 'EDIT MODE — UPDATE'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    {id !== 'new' && (
                        <button
                            onClick={() => navigate(`/courses/${courseData.slug}`)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest border border-gray-100 dark:border-gray-700"
                        >
                            <Video size={14} className="md:w-4 md:h-4" />
                            Preview
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 dark:shadow-none cursor-pointer hover:bg-emerald-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} className="md:w-4 md:h-4" />}
                        {saving ? (id === 'new' ? "Daabacaya..." : "Cusboonaysiinaya...") : (id === 'new' ? "PUBLISH" : "UPDATE")}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-slate-800 p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 md:space-y-8 transition-colors duration-300">
                        <div className="flex items-center gap-3 md:gap-4 border-b border-gray-50 dark:border-gray-700/50 pb-4 md:pb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Layout size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h2 className="text-base md:text-xl font-black text-gray-900 dark:text-white">General Information</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={courseData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="e.g. Master React in 30 Days"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    name="description"
                                    value={courseData.description}
                                    onChange={handleInputChange}
                                    rows="6"
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Provide a detailed roadmap of the course..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    name="type"
                                    value={courseData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold transition-all appearance-none cursor-pointer text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Technology</label>
                                <input
                                    type="text"
                                    name="technology"
                                    value={courseData.technology}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="e.g. React, Node.js"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={courseData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold transition-all font-[Outfit] text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-emerald-600 uppercase tracking-widest ml-1">Discount %</label>
                                <input
                                    type="number"
                                    name="discountPercentage"
                                    value={courseData.discountPercentage}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all text-emerald-700 dark:text-emerald-400 placeholder-emerald-300 dark:placeholder-emerald-500/50"
                                    placeholder="0"
                                    max="100"
                                />
                            </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-emerald-600 uppercase tracking-widest ml-1">Course Discount Code</label>
                                <input
                                    type="text"
                                    name="discountCode"
                                    value={courseData.discountCode}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all text-emerald-700 dark:text-emerald-400 uppercase tracking-widest placeholder-emerald-300 dark:placeholder-emerald-500/50"
                                    placeholder="e.g. SAVE20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-emerald-600 uppercase tracking-widest ml-1">Discount Expiry</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                    <input
                                        type="datetime-local"
                                        name="discountExpiry"
                                        value={courseData.discountExpiry}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-6 py-4 bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all text-emerald-700 dark:text-emerald-400 placeholder-emerald-300 dark:placeholder-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50 dark:border-gray-700/50 mt-6">
                            <ResourceManager
                                label="COURSE RESOURCES"
                                resources={courseData.courseResources || []}
                                onUpdate={(newResources) => setCourseData(prev => ({ ...prev, courseResources: newResources }))}
                            />
                        </div>
                    </div>

                    {/* Curriculum Builder */}
                    <div className="bg-white dark:bg-slate-800 p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 md:space-y-8 transition-colors duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 dark:border-gray-700/50 pb-4 md:pb-6 gap-4 sm:gap-0">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <Video size={20} className="md:w-6 md:h-6" />
                                </div>
                                <h2 className="text-base md:text-xl font-black text-gray-900 dark:text-white">Curriculum Structure</h2>
                            </div>
                            <button
                                onClick={addSection}
                                className="flex items-center justify-center gap-2 text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest w-full sm:w-auto"
                            >
                                <PlusCircle size={16} className="md:w-[18px] md:h-[18px]" />
                                Add Section
                            </button>
                        </div>

                        <div className="space-y-8">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={onSectionDragEnd}
                            >
                                <SortableContext
                                    items={courseData.curriculum.map((section, i) => section._id || `temp-section-${i}`)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {courseData.curriculum.map((section, sIndex) => (
                                        <SortableSection
                                            key={`section-${sIndex}`}
                                            section={section}
                                            sIndex={sIndex}
                                            handleSectionTitleChange={handleSectionTitleChange}
                                            removeSection={removeSection}
                                            addLesson={addLesson}
                                            handleLessonChange={handleLessonChange}
                                            removeLesson={removeLesson}
                                            onLessonDragEnd={onLessonDragEnd}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>

                            {courseData.curriculum.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 dark:bg-slate-700/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-400 dark:text-gray-500 font-medium italic">Qeybeha koorsadu hadda waa madhan yihiin.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Course Extras Card */}
                    <div className="bg-white dark:bg-slate-800 p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 md:space-y-8 transition-colors duration-300">
                        <div className="flex items-center gap-3 md:gap-4 border-b border-gray-50 dark:border-gray-700/50 pb-4 md:pb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Users size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h2 className="text-base md:text-xl font-black text-gray-900 dark:text-white">Course Extras & Outcomes</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Community Link (WhatsApp/Telegram)</label>
                                <div className="relative">
                                    <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="communityLink"
                                        value={courseData.communityLink}
                                        onChange={handleInputChange}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="https://chat.whatsapp.com/..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="text-emerald-500" size={20} />
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">What students will learn</label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addOutcome}
                                        className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 px-4 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest w-full sm:w-auto border border-emerald-100/50"
                                    >
                                        <PlusCircle size={14} />
                                        Add Outcome
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {courseData.learningOutcomes.map((outcome, index) => (
                                        <div key={index} className="flex gap-2 group/outcome">
                                            <input
                                                type="text"
                                                value={outcome}
                                                onChange={(e) => handleOutcomeChange(index, e.target.value)}
                                                className="flex-1 px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                placeholder={`Outcome ${index + 1}...`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOutcome(index)}
                                                className="p-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/outcome:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {courseData.learningOutcomes.length === 0 && (
                                        <div className="col-span-full py-8 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                                            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium italic">No outcomes added yet. Help students understand what they will learn!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    {/* Thumbnail Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 transition-colors duration-300">
                        <div className="flex items-center gap-3 md:gap-4 border-b border-gray-50 dark:border-gray-700/50 pb-4 md:pb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <ImageIcon size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h2 className="text-sm md:text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">THUMBNAIL</h2>
                        </div>

                        <div className="space-y-8">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-video w-full bg-gray-50 dark:bg-slate-900 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 overflow-hidden relative group cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                            >
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-emerald-600" size={32} />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase">Soolaaliyayaa...</span>
                                        </div>
                                    </div>
                                )}
                                {courseData.thumbnail ? (
                                    <>
                                        <img src={getImageUrl(courseData.thumbnail)} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                className="bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-xl"
                                            >
                                                Change Image
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3 p-4 text-center">
                                        <ImageIcon size={32} strokeWidth={1} className="md:w-10 md:h-10" />
                                        <p className="text-[10px] md:text-xs font-medium px-4">Upload a high-quality (1280x720) thumbnail</p>
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />

                            <div className="space-y-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-600"
                                >
                                    <Upload size={14} />
                                    {uploading ? "Upload course Thumbnail..." : "Upload course Thumbnail"}
                                </button>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Thumbnail URL</label>
                                    <input
                                        type="text"
                                        name="thumbnail"
                                        value={courseData.thumbnail}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-[10px] font-bold text-gray-500 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-600"
                                        placeholder="Paste image link here..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settings Card */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8 transition-colors duration-300">
                        <div className="flex items-center gap-4 underline decoration-emerald-200 dark:decoration-emerald-500/30 decoration-4 underline-offset-8">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Publishing Settings</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Instructor</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select
                                        name="instructor"
                                        value={courseData.instructor}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full pl-12 pr-10 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold cursor-pointer text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Instructor</option>
                                        {instructors.map(ins => (
                                            <option key={ins._id} value={ins._id}>{ins.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Access Type</label>
                                <div className="flex gap-2">
                                    {['Lifetime', 'Subscription', 'Free'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setCourseData(prev => ({ ...prev, accessType: type }))}
                                            className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${courseData.accessType === type
                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                                                : 'bg-white dark:bg-slate-700 border-gray-100 dark:border-gray-600 text-gray-400 dark:text-gray-400 hover:border-emerald-200 dark:hover:border-emerald-500/50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Level</label>
                                <div className="relative">
                                    <select
                                        name="level"
                                        value={courseData.level}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full px-6 pr-12 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-gray-900 dark:text-white cursor-pointer"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Professional">Professional</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Certificate Settings Card */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 transition-colors duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Award className="text-emerald-500" size={20} />
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Certificate</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCourseData(prev => ({ ...prev, hasCertificate: !prev.hasCertificate }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${courseData.hasCertificate ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${courseData.hasCertificate ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        {courseData.hasCertificate && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Template</label>
                                    <div className="relative">
                                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select
                                            name="certificateTemplate"
                                            value={courseData.certificateTemplate}
                                            onChange={handleInputChange}
                                            className="appearance-none w-full pl-12 pr-10 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold cursor-pointer text-gray-900 dark:text-white"
                                        >
                                            <option value="">Choose Template...</option>
                                            {certificateTemplates.map(tpl => (
                                                <option key={tpl._id} value={tpl._id}>
                                                    {tpl.name} {tpl.isActive ? '(Default)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium px-2 italic">
                                        Ardaydu waxay heli doonaan shahaadadan markay dhamaystiraan koorsada.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Status Card */}
                    <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Enrolled Students</span>
                                <span className="text-white text-lg font-black">{courseData.enrolledCount || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Reviews Count</span>
                                <span className="text-white text-lg font-black">0</span>
                            </div>
                            <div className="pt-4 border-t border-white/5 mt-4">
                                <button className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors py-2 text-[10px] font-black uppercase tracking-widest">
                                    <XCircle size={14} />
                                    Archives Course
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCourse;
