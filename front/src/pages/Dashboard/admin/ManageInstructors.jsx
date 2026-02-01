import React, { useState, useEffect, useRef } from 'react';
import {
    UserPlus,
    Search,
    Mail,
    ShieldCheck,
    Star,
    MoreVertical,
    Users as UsersIcon,
    Trash2,
    Edit3,
    X,
    Check,
    Phone,
    FileText,
    Camera,
    Loader2,
    Lock,
    ShieldAlert
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import PremiumLoader from '../../../components/ui/PremiumLoader';
import { getAllInstructors, createInstructor, updateInstructor, deleteInstructor } from '../../../api/instructorService';
import { getAllCourses } from '../../../api/courseService';
import { uploadImage } from '../../../api/userService';
import { getImageUrl } from '../../../utils/format';
import { toast } from 'react-toastify';

const ManageInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const { canAccess } = usePermissions();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState([]);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef(null);
    const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        instructorTitle: '',
        contactEmail: '',
        contactPhone: '',
        description: '',
        image: '',
        isActive: true
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [insData, courseData] = await Promise.all([
                getAllInstructors(),
                getAllCourses()
            ]);
            setInstructors(insData);
            setCourses(courseData);
        } catch (error) {
            toast.error("Failed to fetch instructors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            instructorTitle: '',
            contactEmail: '',
            contactPhone: '',
            description: '',
            image: '',
            isActive: true
        });
        setSelectedInstructor(null);
    };

    const handleOpenModal = (mode, instructor = null) => {
        setModalMode(mode);
        if (mode === 'edit' && instructor) {
            setSelectedInstructor(instructor);
            setFormData({
                name: instructor.name || '',
                instructorTitle: instructor.instructorTitle || '',
                contactEmail: instructor.contactEmail || '',
                contactPhone: instructor.contactPhone || '',
                description: instructor.description || '',
                image: instructor.image || '',
                isActive: instructor.isActive !== false
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                const res = await createInstructor(formData);
                if (res) {
                    toast.success("New instructor added successfully!");
                    fetchData();
                    setShowModal(false);
                }
            } else {
                const res = await updateInstructor(selectedInstructor._id, formData);
                if (res) {
                    toast.success("Instructor data updated successfully!");
                    fetchData();
                    setShowModal(false);
                }
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const success = await deleteInstructor(selectedInstructor._id);
            if (success) {
                toast.success("Instructor deleted successfully!");
                fetchData();
                setShowDeleteModal(false);
            }
        } catch (error) {
            toast.error("Failed to delete instructor.");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (instructor) => {
        try {
            const newStatus = !instructor.isActive;
            const res = await updateInstructor(instructor._id, { isActive: newStatus });
            if (res) {
                setInstructors(instructors.map(ins =>
                    ins._id === instructor._id ? { ...ins, isActive: newStatus } : ins
                ));
                toast.success(newStatus ? "Instructor activated!" : "Instructor deactivated!");
            }
        } catch (error) {
            toast.error("Failed to change instructor status.");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        setUploading(true);

        try {
            const imagePath = await uploadImage(uploadFormData, token);
            setFormData(prev => ({ ...prev, image: imagePath }));
            toast.success("Image uploaded successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Wuu fashilmay upload-ka sawirka");
        } finally {
            setUploading(false);
        }
    };

    const getCourseCount = (instructorId) => {
        return courses.filter(course =>
            (course.instructor?._id === instructorId) || (course.instructor === instructorId)
        ).length;
    };

    const calculateRating = (reviews) => {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0);
        return (sum / reviews.length).toFixed(1);
    };

    const filteredInstructors = instructors.filter(ins =>
        ins.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ins.contactEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-[Inter] mb-20">
            {!canAccess('instructors', 'view') && !loading ? (
                <div className="max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-rose-100 dark:border-rose-900/30">
                    <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-12 h-12 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Access Denied</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-lg leading-relaxed italic">
                        Sorry, you don't have permission to view this page.
                        Please contact the administrator for access.
                    </p>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="mt-10 px-12 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                    >
                        Back to Dashboard
                    </button>
                </div>
            ) : (
                <>
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Instructors Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Create, edit, and manage educators' status and profiles.</p>
                        </div>
                        <button
                            onClick={() => canAccess('instructors', 'create') && handleOpenModal('create')}
                            disabled={!canAccess('instructors', 'create')}
                            title={!canAccess('instructors', 'create') ? "You don't have permission" : ""}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl active:scale-95 ${!canAccess('instructors', 'create') ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed shadow-none opacity-60' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'}`}
                        >
                            {!canAccess('instructors', 'create') ? <Lock size={20} /> : <UserPlus size={20} />}
                            <span className="uppercase tracking-widest">Add New Instructor</span>
                        </button>
                    </div>

                    {/* toolbar Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative group w-full">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search instructors by name or email..."
                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <PremiumLoader text="Loading data..." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredInstructors.length > 0 ? (
                                filteredInstructors.map((ins) => (
                                    <div key={ins._id} className={`bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border ${ins.isActive === false ? 'border-amber-100 dark:border-amber-900/30 grayscale-[0.5]' : 'border-gray-100 dark:border-gray-700'} shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 dark:hover:shadow-none transition-all duration-500 group relative overflow-hidden flex flex-col h-full border-b-4 border-b-transparent hover:border-b-emerald-500`}>
                                        {/* Status Badge Overlay */}
                                        {ins.isActive === false && (
                                            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] z-20">
                                                Inactive
                                            </div>
                                        )}

                                        {/* Background Decoration */}
                                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>

                                        <div className="relative flex items-start justify-between mb-8">
                                            <div className="w-20 h-20 bg-emerald-50 dark:bg-slate-700/50 rounded-3xl p-1 border-2 border-white dark:border-slate-600 shadow-lg overflow-hidden group-hover:rotate-3 transition-transform duration-500">
                                                <img
                                                    src={getImageUrl(ins.image)}
                                                    alt={ins.name}
                                                    className="w-full h-full object-cover rounded-2xl"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://ui-avatars.com/api/?name=" + ins.name + "&background=ecfdf5&color=059669";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => canAccess('instructors', 'edit') && handleOpenModal('edit', ins)}
                                                    disabled={!canAccess('instructors', 'edit')}
                                                    title={!canAccess('instructors', 'edit') ? "You don't have permission" : "Edit"}
                                                    className={`p-3 rounded-2xl transition-all ${!canAccess('instructors', 'edit') ? 'text-gray-300 cursor-not-allowed bg-gray-100 dark:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                >
                                                    {!canAccess('instructors', 'edit') ? <Lock size={18} /> : <Edit3 size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => canAccess('instructors', 'delete') && (setSelectedInstructor(ins), setShowDeleteModal(true))}
                                                    disabled={!canAccess('instructors', 'delete')}
                                                    title={!canAccess('instructors', 'delete') ? "You don't have permission" : "Delete"}
                                                    className={`p-3 rounded-2xl transition-all ${!canAccess('instructors', 'delete') ? 'text-gray-300 cursor-not-allowed bg-gray-100 dark:bg-slate-800' : 'text-gray-400 hover:text-rose-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-rose-50 dark:hover:bg-rose-500/10'}`}
                                                >
                                                    {!canAccess('instructors', 'delete') ? <Lock size={18} /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{ins.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{ins.instructorTitle || 'Course Instructor'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-5 mb-8">
                                            <div className="flex items-center gap-3 text-gray-400 bg-gray-50/50 dark:bg-slate-700/30 py-2.5 px-4 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                <Mail size={14} className="text-emerald-500 flex-shrink-0" />
                                                <span className="text-xs font-bold truncate">{ins.contactEmail || 'No email provided'}</span>
                                            </div>
                                            <button
                                                onClick={() => canAccess('instructors', 'status') && toggleStatus(ins)}
                                                disabled={!canAccess('instructors', 'status')}
                                                title={!canAccess('instructors', 'status') ? "You don't have permission" : "Toggle Status"}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all ${!canAccess('instructors', 'status')
                                                    ? 'cursor-not-allowed opacity-60 bg-gray-50 border-gray-200 text-gray-400'
                                                    : ins.isActive !== false
                                                        ? 'bg-emerald-5 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                                                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                                                    }`}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    {ins.isActive !== false ? 'Active Status' : 'Inactive Status'}
                                                    {!canAccess('instructors', 'status') && <Lock size={10} />}
                                                </span>
                                                <div className={`w-10 h-5 rounded-full relative transition-colors ${!canAccess('instructors', 'status') ? 'bg-gray-300' : (ins.isActive !== false ? 'bg-emerald-500' : 'bg-amber-400')}`}>
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${ins.isActive !== false ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-700/30 rounded-[2rem] border border-gray-100 dark:border-gray-700 mb-8 mt-auto">
                                            <div className="text-center flex-1 border-r border-gray-200 dark:border-gray-600 px-2">
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">Courses</p>
                                                <p className="text-lg font-black text-gray-900 dark:text-white">{getCourseCount(ins._id)}</p>
                                            </div>
                                            <div className="text-center flex-1 px-2">
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">Rating</p>
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Star size={14} className="text-amber-500 fill-amber-500" strokeWidth={3} />
                                                    <p className="text-lg font-black text-gray-900 dark:text-white">{calculateRating(ins.reviews)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                                <ShieldCheck size={14} />
                                                <span>Official Educator</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold italic opacity-60">Since {new Date(ins.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm text-center flex flex-col items-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                        <UsersIcon size={40} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900">No instructors found</p>
                                        <p className="text-gray-500 font-medium">Try adjusting your search or add a new instructor.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create/Edit Modal */}
                    {showModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {modalMode === 'create' ? 'Add New Instructor' : 'Edit Instructor Profile'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all shadow-sm">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative">
                                                <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200"
                                                    placeholder="e.g. Abdirahmaan Yusuf"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructor Title</label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200"
                                                    placeholder="e.g. Fullstack Developer"
                                                    value={formData.instructorTitle}
                                                    onChange={(e) => setFormData({ ...formData, instructorTitle: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <input
                                                    required
                                                    type="email"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200"
                                                    placeholder="email@example.com"
                                                    value={formData.contactEmail}
                                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200"
                                                    placeholder="+252 61..."
                                                    value={formData.contactPhone}
                                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div className="col-span-full space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Image</label>

                                            <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 transition-all group">
                                                <div className="relative">
                                                    <div className="w-32 h-32 bg-white dark:bg-slate-700 rounded-[2rem] shadow-xl overflow-hidden border-4 border-white dark:border-slate-600 relative group">
                                                        {formData.image ? (
                                                            <img
                                                                src={getImageUrl(formData.image)}
                                                                alt="Preview"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://ui-avatars.com/api/?name=" + (formData.name || 'New') + "&background=ecfdf5&color=059669&size=128";
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center relative overflow-hidden">
                                                                {/* Decorative Circles */}
                                                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/20 rounded-full blur-xl"></div>
                                                                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-black/10 rounded-full blur-xl"></div>
                                                                <UsersIcon className="text-white/80 drop-shadow-lg" size={48} strokeWidth={1.5} />
                                                            </div>
                                                        )}
                                                        {uploading && (
                                                            <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
                                                                <Loader2 className="text-white animate-spin" size={32} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-emerald-700 active:scale-95 transition-all">
                                                        <Camera size={20} />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                        />
                                                    </label>
                                                </div>

                                                <div className="flex-1 text-center md:text-left">
                                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">Upload New Photo</h4>
                                                    <p className="text-xs text-gray-400 font-medium">Recommended: Square image, max 2MB (JPG, PNG)</p>
                                                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                                                        {formData.image && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, image: '' })}
                                                                className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                                                            >
                                                                Remove Image
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bio / Description */}
                                        <div className="col-span-full space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Bio</label>
                                            <div className="relative">
                                                <FileText className="absolute left-4 top-6 text-emerald-500" size={18} />
                                                <textarea
                                                    rows="4"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200 resize-none"
                                                    placeholder="Write a brief professional summary..."
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                ></textarea>
                                            </div>
                                        </div>

                                        {/* Status Toggle */}
                                        <div className="col-span-full">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                                className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${formData.isActive
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-amber-50 dark:bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className={`p-3 rounded-2xl ${formData.isActive ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                        {formData.isActive ? <Check size={20} /> : <X size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-widest">{formData.isActive ? 'Active Profile' : 'Inactive Profile'}</p>
                                                        <p className="text-[10px] font-medium opacity-70">
                                                            {formData.isActive ? 'This instructor will be visible on the public website.' : 'This instructor will be hidden from the public website.'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`w-14 h-7 rounded-full relative transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-amber-400'}`}>
                                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${formData.isActive ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={submitting}
                                            type="submit"
                                            className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={20} /> : (modalMode === 'create' ? <UserPlus size={20} /> : <Check size={20} />)}
                                            <span>{modalMode === 'create' ? 'Create Instructor' : 'Save Changes'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowDeleteModal(false)}></div>
                            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-300">
                                <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
                                    <Trash2 size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Are you sure?</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-10">
                                    You are about to delete <span className="font-bold text-gray-900 dark:text-white">{selectedInstructor?.name}</span>. This action cannot be undone and will remove all their profile data.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                                    >
                                        No, Keep it
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={submitting}
                                        className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                        <span>Yes, Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Footer */}
                    <div className="flex items-center justify-between p-8 bg-gray-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden mt-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Instructor Network Status</p>
                            <p className="text-white text-sm mt-1 font-medium italic opacity-70">Active educational staff currently monitoring {courses.length} courses.</p>
                        </div>
                        <div className="relative z-10 flex gap-4">
                            <div className="flex -space-x-3 overflow-hidden">
                                {instructors.slice(0, 3).map((ins, i) => (
                                    <img
                                        key={i}
                                        className="inline-block h-10 w-10 rounded-full ring-4 ring-gray-900 object-cover"
                                        src={getImageUrl(ins.image)}
                                        alt=""
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageInstructors;
