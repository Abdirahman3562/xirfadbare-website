import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { toast } from "react-toastify";

export default function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [deleteModal, setDeleteModal] = useState({ show: false, categoryId: null, categoryName: "" });

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
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Course Categories</h1>
                    <p className="text-gray-600 mt-1">Manage your course categories</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                    {showAddForm ? <X size={20} /> : <Plus size={20} />}
                    {showAddForm ? "Cancel" : "Add Category"}
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <form
                    onSubmit={handleCreate}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Add New Category
                    </h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                                placeholder="e.g., Frontend Development"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 focus:outline-none rounded-lg focus:ring focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Brief description of this category"
                                rows={3}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                        >
                            <Save size={20} />
                            Create Category
                        </button>
                    </div>
                </form>
            )}

            {/* Categories List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Category Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Courses
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No categories found. Create your first category!
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category._id} className="hover:bg-gray-50 transition">
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
                                                    className="w-full px-3 py-1 border border-emerald-300 rounded focus:ring focus:outline-none focus:ring-emerald-500"
                                                />
                                            ) : (
                                                <span className="font-medium text-gray-900">
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
                                                    className="w-full px-3 py-1 border border-emerald-300 rounded focus:ring focus:outline-none resize-none focus:ring-emerald-500"
                                                    rows={2}
                                                />
                                            ) : (
                                                <span className="text-gray-600 text-sm">
                                                    {category.description || "No description"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                {category.courseCount || 0} courses
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingId === category._id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdate(category._id)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                            title="Save"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                            title="Cancel"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingId(category._id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category._id, category.name)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
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
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">
                        {categories.length}
                    </div>
                    <div className="text-sm text-emerald-700">Total Categories</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">
                        {categories.reduce((sum, cat) => sum + (cat.courseCount || 0), 0)}
                    </div>
                    <div className="text-sm text-blue-700">Total Courses</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">
                        {categories.filter((cat) => (cat.courseCount || 0) > 0).length}
                    </div>
                    <div className="text-sm text-purple-700">Active Categories</div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in scale-100 opacity-100">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Delete Category</h3>
                                    <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-700">
                                Ma hubtaa inaad tirtireyso category-gan:{" "}
                                <span className="font-semibold text-gray-900">"{deleteModal.categoryName}"</span>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                All courses in this category will need to be reassigned.
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, categoryId: null, categoryName: "" })}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
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
        </div>
    );
}
