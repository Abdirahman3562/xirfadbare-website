import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    PlayCircle,
    CheckCircle,
    Lock,
    Menu,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Download,
    Share2,
    Star
} from 'lucide-react';
import { getFullCourseDetails } from '../../../api/courseService';
// import { markLessonComplete } from '../../../api/userProgressService'; // Assuming this exists or will exist
import { toast } from 'react-toastify';

const CourseContent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                const data = await getFullCourseDetails(id);
                if (data) {
                    setCourse(data);
                    // Set first lesson as active by default if available
                    if (data.curriculum?.[0]?.lessons?.[0]) {
                        setActiveLesson(data.curriculum[0].lessons[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to load course content", error);
                toast.error("Wuu fashilmay soo aqrinta koorsada.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
        }
    }, [id]);

    const handleLessonChange = (lesson) => {
        setActiveLesson(lesson);
        // On mobile, close sidebar when lesson is selected
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Koorsada lama helin</h2>
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden font-[Inter]">
            {/* Top Navigation Bar */}
            <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-sm md:text-base font-bold truncate max-w-[200px] md:max-w-md">
                        {course.title}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 hover:bg-gray-700 rounded-lg text-emerald-400 font-bold text-xs uppercase tracking-wider hidden md:block"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? 'Hide Content' : 'Show Content'}
                    </button>
                    <button
                        className="p-2 hover:bg-gray-700 rounded-lg md:hidden"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content Area (Video) */}
                <main className="flex-1 flex flex-col overflow-y-auto bg-black relative">
                    {activeLesson ? (
                        <div className="flex-1 flex flex-col">
                            {/* Video Player Placeholder */}
                            <div className="aspect-video bg-black flex items-center justify-center relative group">
                                {activeLesson.videoUrl ? (
                                    <iframe
                                        src={activeLesson.videoUrl.replace("watch?v=", "embed/")}
                                        title={activeLesson.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="text-center p-8">
                                        <PlayCircle size={64} className="mx-auto text-gray-700 mb-4" />
                                        <p className="text-gray-500 font-medium">No video content available for this lesson.</p>
                                    </div>
                                )}
                            </div>

                            {/* Lesson Details */}
                            <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">{activeLesson.title}</h2>
                                        {/* <p className="text-gray-400 text-sm">Lesson {activeLesson.order}</p> */}
                                    </div>
                                    {/* Buttons like Mark Complete can go here */}
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <h3 className="text-lg font-bold text-emerald-400 mb-2">Lesson Notes</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {activeLesson.content || "No additional text content for this lesson."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Select a lesson to start learning</p>
                        </div>
                    )}
                </main>

                {/* Sidebar (Curriculum) */}
                <aside
                    className={`
                        absolute md:relative right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 
                        transform transition-transform duration-300 z-10 flex flex-col
                        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:w-0 md:translate-x-0 md:border-none md:overflow-hidden'}
                    `}
                >
                    <div className="p-4 border-b border-gray-700 bg-gray-800/95 backdrop-blur sticky top-0 z-10">
                        <h3 className="font-bold text-white mb-1">Course Content</h3>
                        {/* <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[35%] rounded-full"></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">35% Completed</p> */}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {course.curriculum?.map((section, idx) => (
                            <div key={section._id || idx} className="border-b border-gray-700 last:border-0">
                                <div className="px-4 py-3 bg-gray-800/50">
                                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                                        Section {idx + 1}: {section.title}
                                    </h4>
                                </div>
                                <div>
                                    {section.lessons?.map((lesson) => (
                                        <button
                                            key={lesson._id}
                                            onClick={() => handleLessonChange(lesson)}
                                            className={`w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-gray-700/50 ${activeLesson?._id === lesson._id
                                                    ? 'bg-emerald-900/20 border-l-2 border-emerald-500'
                                                    : 'border-l-2 border-transparent'
                                                }`}
                                        >
                                            <div className="mt-0.5">
                                                {activeLesson?._id === lesson._id ? (
                                                    <PlayCircle size={16} className="text-emerald-500" />
                                                ) : (
                                                    // <CheckCircle size={16} className="text-emerald-500/50" />
                                                    <div className="w-4 h-4 rounded-full border border-gray-500"></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${activeLesson?._id === lesson._id ? 'text-emerald-400' : 'text-gray-300'
                                                    }`}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                                        <PlayCircle size={10} />
                                                        {lesson.duration || "5m"}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CourseContent;
