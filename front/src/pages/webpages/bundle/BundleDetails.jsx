import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft,
    FaPlayCircle,
    FaClock,
    FaAward,
    FaCheckCircle,
    FaBookOpen,
    FaInfoCircle,
    FaInfinity
} from 'react-icons/fa';
import { useData } from '../../../contexts/DataContext';
import { getImageUrl } from '../../../utils/format';
import { Layers, Package, ShoppingCart } from 'lucide-react';
import PremiumLoader from '../../../components/ui/PremiumLoader';
import { useAuth } from '../../../hooks/useAuth';
import { useMyOrders } from '../../../hooks/useMyOrders';
import { toast } from 'react-toastify';

const BundleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bundles, loading } = useData();
    const [isRedirecting, setIsRedirecting] = React.useState(false);
    const { user } = useAuth();
    const { isEnrolledInBundle } = useMyOrders(user);

    const isEnrolled = isEnrolledInBundle(id);

    // Find bundle from preloaded data
    const bundle = useMemo(() => {
        return bundles.find(b => b._id === id);
    }, [bundles, id]);

    useEffect(() => {
        if (bundle?.title) {
            document.title = `${bundle.title} | Course Bundle`;
        }
    }, [bundle]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-[#edf4f5] dark:bg-slate-900 transition-colors duration-500">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold italic animate-pulse tracking-widest text-sm uppercase">Loading bundle details...</p>
            </div>
        );
    }

    if (isRedirecting) {
        return <PremiumLoader text="Preparing your enrollment..." />;
    }

    if (!bundle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 bg-[#edf4f5] dark:bg-slate-900 transition-colors duration-500">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 text-4xl">😕</div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">BUNDLE NOT FOUND!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm font-medium italic">Sorry, the course bundle you are looking for does not exist.</p>
                <Link to="/courses" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-100 dark:shadow-none active:scale-95">Back to Courses</Link>
            </div>
        );
    }

    // Calc aggregated stats
    const stats = {
        totalCourses: bundle.courses?.length || 0,
        totalLessons: 0,
        totalSeconds: 0,
        hasCertificate: false
    };

    bundle.courses?.forEach(course => {
        if (course.hasCertificate) stats.hasCertificate = true;

        // Lessons count
        if (Array.isArray(course.curriculum)) {
            course.curriculum.forEach(section => {
                stats.totalLessons += (section.lessons?.length || 0);

                // Duration
                section.lessons?.forEach(lesson => {
                    if (lesson.duration) {
                        const parts = lesson.duration.split(':').map(Number);
                        if (parts.length === 2) stats.totalSeconds += parts[0] * 60 + parts[1];
                        if (parts.length === 3) stats.totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
                    }
                });
            });
        }
    });

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen pb-20">
            {/* Hero Section - Matching user request */}
            <section className="relative w-full h-80 md:h-[450px] overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={getImageUrl(bundle.thumbnail) || "/default-course.jpg"}
                        alt={bundle.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6 pt-20">
                    <h1 className="text-3xl md:text-6xl font-black mb-6 max-w-4xl leading-tight tracking-tight drop-shadow-xl">
                        {bundle.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <span className="bg-emerald-600/90 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                            Course Bundle
                        </span>
                        <div className="flex items-center gap-4 text-sm font-bold text-gray-200">
                            <span className="flex items-center gap-1.5"><FaBookOpen className="text-emerald-400" /> {stats.totalCourses} Courses</span>
                            <span className="flex items-center gap-1.5"><FaPlayCircle className="text-emerald-400" /> {stats.totalLessons} Lessons</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 mt-8">
                <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all mb-8"
                >
                    <FaArrowLeft /> Back to Courses
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">

                    {/* Left Column: Content */}
                    <div className="space-y-12">
                        {/* Summary Card */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                                <FaInfoCircle className="text-emerald-500" /> Package Overview
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                                {bundle.description}
                            </p>
                        </div>

                        {/* Course List */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight px-2 flex items-center gap-2">
                                <Layers className="text-emerald-500" /> Included Courses ({stats.totalCourses})
                            </h2>

                            <div className="grid grid-cols-1 gap-4">
                                {bundle.courses?.map((course, idx) => {
                                    const lessonsCount = course.curriculum?.reduce((sum, sec) => sum + (sec.lessons?.length || 0), 0) || 0;
                                    return (
                                        <div
                                            key={idx}
                                            className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all duration-300 flex flex-col sm:flex-row items-center gap-5"
                                        >
                                            <div className="w-full sm:w-40 aspect-video rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={getImageUrl(course.thumbnail)}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{course.level || 'Beginner'}</span>
                                                    <span className="text-gray-300 dark:text-slate-700">•</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course {idx + 1}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{course.title}</h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1.5"><FaPlayCircle className="text-emerald-500/70" /> {lessonsCount} Lessons</span>
                                                    {course.hasCertificate && (
                                                        <span className="flex items-center gap-1.5"><FaAward className="text-amber-500/70" /> Certificate</span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                to={`/courses/${course.slug || course.title?.toLowerCase().replace(/\s+/g, '-')}`}
                                                className="w-full sm:w-auto px-6 py-3 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
                                            >
                                                Preview
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Conversion */}
                    <div className="lg:sticky lg:top-32 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Bundle Price</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400">${bundle.price}</span>
                                        <span className="text-sm font-bold text-gray-400 line-through">Calculated value...</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Access</span>
                                        <span className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest">
                                            <FaInfinity /> Lifetime
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Certificate</span>
                                        {stats.hasCertificate ? (
                                            <span className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest">
                                                <FaCheckCircle /> Included
                                            </span>
                                        ) : (
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">No Certificate</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!user) {
                                            toast.error("Please sign in to your account to purchase this bundle!");
                                            navigate('/auth/login');
                                            return;
                                        }
                                        if (isEnrolled) {
                                            navigate('/dashboard/orders');
                                        } else {
                                            setIsRedirecting(true);
                                            setTimeout(() => {
                                                navigate(`/payment/${bundle._id}?isBundle=true`);
                                            }, 800);
                                        }
                                    }}
                                    className={`w-full ${isEnrolled ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-700'} cursor-pointer text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3 group`}
                                >
                                    {isEnrolled ? (
                                        <>
                                            <Layers size={18} className="group-hover:scale-110 transition-transform" />
                                            View My Courses
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} className="group-hover:animate-bounce" />
                                            Get Enrolled Now
                                        </>
                                    )}
                                </button>


                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BundleDetails;
