import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    Users,
    PlayCircle,
    Clock,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Loader2,
    Infinity,
    Award,
    Lock,
    ShieldAlert
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import PremiumLoader from '../../../components/ui/PremiumLoader';
import { getAllCourses, deleteCourse } from '../../../api/courseService';
import { toast } from 'react-toastify';
import UserAvatar from '../../../components/UserAvatar';
import { getImageUrl } from '../../../utils/format';

const ManageCourses = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        level: '',
        technology: '',
        priceType: 'all',
        sortBy: 'newest'
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { canAccess } = usePermissions();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await getAllCourses();
            setCourses(data);
        } catch (error) {
            toast.error("Failed to load courses");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const calculateLessons = (curriculum) => {
        if (!curriculum || !Array.isArray(curriculum)) return 0;
        return curriculum.reduce((acc, section) => acc + (section.lessons?.length || 0), 0);
    };

    const calculateDuration = (curriculum) => {
        if (!curriculum || !Array.isArray(curriculum)) return "0h 0m";
        let totalSeconds = 0;
        curriculum.forEach(section => {
            section.lessons?.forEach(lesson => {
                if (lesson.duration) {
                    const [m, s] = lesson.duration.split(':').map(Number);
                    totalSeconds += (m || 0) * 60 + (s || 0);
                }
            });
        });
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.instructor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.technology || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLevel = !filters.level || course.level === filters.level;
        const matchesTech = !filters.technology || course.technology === filters.technology;
        const matchesPrice = filters.priceType === 'all' ||
            (filters.priceType === 'free' && (course.price === 0 || course.price?.amount === 0)) ||
            (filters.priceType === 'paid' && (course.price > 0 || course.price?.amount > 0));

        return matchesSearch && matchesLevel && matchesTech && matchesPrice;
    }).sort((a, b) => {
        if (filters.sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (filters.sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (filters.sortBy === 'price-high') return b.price - a.price;
        if (filters.sortBy === 'price-low') return a.price - b.price;
        return 0;
    });

    const uniqueTechnologies = [...new Set(courses.map(c => c.technology).filter(Boolean))];
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    if (loading) {
        return <PremiumLoader text="Soo aqrinaya koorsooyinka..." />;
    }

    const handleDelete = (id) => {
        setCourseToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            setIsDeleting(true);
            await deleteCourse(courseToDelete);
            toast.success("Koorsada waa la tirtiray si guul leh!");
            setShowDeleteModal(false);
            setCourseToDelete(null);
            fetchCourses(); // Refresh list
        } catch (error) {
            toast.error("Wuu fashilmay tirtirista koorsada");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-[Inter] mb-20">
            {!canAccess('courses', 'view') && !loading ? (
                <div className="max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-rose-100 dark:border-rose-900/30">
                    <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-12 h-12 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Access Denied</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-lg leading-relaxed italic">
                        Waan ka xunnahay, ma haysatid oggolaanshaha aad ku aragto boggan.
                        Fadlan la xiriir maamulka sare si laguu siiyo oggolaansho.
                    </p>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="mt-10 px-12 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                    >
                        Ku laabo Dashboard
                    </button>
                </div>
            ) : (
                <>
                    {/* Header section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Course Catalog</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Manage and monitor all educational content on the platform.</p>
                        </div>
                        <button
                            onClick={() => canAccess('courses', 'create') && navigate('/admin/courses/create/new')}
                            disabled={!canAccess('courses', 'create')}
                            title={!canAccess('courses', 'create') ? "Ma haysatid oggolaanshaha inaad abuurto koorso" : ""}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl active:scale-95 ${!canAccess('courses', 'create') ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-60' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'}`}
                        >
                            {!canAccess('courses', 'create') ? <Lock size={20} className="w-5 h-5" /> : <Plus size={20} strokeWidth={3} />}
                            <span className="uppercase tracking-widest">Create Course</span>
                        </button>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row gap-4 items-center relative z-20">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by title, technology or instructor..."
                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full md:w-auto">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-6 py-4 rounded-[1.5rem] border transition-all font-bold text-xs uppercase tracking-widest w-full md:w-auto justify-center shadow-sm ${showFilters
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 dark:shadow-none'
                                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-100 dark:border-gray-700'
                                    }`}
                            >
                                <Filter size={18} />
                                <span>Filters</span>
                                {(filters.level || filters.technology || filters.priceType !== 'all') && (
                                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                )}
                            </button>

                            {/* Filter Dropdown */}
                            {showFilters && (
                                <div className="absolute top-full right-0 mt-4 w-full md:w-[480px] bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 p-8 animate-in slide-in-from-top-4 duration-300 z-50">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Advanced Filters</h3>
                                        <button
                                            onClick={() => setFilters({ level: '', technology: '', priceType: 'all', sortBy: 'newest' })}
                                            className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Level Filter */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Level</label>
                                            <select
                                                value={filters.level}
                                                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                                className="w-full p-4 bg-gray-50 dark:bg-slate-700 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-600 focus:border-emerald-500 transition-all text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer appearance-none"
                                            >
                                                <option value="">All Levels</option>
                                                {levels.map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>

                                        {/* Technology Filter */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Technology</label>
                                            <select
                                                value={filters.technology}
                                                onChange={(e) => setFilters({ ...filters, technology: e.target.value })}
                                                className="w-full p-4 bg-gray-50 dark:bg-slate-700 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-600 focus:border-emerald-500 transition-all text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer appearance-none"
                                            >
                                                <option value="">All Tech</option>
                                                {uniqueTechnologies.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>

                                        {/* Price Filter */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pricing</label>
                                            <div className="flex bg-gray-50 dark:bg-slate-700 p-1 rounded-2xl">
                                                {['all', 'free', 'paid'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setFilters({ ...filters, priceType: type })}
                                                        className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filters.priceType === type
                                                            ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sort Filter */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sort By</label>
                                            <select
                                                value={filters.sortBy}
                                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                                className="w-full p-4 bg-gray-50 dark:bg-slate-700 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-600 focus:border-emerald-500 transition-all text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer appearance-none"
                                            >
                                                <option value="newest">Newest First</option>
                                                <option value="oldest">Oldest First</option>
                                                <option value="price-high">Price: High to Low</option>
                                                <option value="price-low">Price: Low to High</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="w-full mt-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Courses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <div key={course._id} className="group bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 dark:hover:shadow-black/30 transition-all duration-500 overflow-hidden flex flex-col h-full border-b-4 border-b-transparent hover:border-b-emerald-500">
                                    {/* Card Hero */}
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={getImageUrl(course.thumbnail)}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-emerald-100">
                                                {course.level || 'Beginner'}
                                            </span>
                                            {course.discountPercentage > 0 && (
                                                <span className="px-4 py-1.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg animate-pulse">
                                                    {course.discountPercentage}% OFF
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute bottom-4 left-6 right-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{course.technology || 'Technology'}</span>
                                            </div>
                                        </div>

                                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    canAccess('courses', 'edit') && navigate(`/admin/courses/edit/${course._id}`);
                                                }}
                                                disabled={!canAccess('courses', 'edit')}
                                                className={`p-3 backdrop-blur-md rounded-2xl shadow-xl transition-all hover:scale-110 ${!canAccess('courses', 'edit') ? 'bg-white/50 text-slate-400 cursor-not-allowed' : 'bg-white/90 text-gray-700 hover:bg-emerald-600 hover:text-white'}`}
                                                title={!canAccess('courses', 'edit') ? "Ma haysatid oggolaanshaha wax beddelista" : "Edit"}
                                            >
                                                {!canAccess('courses', 'edit') ? <Lock size={18} /> : <Edit size={18} />}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    canAccess('courses', 'delete') && handleDelete(course._id);
                                                }}
                                                disabled={!canAccess('courses', 'delete')}
                                                className={`p-3 backdrop-blur-md rounded-2xl shadow-xl transition-all hover:scale-110 ${!canAccess('courses', 'delete') ? 'bg-white/50 text-slate-400 cursor-not-allowed' : 'bg-white/90 text-red-500 hover:bg-red-600 hover:text-white'}`}
                                                title={!canAccess('courses', 'delete') ? "Ma haysatid oggolaanshaha tirtirista" : "Delete"}
                                            >
                                                {!canAccess('courses', 'delete') ? <Lock size={18} /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6 flex flex-col flex-1 space-y-4">
                                        <div className="space-y-1.5">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" title={course.title}>
                                                {course.title}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 font-medium leading-relaxed">
                                                {course.description || "No description provided for this course. Start learning today!"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 py-2 border-y border-gray-50 dark:border-gray-700/50">
                                            <UserAvatar
                                                image={course.instructor?.image}
                                                name={course.instructor?.name || 'Instructor'}
                                                size="w-12 h-12"
                                                className="ring-2 ring-emerald-50 dark:ring-emerald-500/20"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{course.instructor?.name || 'Unknown Instructor'}</span>
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{course.instructor?.instructorTitle || 'Course Instructor'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="flex flex-col items-center p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <Users size={16} className="text-emerald-500 mb-1" />
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{course.enrolledCount || 0}</span>
                                                <span className="text-[9px] text-gray-400 inline-block w-full text-center overflow-hidden font-bold uppercase truncate">Students</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <PlayCircle size={16} className="text-blue-500 mb-1" />
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{calculateLessons(course.curriculum)}</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">Lessons</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <Clock size={16} className="text-amber-500 mb-1" />
                                                <span className="text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap">{calculateDuration(course.curriculum)}</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">Total</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
                                                <Infinity size={14} className="text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">Lifetime Access</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {course.discountPercentage > 0 ? (
                                                    <>
                                                        <span className="text-[10px] font-bold text-gray-400 line-through tracking-wider">${course.price}</span>
                                                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                                                            <span className="text-sm align-top mr-0.5">$</span>
                                                            {(course.price * (1 - course.discountPercentage / 100)).toFixed(2)}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                                        <span className="text-sm align-top mr-0.5">$</span>
                                                        {course.price}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {course.hasCertificate && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl w-fit">
                                                <Award size={14} className="text-amber-600 dark:text-amber-400" strokeWidth={3} />
                                                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">Certificate</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                                            className="w-full bg-emerald-600 dark:shadow-none cursor-pointer hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-3 active:scale-95 group/btn mt-2"
                                        >
                                            <span className="uppercase tracking-widest text-xs">View Details</span>
                                            <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm text-center flex flex-col items-center space-y-4">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-500">
                                    <Plus size={40} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">No courses found</p>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Try adjusting your search or create a new course.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination/Status Footer */}
                    <div className="flex items-center justify-between p-8 bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Academy Inventory Control</p>
                            <p className="text-white text-sm mt-1 font-medium italic opacity-70">Showing {filteredCourses.length} courses from live database.</p>
                        </div>
                        <div className="relative z-10 flex gap-4">
                            <button className="px-6 py-3 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-30" disabled>Previous</button>
                            <button className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all text-xs font-bold uppercase tracking-widest shadow-xl shadow-emerald-900/40">Next Page</button>
                        </div>
                    </div>

                    {/* Custom Delete Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
                                <div className="p-10 text-center">
                                    <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 border border-red-100 dark:border-red-500/20">
                                        <Trash2 size={40} className="text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Ma hubtaa boss?</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                        Koorsadan mar haddii la tirtiro lama soo celin karo. Dhamaan xogta ardayda iyo casharada way lumayaan.
                                    </p>
                                </div>
                                <div className="p-8 bg-gray-50/80 dark:bg-slate-800/80 border-t border-gray-100 dark:border-gray-700 flex gap-4">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-4 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-slate-600 transition-all active:scale-95"
                                        disabled={isDeleting}
                                    >
                                        Jooji
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                        <span>{isDeleting ? 'Tirtiraya...' : 'Haa, Tirtir'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div >
    );
};

export default ManageCourses;
