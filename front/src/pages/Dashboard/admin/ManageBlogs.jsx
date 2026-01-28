import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    MoreVertical,
    Filter,
    FileText,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import { toast } from "react-toastify";

const ManageBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/blogs");
            const data = await response.json();
            setBlogs(data.blogs || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Failed to load blogs");
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!blogToDelete) return;

        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const response = await fetch(`http://localhost:5000/api/blogs/${blogToDelete._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                setBlogs(blogs.filter((blog) => blog._id !== blogToDelete._id));
                toast.success("Blog deleted successfully");
                setShowDeleteModal(false);
                setBlogToDelete(null);
            } else {
                toast.error("Failed to delete blog");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            toast.error("Error deleting blog");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700 border-green-200";
            case "inactive":
                return "bg-red-100 text-red-700 border-red-200";
            case "pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "active":
                return <CheckCircle size={14} />;
            case "inactive":
                return <XCircle size={14} />;
            case "pending":
                return <Clock size={14} />;
            default:
                return null;
        }
    };

    const filteredBlogs = blogs.filter((blog) => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || blog.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getImageUrl = (img) => {
        if (!img) return null;
        return img.startsWith("/") ? `http://localhost:5000${img}` : img;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-[Outfit]">Manage Blogs</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Create, edit, and manage your blog posts
                    </p>
                </div>
                <Link
                    to="/admin/blogs/create"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm font-medium"
                >
                    <Plus size={20} />
                    Create Blog
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between sticky top-0 z-10 backdrop-blur-md bg-white/90">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredBlogs.length > 0 ? (
                    filteredBlogs.map((blog) => (
                        <div key={blog._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col h-full">
                            {/* Image Area */}
                            <div className="relative aspect-video overflow-hidden bg-gray-100">
                                {blog.thumbnail ? (
                                    <img
                                        src={getImageUrl(blog.thumbnail)}
                                        alt={blog.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                        <FileText size={48} className="mb-2 opacity-50" />
                                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">No Image</span>
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${blog.status === 'active' ? 'bg-green-500/90 text-white' :
                                            blog.status === 'inactive' ? 'bg-red-500/90 text-white' :
                                                'bg-yellow-500/90 text-white'
                                            }`}
                                    >
                                        {getStatusIcon(blog.status || "pending")}
                                        <span className="capitalize">{blog.status || "Pending"}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-center justify-between gap-4 mb-3 text-xs text-gray-500 font-medium">
                                    <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700 truncate max-w-[50%]">
                                        {blog.category || "Uncategorized"}
                                    </span>
                                    <span className="flex items-center gap-1 shrink-0">
                                        <Calendar size={12} />
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors cursor-pointer" title={blog.title}>
                                    <Link to={`/admin/blogs/edit/${blog._id}`}>
                                        {blog.title}
                                    </Link>
                                </h3>

                                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                                    {blog.content ? blog.content.replace(/<[^>]*>?/gm, "") : "No content available..."}
                                </p>

                                <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center overflow-hidden">
                                            {blog.author?.image ? (
                                                <img
                                                    src={getImageUrl(blog.author.image)}
                                                    alt={blog.author.firstName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={12} />
                                            )}
                                        </div>
                                        <span className="truncate max-w-[100px]">
                                            {blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : "Admin"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Link
                                            to={`/admin/blogs/edit/${blog._id}`}
                                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Edit Blog"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setBlogToDelete(blog);
                                                setShowDeleteModal(true);
                                            }}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Blog"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto p-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                <FileText className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No blogs found</h3>
                            <p className="text-gray-500 text-center mb-4">
                                {searchTerm
                                    ? `No results found for "${searchTerm}". Try different keywords.`
                                    : "Get started by creating your first blog post to share with your audience."}
                            </p>
                            {searchTerm ? (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-emerald-600 font-medium hover:underline"
                                >
                                    Clear Search
                                </button>
                            ) : (
                                <Link
                                    to="/admin/blogs/create"
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-md shadow-emerald-200"
                                >
                                    Create New Blog
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Delete Blog?</h3>
                        <p className="text-gray-600 mb-6 text-center text-sm">
                            Are you sure you want to delete this blog? This action cannot be undone and will remove the post permanently.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-sm shadow-red-200 text-sm"
                            >
                                Yes, Delete It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBlogs;
