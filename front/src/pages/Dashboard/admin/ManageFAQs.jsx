import React, { useState, useEffect } from 'react';
import {
    MessageCircleQuestion,
    ShieldCheck,
    Search,
    Plus,
    Trash2,
    PenTool,
    X,
    Loader2,
    ListFilter,
    Lock,
    ShieldAlert
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '../../../api/adminService';
import { toast } from 'react-toastify';
import PremiumLoader from '../../../components/ui/PremiumLoader';

const ManageFAQs = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { canAccess } = usePermissions();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'general',
        order: 0,
        isActive: false // Default to false/pending
    });
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const data = await getFAQs();
            setFaqs(data);
        } catch (error) {
            toast.error('Failed to fetch FAQs');
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
            await deleteFAQ(itemToDelete._id);
            toast.success('FAQ removed successfully');
            setFaqs(faqs.filter(t => t._id !== itemToDelete._id));
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
            const updated = await updateFAQ(item._id, { ...item, isActive: !item.isActive });
            setFaqs(faqs.map(t => t._id === item._id ? updated : t));
            toast.success(`FAQ ${updated.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            question: item.question,
            answer: item.answer,
            category: item.category || 'general',
            order: item.order || 0,
            isActive: item.isActive
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (editingId) {
                const updated = await updateFAQ(editingId, formData);
                setFaqs(faqs.map(t => t._id === editingId ? updated : t));
                toast.success('FAQ updated');
            } else {
                const created = await createFAQ(formData);
                setFaqs([created, ...faqs]);
                toast.success('FAQ created');
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
        setFormData({ question: '', answer: '', category: 'general', order: 0, isActive: false });
        setEditingId(null);
    };

    const filteredFaqs = faqs.filter(t => {
        const matchesSearch = t.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return <PremiumLoader text="Loading FAQs..." />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-[Inter]">
            {!canAccess('faqs', 'view') && !loading ? (
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
                        className="mt-10 px-12 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl font-[Inter]"
                    >
                        Back to Dashboard
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-[Inter]">FAQ Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create and manage frequently asked questions.</p>
                        </div>
                        <button
                            onClick={() => canAccess('faqs', 'create') && (resetForm(), setIsModalOpen(true))}
                            disabled={!canAccess('faqs', 'create')}
                            title={!canAccess('faqs', 'create') ? "You don't have permission to add an FAQ" : ""}
                            className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-xl transition-all font-medium text-sm shadow-sm ${!canAccess('faqs', 'create') ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed opacity-60' : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-200'}`}
                        >
                            {!canAccess('faqs', 'create') ? <Lock size={18} /> : <Plus size={18} />}
                            <span>Add FAQ</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search questions or answers..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 dark:text-white appearance-none cursor-pointer"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                <option value="general">General</option>
                                <option value="courses">Courses</option>
                                <option value="payment">Payment</option>
                                <option value="technical">Technical</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <PremiumLoader />
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredFaqs.map((item) => (
                                <div key={item._id} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${item.isActive ? 'border-gray-100 dark:border-gray-700' : 'border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10'} shadow-sm hover:shadow-md transition-all relative group flex flex-col sm:flex-row sm:items-start gap-4`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base">{item.question}</h3>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wide">
                                                    {item.category}
                                                </span>
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                                    {item.isActive ? 'Active' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            {item.answer}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 sm:self-start">
                                        <button
                                            onClick={() => canAccess('faqs', 'status') && handleToggleStatus(item)}
                                            disabled={!canAccess('faqs', 'status')}
                                            title={!canAccess('faqs', 'status') ? "You don't have permission" : (item.isActive ? "Deactivate" : "Approve")}
                                            className={`p-2 rounded-lg transition-colors ${!canAccess('faqs', 'status') ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' : item.isActive ? 'text-gray-400 hover:text-amber-600 bg-gray-50 dark:bg-slate-700/50 dark:hover:bg-amber-500/10' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'}`}
                                        >
                                            {!canAccess('faqs', 'status') ? <Lock size={18} /> : <ShieldCheck size={18} />}
                                        </button>
                                        <button
                                            onClick={() => canAccess('faqs', 'edit') && handleEdit(item)}
                                            disabled={!canAccess('faqs', 'edit')}
                                            title={!canAccess('faqs', 'edit') ? "You don't have permission to edit" : "Edit"}
                                            className={`p-2 rounded-lg transition-colors ${!canAccess('faqs', 'edit') ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-60' : 'text-gray-400 hover:text-emerald-600 bg-gray-50 dark:bg-slate-700/50'}`}
                                        >
                                            {!canAccess('faqs', 'edit') ? <Lock size={18} /> : <PenTool size={18} />}
                                        </button>
                                        <button
                                            onClick={() => canAccess('faqs', 'delete') && handleDelete(item)}
                                            disabled={!canAccess('faqs', 'delete')}
                                            title={!canAccess('faqs', 'delete') ? "You don't have permission to delete" : "Delete"}
                                            className={`p-2 rounded-lg transition-colors ${!canAccess('faqs', 'delete') ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-60' : 'text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-slate-700/50'}`}
                                        >
                                            {!canAccess('faqs', 'delete') ? <Lock size={18} /> : <Trash2 size={18} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredFaqs.length === 0 && (
                                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                                    <MessageCircleQuestion size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No FAQs found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create/Edit Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-700/30">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit FAQ' : 'Add New FAQ'}</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Question</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm android:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            value={formData.question}
                                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                            placeholder="e.g. How do I access my course?"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Category</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 dark:text-white"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                <option value="general">General</option>
                                                <option value="courses">Courses</option>
                                                <option value="payment">Payment</option>
                                                <option value="technical">Technical</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Status</label>
                                            <div className="flex items-center gap-2 h-[42px] px-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-gray-600">
                                                <label className="flex items-center gap-2 cursor-pointer w-full">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isActive}
                                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Active (Visible)</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Answer</label>
                                        <textarea
                                            required
                                            rows="5"
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm resize-none android:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            value={formData.answer}
                                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                            placeholder="Provide a clear and helpful answer..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer dark:shadow-none text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-200 mt-4 flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="animate-spin" size={20} />}
                                        <span>{submitting ? 'Saving...' : 'Save FAQ'}</span>
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
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete FAQ?</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                        Are you sure you want to delete this FAQ? This action cannot be undone.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setDeleteModalOpen(false)}
                                            className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            disabled={isDeleting}
                                            className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 cursor-pointer dark:shadow-none"
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

export default ManageFAQs;
