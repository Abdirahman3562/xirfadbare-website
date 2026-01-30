import React, { useState, useEffect } from 'react';
import {
    MessageSquareQuote,
    ShieldCheck,
    Search,
    Plus,
    Trash2,
    PenTool,
    X,
    Loader2,
    Star,
    Quote,
    Lock,
    ShieldAlert
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../../api/adminService';
import { toast } from 'react-toastify';
import PremiumLoader from '../../../components/ui/PremiumLoader';

const ManageTestimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const { canAccess } = usePermissions();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        tag: '',
        quote: '',
        rating: 5,
        image: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const data = await getTestimonials();
            setTestimonials(data);
        } catch (error) {
            toast.error('Failed to fetch testimonials');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            setIsDeleting(true);
            await deleteTestimonial(itemToDelete._id);
            toast.success('Testimonial removed successfully');
            setTestimonials(testimonials.filter(t => t._id !== itemToDelete._id));
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            toast.error(error.message || 'Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            const updated = await updateTestimonial(item._id, { ...item, isActive: !item.isActive });
            setTestimonials(testimonials.map(t => t._id === item._id ? updated : t));
            toast.success(`Testimonial ${updated.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            name: item.name,
            role: item.role,
            tag: item.tag || '',
            quote: item.quote,
            rating: item.rating,
            image: item.image || ''
        });
        setIsModalOpen(true);
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formDataPayload = new FormData();
        formDataPayload.append('image', file);
        setUploading(true);

        try {
            const user = JSON.parse(localStorage.getItem('loggedInUser'));
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formDataPayload,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                const data = await res.text();
                setFormData(prev => ({ ...prev, image: data }));
                toast.success('Image uploaded successfully');
            } else {
                toast.error('Image upload failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (editingId) {
                const updated = await updateTestimonial(editingId, formData);
                setTestimonials(testimonials.map(t => t._id === editingId ? updated : t));
                toast.success('Testimonial updated');
            } else {
                const created = await createTestimonial(formData);
                setTestimonials([created, ...testimonials]);
                toast.success('Testimonial created');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', role: '', tag: '', quote: '', rating: 5, image: '' });
        setEditingId(null);
    };

    const getImageUrl = (image) => {
        if (!image) return null;
        return image.startsWith('/') ? `http://localhost:5000${image}` : image;
    };

    const filteredTestimonials = testimonials.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <PremiumLoader text="Loading Testimonials..." />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-[Inter]">
            {!canAccess('testimonials', 'view') && !loading ? (
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
                        className="mt-10 px-12 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl font-[Inter]"
                    >
                        Ku laabo Dashboard
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-[Inter]">Testimonials</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage what your students say about you.</p>
                        </div>
                        <button
                            onClick={() => canAccess('testimonials', 'create') && (resetForm(), setIsModalOpen(true))}
                            disabled={!canAccess('testimonials', 'create')}
                            title={!canAccess('testimonials', 'create') ? "Ma haysatid oggolaanshaha inaad darto markhaati" : ""}
                            className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-xl transition-all font-medium text-sm shadow-sm ${!canAccess('testimonials', 'create') ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed opacity-60 font-bold' : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-200'}`}
                        >
                            {!canAccess('testimonials', 'create') ? <Lock size={18} /> : <Plus size={18} />}
                            <span>Add Testimonial</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or role..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <PremiumLoader />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {filteredTestimonials.map((item) => (
                                <div key={item._id} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${item.isActive ? 'border-gray-100 dark:border-gray-700' : 'border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10'} shadow-sm hover:shadow-md transition-all relative group flex flex-col h-full`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {item.image ? (
                                                <img
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    className={`w-10 h-10 rounded-full object-cover border ${item.isActive ? 'border-gray-100 dark:border-gray-600' : 'border-amber-200 dark:border-amber-700 grayscale'}`}
                                                />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${item.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                                    {item.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.role}</p>
                                                    {item.tag && (
                                                        <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-md font-medium">
                                                            {item.tag}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < item.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-600"} />
                                                ))}
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                                {item.isActive ? 'Active' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4 relative flex-1">
                                        <Quote size={16} className="text-gray-300 dark:text-gray-600 absolute -top-1 -left-1 opacity-50" />
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-4 italic">
                                            "{item.quote}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-50 dark:border-gray-700/50 mt-auto">
                                        <button
                                            onClick={() => canAccess('testimonials', 'status') && handleToggleStatus(item)}
                                            disabled={!canAccess('testimonials', 'status')}
                                            title={!canAccess('testimonials', 'status') ? "Ma haysatid oggolaanshaha" : (item.isActive ? "Deactivate" : "Approve")}
                                            className={`p-2 rounded-lg transition-colors ${!canAccess('testimonials', 'status') ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' : item.isActive ? 'text-gray-400 hover:text-amber-600 bg-gray-50 dark:bg-slate-700/50 dark:hover:bg-amber-500/10' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'}`}
                                        >
                                            {!canAccess('testimonials', 'status') ? <Lock size={16} /> : <ShieldCheck size={16} />}
                                        </button>
                                        <button
                                            onClick={() => canAccess('testimonials', 'edit') && handleEdit(item)}
                                            disabled={!canAccess('testimonials', 'edit')}
                                            title={!canAccess('testimonials', 'edit') ? "Ma haysatid oggolaanshaha wax beddelista" : "Edit"}
                                            className={`p-2 rounded-lg transition-colors ${!canAccess('testimonials', 'edit') ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-60' : 'text-gray-400 hover:text-emerald-600 bg-gray-50 dark:bg-slate-700/50'}`}
                                        >
                                            {!canAccess('testimonials', 'edit') ? <Lock size={16} /> : <PenTool size={16} />}
                                        </button>
                                        <button
                                            onClick={() => canAccess('testimonials', 'delete') && handleDelete(item)}
                                            disabled={!canAccess('testimonials', 'delete')}
                                            title={!canAccess('testimonials', 'delete') ? "Ma haysatid oggolaanshaha tirtirista" : "Delete"}
                                            className={`p-2 rounded-lg transition-colors ${!canAccess('testimonials', 'delete') ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-60' : 'text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-slate-700/50'}`}
                                        >
                                            {!canAccess('testimonials', 'delete') ? <Lock size={16} /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredTestimonials.length === 0 && (
                                <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
                                    <MessageSquareQuote size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No testimonials found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create/Edit Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-700/30">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {/* Image Upload */}
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="relative group/upload cursor-pointer">
                                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-50 dark:border-emerald-500/20 bg-gray-50 dark:bg-slate-700 flex items-center justify-center relative shadow-sm group-hover/upload:border-emerald-100 dark:group-hover/upload:border-emerald-500/30 transition-colors">
                                                {formData.image ? (
                                                    <img
                                                        src={getImageUrl(formData.image)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-gray-300 dark:text-gray-500 font-bold text-2xl">
                                                        {formData.name ? formData.name.charAt(0) : '?'}
                                                    </div>
                                                )}
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                                        <Loader2 size={24} className="text-white animate-spin" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover/upload:bg-black/20 transition-colors flex items-center justify-center">
                                                    <div className="opacity-0 group-hover/upload:opacity-100 transition-opacity bg-black/50 p-1.5 rounded-full text-white">
                                                        <Plus size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                                onChange={uploadFileHandler}
                                                disabled={uploading}
                                            />
                                            {formData.image && !uploading && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData({ ...formData, image: '' });
                                                    }}
                                                    className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-20"
                                                >
                                                    <X size={10} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 ml-4 max-w-[150px]">Click to upload a photo for this testimonial.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm android:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Role</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm android:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                placeholder="e.g. Student"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Tag (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm android:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                value={formData.tag}
                                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                                placeholder="e.g. Verified Graduate"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Rating</label>
                                            <div className="flex gap-2 h-[42px] items-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, rating: star })}
                                                        className={`p-1 transition-transform hover:scale-110 ${star <= formData.rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}
                                                    >
                                                        <Star size={24} fill={star <= formData.rating ? "currentColor" : "none"} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Quote</label>
                                        <textarea
                                            required
                                            rows="4"
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm resize-none android:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            value={formData.quote}
                                            onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                                            placeholder="What did they say?"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 dark:shadow-none cursor-pointer text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-200 mt-4 flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="animate-spin" size={20} />}
                                        <span>{submitting ? 'Saving...' : 'Save Testimonial'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                    {/* Delete Confirmation Modal */}
                    {deleteModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                                <div className="p-6 text-center">
                                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-500/30">
                                        <Trash2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Testimonial?</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                        Are you sure you want to delete this testimonial? This action cannot be undone.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setDeleteModalOpen(false)}
                                            className="flex-1 py-2.5 cursor-pointer bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            disabled={isDeleting}
                                            className="flex-1 py-2.5 cursor-pointer bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"
                                        >
                                            {isDeleting && <Loader2 className="animate-spin" size={16} />}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageTestimonials;
