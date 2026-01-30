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
    PlusCircle,
    Upload,
    Users,
    GripVertical
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

const SortableLesson = ({ lesson, lIndex, sIndex, handleLessonChange, removeLesson }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: lesson._id || `temp-lesson-${sIndex}-${lIndex}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm flex items-center gap-4 group/lesson transition-all hover:border-emerald-200 dark:hover:border-emerald-500/30"
        >
            <div
                {...attributes}
                {...listeners}
                className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-emerald-500 transition-colors"
                title="Jiid si aad u kala bedesho"
            >
                <GripVertical size={16} />
            </div>
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                {lIndex + 1}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) => handleLessonChange(sIndex, lIndex, 'title', e.target.value)}
                    className="text-sm font-semibold text-gray-900 dark:text-white bg-transparent outline-none border-none py-1 h-full placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Lesson title..."
                />
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-transparent dark:border-gray-700">
                    <Clock size={14} className="text-gray-400" />
                    <input
                        type="text"
                        value={lesson.duration}
                        onChange={(e) => handleLessonChange(sIndex, lIndex, 'duration', e.target.value)}
                        className="bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 w-16 outline-none"
                        placeholder="00:00"
                    />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-transparent dark:border-gray-700 overflow-hidden">
                    <Video size={14} className="text-gray-400" />
                    <input
                        type="text"
                        value={lesson.videoUrl}
                        onChange={(e) => handleLessonChange(sIndex, lIndex, 'videoUrl', e.target.value)}
                        className="bg-transparent text-[10px] font-medium text-gray-500 dark:text-gray-400 flex-1 outline-none w-full min-w-0"
                        placeholder="Vimeo/YouTube ID"
                    />
                </div>
            </div>
            <button
                onClick={() => removeLesson(sIndex, lIndex)}
                className="p-2 text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover/lesson:opacity-100"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
};

const SortableSection = ({ section, sIndex, handleSectionTitleChange, removeSection, addLesson, handleLessonChange, removeLesson, onLessonDragEnd }) => {
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
            className="bg-gray-50/50 dark:bg-slate-800/50 rounded-[2rem] border border-gray-100/50 dark:border-gray-700/50 p-8 space-y-6 relative group/section transition-colors duration-300"
        >
            <div className="flex items-center gap-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="p-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-emerald-500 transition-colors"
                >
                    <GripVertical size={20} />
                </div>
                <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionTitleChange(sIndex, e.target.value)}
                    className="bg-transparent border-none outline-none text-lg font-bold text-gray-900 dark:text-white flex-1 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Section Title..."
                />
                <button
                    onClick={() => removeSection(sIndex)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/section:opacity-100"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="space-y-4 pl-10">
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
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest pt-2 ml-2"
                >
                    <Plus size={14} strokeWidth={3} />
                    Add Lesson
                </button>
            </div>
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
        curriculum: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [course, allInstructors, allCategories] = await Promise.all([
                    id === 'new' ? Promise.resolve(null) : getFullCourseDetails(id),
                    getAllInstructors(),
                    fetch('http://localhost:5000/api/categories').then(res => res.json())
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
                        learningOutcomes: course.learningOutcomes || [],
                        communityLink: course.communityLink || ''
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
                        curriculum: []
                    });
                }
                setInstructors(allInstructors);
                setCategories(allCategories || []);
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
            // Handle { url: "..." } or { image: "..." } or plain string if JSON parse fails (though res.json throws)
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
            const newCurriculum = [...prev.curriculum];
            newCurriculum[sectionIndex].title = title;
            return { ...prev, curriculum: newCurriculum };
        });
    };

    const addLesson = (sectionIndex) => {
        setCourseData(prev => {
            const newCurriculum = [...prev.curriculum];
            newCurriculum[sectionIndex].lessons.push({
                _id: `new-lesson-${Date.now()}`,
                title: 'New Lesson',
                duration: '00:00',
                videoUrl: ''
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
            const newCurriculum = [...prev.curriculum];
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
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm sticky top-4 z-40 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <Link
                        to="/admin/courses"
                        className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white line-clamp-1">
                            {id === 'new' ? 'DIWANGELI KOORSO CUSUB' : (courseData.title || 'BEDEL KOORSADA')}
                        </h1>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${id === 'new' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {id === 'new' ? 'ADD MODE — CREATE CONTENT' : 'EDIT MODE — UPDATE CONTENT'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {id !== 'new' && (
                        <button
                            onClick={() => navigate(`/courses/${courseData.slug}`)}
                            className="hidden md:flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-gray-100 dark:border-gray-700"
                        >
                            <Video size={16} />
                            Preview
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-emerald-600 dark:shadow-none cursor-pointer hover:bg-emerald-700 text-white px-8 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? (id === 'new' ? "Daabacaya..." : "Cusboonaysiinaya...") : (id === 'new' ? "PUBLISH COURSE" : "UPDATE COURSE")}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8 transition-colors duration-300">
                        <div className="flex items-center gap-4 border-b border-gray-50 dark:border-gray-700/50 pb-6">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Layout size={24} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">General Information</h2>
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
                    </div>

                    {/* Curriculum Builder */}
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8 transition-colors duration-300">
                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-700/50 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Video size={24} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Curriculum Structure</h2>
                            </div>
                            <button
                                onClick={addSection}
                                className="flex items-center gap-2 text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                            >
                                <PlusCircle size={18} />
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
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8 transition-colors duration-300">
                        <div className="flex items-center gap-4 border-b border-gray-50 dark:border-gray-700/50 pb-6">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Users size={24} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Course Extras & Outcomes</h2>
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
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="text-emerald-500" size={20} />
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">What students will learn</label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addOutcome}
                                        className="flex items-center gap-2 text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest"
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
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold appearance-none cursor-pointer text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Instructor</option>
                                        {instructors.map(ins => (
                                            <option key={ins._id} value={ins._id}>{ins.name}</option>
                                        ))}
                                    </select>
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
                                <select
                                    name="level"
                                    value={courseData.level}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-gray-900 dark:text-white"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Professional">Professional</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail Card */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                            <ImageIcon className="text-gray-400" size={20} />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white">Featured Media</h2>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group overflow-hidden rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 p-2 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
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
                                <img
                                    src={getImageUrl(courseData.thumbnail)}
                                    className="w-full aspect-video object-cover rounded-2xl shadow-xl transition-transform duration-700 group-hover:scale-105"
                                    alt="Thumbnail"
                                />
                            ) : (
                                <div className="w-full aspect-video bg-gray-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-gray-300 dark:text-gray-600">
                                    <ImageIcon size={40} />
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

                    {/* Stats/Status */}
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
