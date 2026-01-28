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
    ListFilter
} from 'lucide-react';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '../../../api/adminService';
import { toast } from 'react-toastify';

const ManageFAQs = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredFaqs = faqs.filter(t =>
        t.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-[Inter]">FAQ Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage frequently asked questions.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium text-sm shadow-sm hover:shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Add FAQ</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search questions or answers..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredFaqs.map((item) => (
                        <div key={item._id} className={`bg-white p-6 rounded-2xl border ${item.isActive ? 'border-gray-100' : 'border-amber-100 bg-amber-50/30'} shadow-sm hover:shadow-md transition-all relative group flex flex-col sm:flex-row sm:items-start gap-4`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-gray-900 text-base">{item.question}</h3>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wide">
                                            {item.category}
                                        </span>
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {item.isActive ? 'Active' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {item.answer}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 sm:self-start">
                                <button
                                    onClick={() => handleToggleStatus(item)}
                                    title={item.isActive ? "Deactivate" : "Approve"}
                                    className={`p-2 rounded-lg transition-colors ${item.isActive ? 'text-gray-400 hover:text-amber-600 bg-gray-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                                >
                                    <ShieldCheck size={18} />
                                </button>
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="p-2 text-gray-400 hover:text-emerald-600 bg-gray-50 rounded-lg transition-colors"
                                >
                                    <PenTool size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item)}
                                    className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredFaqs.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <MessageCircleQuestion size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No FAQs found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit FAQ' : 'Add New FAQ'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Question</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="e.g. How do I access my course?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
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
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Status</label>
                                    <div className="flex items-center gap-2 h-[42px] px-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <label className="flex items-center gap-2 cursor-pointer w-full">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-gray-700">Active (Visible)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Answer</label>
                                <textarea
                                    required
                                    rows="5"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm resize-none"
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    placeholder="Provide a clear and helpful answer..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-200 mt-4 flex items-center justify-center gap-2"
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete FAQ?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Are you sure you want to delete this FAQ? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"
                                >
                                    {isDeleting && <Loader2 className="animate-spin" size={16} />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFAQs;
