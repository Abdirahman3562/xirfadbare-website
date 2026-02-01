import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    BookOpen,
    CheckCircle2,
    XCircle,
    Loader2,
    Package,
    Upload
} from 'lucide-react';
import { getAllCourses } from '../../../api/courseService';
import { createBundle, getBundleById, updateBundle } from '../../../api/bundleService';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../../config';
import { getImageUrl } from '../../../utils/format';

const EditBundle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [courses, setCourses] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        thumbnail: '',
        courses: [],
        isActive: true
    });

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const coursesData = await getAllCourses();
            setCourses(coursesData);

            if (isEdit) {
                const bundleData = await getBundleById(id);
                setFormData({
                    title: bundleData.title,
                    description: bundleData.description,
                    price: bundleData.price,
                    thumbnail: bundleData.thumbnail,
                    courses: bundleData.courses.map(c => c._id || c),
                    isActive: bundleData.isActive
                });
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            setUploading(true);
            const userInfo = JSON.parse(localStorage.getItem('loggedInUser'));
            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: uploadFormData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setFormData(prev => ({ ...prev, thumbnail: data.url || data.image || data }));
            toast.success("Sawirka waa la upload gareeyay!");
        } catch (error) {
            console.error(error);
            toast.error("Wuu fashilmay upload-ka sawirka");
        } finally {
            setUploading(false);
        }
    };

    const handleCourseToggle = (courseId) => {
        setFormData(prev => {
            const isSelected = prev.courses.includes(courseId);
            return {
                ...prev,
                courses: isSelected
                    ? prev.courses.filter(id => id !== courseId)
                    : [...prev.courses, courseId]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.courses.length === 0) {
            return toast.error("Please select at least one course");
        }

        try {
            setSaving(true);
            if (isEdit) {
                await updateBundle(id, formData);
                toast.success("Bundle updated successfully!");
            } else {
                await createBundle(formData);
                toast.success("Bundle created successfully!");
            }
            navigate('/admin/bundles');
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Bundle Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-[Inter] mb-20 px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                    onClick={() => navigate('/admin/bundles')}
                    className="w-full sm:w-auto group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">Back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                        {isEdit ? 'Edit bundle' : 'Create Bundle'}
                    </h1>
                </div>
                <div className="hidden sm:block w-20" /> {/* Spacer */}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bundle Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-700 focus:border-emerald-500 outline-none transition-all font-bold text-gray-700 dark:text-gray-200"
                                placeholder="e.g. Full Stack Development Bundle"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                required
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-700 focus:border-emerald-500 outline-none transition-all font-bold text-gray-700 dark:text-gray-200 resize-none"
                                placeholder="What's included in this package?"
                            />
                        </div>
                    </div>

                    {/* Course Selection */}
                    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <BookOpen className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Select Courses</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2 scrollbar-hide">
                            {courses.map(course => {
                                const isSelected = formData.courses.includes(course._id);
                                return (
                                    <div
                                        key={course._id}
                                        onClick={() => handleCourseToggle(course._id)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${isSelected
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                            : 'border-gray-50 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                <img src={getImageUrl(course.thumbnail)} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 dark:text-white truncate">{course.title}</span>
                                        </div>
                                        {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                        {formData.courses.length === 0 && (
                            <p className="text-center text-xs text-rose-500 font-bold mt-4 uppercase tracking-widest animate-pulse">
                                Select courses to bundle them together
                            </p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Price & Image */}
                    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bundle Price ($)</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-black text-2xl text-emerald-600"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thumbnail</label>

                            <div className="relative group">
                                <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 transition-colors group-hover:border-emerald-500/50">
                                    {formData.thumbnail ? (
                                        <img src={getImageUrl(formData.thumbnail)} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <>
                                            <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-gray-400">
                                                <ImageIcon size={32} strokeWidth={1.5} />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Image</p>
                                        </>
                                    )}

                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                        <div className="bg-white text-gray-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl transition-transform active:scale-90">
                                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Active Status</span>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />

                        <div className="relative z-10 flex items-center gap-3">
                            <Package className="w-8 h-8 text-emerald-400" />
                            <h3 className="text-lg font-black uppercase tracking-tight">Bundle Summary</h3>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                <span>Total Courses</span>
                                <span className="text-white">{formData.courses.length}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                <span>Total Savings</span>
                                <span className="text-emerald-400">Calculated on site</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="relative z-10 w-full cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isEdit ? 'Update Bundle' : 'Create Bundle'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditBundle;
