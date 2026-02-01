import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Save, X, Lock, ShieldAlert } from "lucide-react";
import { usePermissions } from "../../../hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PremiumLoader from "../../../components/ui/PremiumLoader";

export default function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteModal, setDeleteModal] = useState({ show: false, categoryId: null, categoryName: "" });
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const { canAccess } = usePermissions();
    const navigate = useNavigate();

    // Get user token from localStorage
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    // Fetch categories
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/categories");
            const data = await response.json();
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
            setLoading(false);
        }
    };

    // Create category
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Category created successfully!");
                setFormData({ name: "", description: "" });
                setShowAddForm(false);
                fetchCategories();
            } else {
                toast.error("❌ Failed to create category");
            }
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error("❌ Error creating category");
        }
    };

    // Update category
    const handleUpdate = async (id) => {
        const category = categories.find((c) => c._id === id);
        try {
            const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify(category),
            });

            if (response.ok) {
                toast.success("Category updated successfully!");
                setEditingId(null);
                fetchCategories();
            } else {
                toast.error("❌ Failed to update category");
            }
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("❌ Error updating category");
        }
    };

    // Delete category
    const handleDelete = (id, name) => {
        setDeleteModal({ show: true, categoryId: id, categoryName: name });
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/categories/${deleteModal.categoryId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                },
            });

            if (response.ok) {
                toast.success("Category deleted successfully!");
                fetchCategories();
            } else {
                toast.error("❌ Failed to delete category");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("❌ Error deleting category");
        } finally {
            setDeleteModal({ show: false, categoryId: null, categoryName: "" });
        }
    };

    const handleCategoryChange = (id, field, value) => {
        setCategories(
            categories.map((cat) =>
                cat._id === id ? { ...cat, [field]: value } : cat
            )
        );
    };

    if (loading) {
        return <PremiumLoader text="Loading Categories..." />;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {!canAccess('categories', 'view') && !loading ? (
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
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Categories</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your course categories</p>
                        </div>
                        <button
                            onClick={() => canAccess('categories', 'create') && setShowAddForm(!showAddForm)}
                            disabled={!canAccess('categories', 'create')}
                            title={!canAccess('categories', 'create') ? "You don't have permission to add a category" : ""}
                            className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg transition ${!canAccess('categories', 'create') ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed opacity-60' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        >
                            {!canAccess('categories', 'create') ? <Lock size={20} /> : showAddForm ? <X size={20} /> : <Plus size={20} />}
                            {showAddForm ? "Cancel" : "Add Category"}
                        </button>
                    </div>

                    {/* toolbar Section */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative flex-1 w-full">
                            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-45" size={18} />
                            <input
                                type="text"
                                placeholder="Search categories by name or description..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-500/20 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            {filteredCategories.length} Categories Found
                        </div>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <form
                            onSubmit={handleCreate}
                            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Add New Category
                            </h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="e.g., Frontend Development"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none rounded-lg focus:ring focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="Brief description of this category"
                                        rows={3}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                >
                                    <Save size={20} />
                                    Create Category
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Categories List */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Category Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Courses
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredCategories.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No categories found. {searchTerm ? "Try adjusting your search." : "Create your first category!"}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCategories.map((category) => (
                                            <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                                                <td className="px-6 py-4">
                                                    {editingId === category._id ? (
                                                        <input
                                                            type="text"
                                                            value={category.name}
                                                            onChange={(e) =>
                                                                handleCategoryChange(
                                                                    category._id,
                                                                    "name",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full px-3 py-1 border border-emerald-300 dark:border-emerald-500/50 rounded focus:ring focus:outline-none focus:ring-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {category.name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === category._id ? (
                                                        <textarea
                                                            value={category.description || ""}
                                                            onChange={(e) =>
                                                                handleCategoryChange(
                                                                    category._id,
                                                                    "description",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full px-3 py-1 border border-emerald-300 dark:border-emerald-500/50 rounded focus:ring focus:outline-none resize-none focus:ring-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                                            rows={2}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                            {category.description || "No description"}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400">
                                                        {category.courseCount || 0} courses
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {editingId === category._id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => canAccess('categories', 'edit') && handleUpdate(category._id)}
                                                                    disabled={!canAccess('categories', 'edit')}
                                                                    className={`p-2 rounded-lg transition ${!canAccess('categories', 'edit') ? 'text-gray-300 cursor-not-allowed' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                                    title={!canAccess('categories', 'edit') ? "You don't have permission" : "Save"}
                                                                >
                                                                    <Save size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingId(null)}
                                                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                                                                    title="Cancel"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => canAccess('categories', 'edit') && setEditingId(category._id)}
                                                                    disabled={!canAccess('categories', 'edit')}
                                                                    className={`p-2 rounded-lg transition ${!canAccess('categories', 'edit') ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
                                                                    title={!canAccess('categories', 'edit') ? "You don't have permission to edit" : "Edit"}
                                                                >
                                                                    {!canAccess('categories', 'edit') ? <Lock size={18} /> : <Edit2 size={18} />}
                                                                </button>
                                                                <button
                                                                    onClick={() => canAccess('categories', 'delete') && handleDelete(category._id, category.name)}
                                                                    disabled={!canAccess('categories', 'delete')}
                                                                    className={`p-2 rounded-lg transition ${!canAccess('categories', 'delete') ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'}`}
                                                                    title={!canAccess('categories', 'delete') ? "You don't have permission to delete" : "Delete"}
                                                                >
                                                                    {!canAccess('categories', 'delete') ? <Lock size={18} /> : <Trash2 size={18} />}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {categories.length}
                            </div>
                            <div className="text-sm text-emerald-700 dark:text-emerald-300">Total Categories</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg border border-blue-100 dark:border-blue-500/20">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {categories.reduce((sum, cat) => sum + (cat.courseCount || 0), 0)}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">Total Courses</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-lg border border-purple-100 dark:border-purple-500/20">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {categories.filter((cat) => (cat.courseCount || 0) > 0).length}
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">Active Categories</div>
                        </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {deleteModal.show && (
                        <div
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in scale-100 opacity-100 border border-gray-100 dark:border-gray-700 overflow-hidden">
                                {/* Modal Header */}
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                                            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Category</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 bg-white dark:bg-slate-800">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Are you sure you want to delete this category:{" "}
                                        <span className="font-semibold text-gray-900 dark:text-white">"{deleteModal.categoryName}"</span>?
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        All courses in this category will need to be reassigned.
                                    </p>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-b-2xl flex gap-3 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => setDeleteModal({ show: false, categoryId: null, categoryName: "" })}
                                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
