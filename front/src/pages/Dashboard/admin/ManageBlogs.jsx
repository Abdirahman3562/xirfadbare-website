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
    Clock,
    MessageCircle,
    MessageSquare,
    Send,
    X,
    Lock,
    ShieldAlert
} from "lucide-react";
import PremiumLoader from "../../../components/ui/PremiumLoader";
import { toast } from "react-toastify";

const CommentItem = ({ comment, depth = 0, ...props }) => {
    const {
        expandedComments, toggleReplies,
        replyingTo, setReplyingTo, replyContent, setReplyContent, handleReply,
        editingComment, setEditingComment, editContent, setEditContent, handleEditComment, handleDeleteComment,
        getImageUrl,
        currentUser,
        hasPermission
    } = props;

    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedComments.has(comment._id);

    return (
        <div className={`relative ${depth > 0 ? 'mt-4' : 'mb-4'}`}>
            <div className={`flex gap-3 ${depth > 0 ? '' : ''}`}>
                <div className="flex-shrink-0 relative">
                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                        {comment.author?.image ? (
                            <img
                                src={getImageUrl(comment.author.image)}
                                alt={comment.author.firstName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={16} className="text-emerald-600" />
                        )}
                    </div>
                    {/* Vertical line for threading if it has replies and is expanded */}
                    {hasReplies && isExpanded && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 bg-gray-200 dark:bg-gray-700 -z-10 h-[calc(100%+8px)]"></div>
                    )}
                    {/* Curve connector for child */}
                    {depth > 0 && (
                        <div className="absolute -left-[22px] top-4 w-5 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    )}
                    {depth > 0 && (
                        <div className="absolute -left-[22px] -top-8 w-0.5 h-12 bg-gray-200 dark:bg-gray-700"></div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Comment Box */}
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 px-4 inline-block max-w-full relative group transition-colors duration-200">
                        <div className="flex items-center justify-between gap-4 mb-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer hover:underline">
                                {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'Unknown User'}
                            </h4>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {editingComment === comment._id ? (
                            <div className="min-w-[250px]">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    rows="2"
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={() => setEditingComment(null)}
                                        className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleEditComment(comment._id)}
                                        className="text-xs px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        )}

                        {/* Hover Actions */}
                        {!editingComment && (
                            <div className="absolute -right-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-slate-700 shadow-sm p-1 rounded-full border border-gray-100 dark:border-gray-600">
                                {(currentUser?._id === comment.author?._id || hasPermission('blogs.delete')) && (
                                    <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                                {(currentUser?._id === comment.author?._id || hasPermission('blogs.edit')) && (
                                    <button
                                        onClick={() => {
                                            setEditingComment(comment._id);
                                            setReplyingTo(null);
                                            setEditContent(comment.content);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 ml-1 select-none">
                        <button
                            onClick={() => {
                                if (hasPermission('blogs.edit')) {
                                    setReplyingTo(replyingTo === comment._id ? null : comment._id);
                                    setEditingComment(null);
                                    setReplyContent(`@${comment.author?.firstName || 'User'} `);
                                }
                            }}
                            disabled={!hasPermission('blogs.edit')}
                            title={!hasPermission('blogs.edit') ? "Ma haysatid oggolaanshaha inaad jawaabto" : ""}
                            className={`text-xs font-bold flex items-center gap-1 transition-colors ${!hasPermission('blogs.edit') ? 'text-gray-300 cursor-not-allowed' : replyingTo === comment._id ? 'text-emerald-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                        >
                            {!hasPermission('blogs.edit') && <Lock size={10} />}
                            Reply
                        </button>

                        {hasReplies && (
                            <button
                                onClick={() => toggleReplies(comment._id)}
                                className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                            >
                                {isExpanded ? (
                                    <>Hide {comment.replies.length} replies</>
                                ) : (
                                    <>View {comment.replies.length} replies</>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment._id && (
                        <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <User size={14} className="text-gray-400" />
                            </div>
                            <div className="flex-1 relative">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Reply to ${comment.author?.firstName}...`}
                                    className="w-full p-2 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white min-h-[40px] placeholder-gray-400 dark:placeholder-gray-500"
                                    rows="1"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleReply(comment._id);
                                        }
                                    }}
                                />
                                <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                                    <button
                                        onClick={() => setReplyingTo(null)}
                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded transition-colors"
                                        title="Cancel"
                                    >
                                        <X size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleReply(comment._id)}
                                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                        disabled={!replyContent.trim()}
                                        title="Send"
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recursive Replies */}
                    {hasReplies && isExpanded && (
                        <div className="mt-3">
                            {comment.replies.map(reply => (
                                <CommentItem key={reply._id} comment={reply} depth={depth + 1} {...props} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ManageBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [selectedBlogForComments, setSelectedBlogForComments] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Comment actions state
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [expandedComments, setExpandedComments] = useState(new Set());

    const [userPermissions, setUserPermissions] = useState([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const token = user?.token;
    const [currentUser, setCurrentUser] = useState(user);
    const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    useEffect(() => {
        if (token) {
            fetchBlogs();
            fetchUserProfile();
        }
    }, [token]);

    const fetchUserProfile = async () => {
        if (!token) return;
        try {
            const response = await fetch("http://localhost:5000/api/users/profile", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUserPermissions(data.permissions || []);
            setIsSuperAdmin(data.isSuperAdmin || data.role === 'admin');
        } catch (error) {
            console.error("Error fetching profile:", error);
            setIsSuperAdmin(user.role === 'admin');
        }
    };

    const hasPermission = (perm) => isSuperAdmin || userPermissions.includes(perm);

    const fetchBlogs = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/blogs");
            const data = await response.json();
            setBlogs(data.blogs || []);
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleViewComments = async (blog) => {
        setSelectedBlogForComments(blog);
        setShowCommentsModal(true);
        setLoadingComments(true);
        try {
            const response = await fetch(`http://localhost:5000/api/comments/${blog._id}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            } else {
                toast.error("Failed to load comments");
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
            toast.error("Error loading comments");
        } finally {
            setLoadingComments(false);
        }
    };

    const handleReply = async (parentId) => {
        if (!replyContent.trim()) return;

        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const response = await fetch('http://localhost:5000/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: replyContent,
                    blogId: selectedBlogForComments._id,
                    parentCommentId: parentId
                })
            });

            if (response.ok) {
                const newComment = await response.json();
                toast.success('Reply added successfully');
                setReplyContent("");
                setReplyingTo(null);
                // Refresh comments
                handleViewComments(selectedBlogForComments);
            } else {
                toast.error('Failed to add reply');
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error('Error adding reply');
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim()) return;

        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: editContent })
            });

            if (response.ok) {
                toast.success('Comment updated successfully');
                setEditingComment(null);
                setEditContent("");
                // Refresh comments
                handleViewComments(selectedBlogForComments);
            } else {
                toast.error('Failed to update comment');
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('Error updating comment');
        }
    };

    const toggleReplies = (commentId) => {
        const newExpanded = new Set(expandedComments);
        if (newExpanded.has(commentId)) {
            newExpanded.delete(commentId);
        } else {
            newExpanded.add(commentId);
        }
        setExpandedComments(newExpanded);
    };

    const handleDeleteComment = (commentId) => {
        setCommentToDelete(commentId);
        setShowDeleteCommentModal(true);
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;

        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const response = await fetch(`http://localhost:5000/api/comments/${commentToDelete}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Comment deleted successfully');
                // Refresh comments
                handleViewComments(selectedBlogForComments);
                setShowDeleteCommentModal(false);
                setCommentToDelete(null);
            } else {
                toast.error('Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Error deleting comment');
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
        return <PremiumLoader text="Loading blogs..." />;
    }

    return (
        <div className="space-y-6">
            {!hasPermission('blogs.view') && !loading ? (
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
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-[Outfit]">Manage Blogs</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Create, edit, and manage your blog posts
                            </p>
                        </div>
                        <button
                            onClick={() => hasPermission('blogs.create') && (window.location.href = '/admin/blogs/create')}
                            disabled={!hasPermission('blogs.create')}
                            title={!hasPermission('blogs.create') ? "Ma haysatid oggolaanshaha inaad abuurto blog" : ""}
                            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all shadow-sm font-medium ${!hasPermission('blogs.create') ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        >
                            {!hasPermission('blogs.create') ? <Lock size={18} /> : <Plus size={20} />}
                            Create Blog
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-800/90 transition-colors duration-300">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={20} className="text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-transparent cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-900 dark:text-gray-200"
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
                                <div key={blog._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col h-full">
                                    {/* Image Area */}
                                    <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-slate-700">
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
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-700/50">
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
                                        <div className="flex items-center justify-between gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            <span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md text-gray-700 dark:text-gray-300 truncate max-w-[50%]">
                                                {blog.category || "Uncategorized"}
                                            </span>
                                            <span className="flex items-center gap-1 shrink-0">
                                                <Calendar size={12} />
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer" title={blog.title}>
                                            <Link to={`/admin/blogs/edit/${blog._id}`}>
                                                {blog.title}
                                            </Link>
                                        </h3>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                                            {blog.content ? blog.content.replace(/<[^>]*>?/gm, "") : "No content available..."}
                                        </p>

                                        <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center overflow-hidden">
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

                                            {/* View Comments Button - Always Visible but could be restricted if needed */}
                                            <button
                                                onClick={() => handleViewComments(blog)}
                                                className="flex items-center gap-1 px-2 py-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="View Comments"
                                            >
                                                <MessageCircle size={16} />
                                                <span className="text-xs font-semibold">{blog.comments?.length || 0}</span>
                                            </button>

                                            {/* Edit Button */}
                                            <button
                                                onClick={() => hasPermission('blogs.edit') && (window.location.href = `/admin/blogs/edit/${blog._id}`)}
                                                disabled={!hasPermission('blogs.edit')}
                                                className={`p-2 rounded-lg transition-colors ${!hasPermission('blogs.edit') ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                title={!hasPermission('blogs.edit') ? "Ma haysatid oggolaanshaha wax beddelista" : "Edit Blog"}
                                            >
                                                {!hasPermission('blogs.edit') ? <Lock size={16} /> : <Edit size={16} />}
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => {
                                                    if (hasPermission('blogs.delete')) {
                                                        setBlogToDelete(blog);
                                                        setShowDeleteModal(true);
                                                    }
                                                }}
                                                disabled={!hasPermission('blogs.delete')}
                                                className={`p-2 rounded-lg transition-colors ${!hasPermission('blogs.delete') ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                                title={!hasPermission('blogs.delete') ? "Ma haysatid oggolaanshaha tirtirista" : "Delete Blog"}
                                            >
                                                {!hasPermission('blogs.delete') ? <Lock size={16} /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                <div className="flex flex-col items-center gap-4 max-w-sm mx-auto p-6">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-2">
                                        <FileText className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No blogs found</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
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

                    {/* Comments Modal */}
                    {showCommentsModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 backdrop-blur-sm">
                            <div className="bg-white dark:bg-slate-900 h-full w-full max-w-md shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col transition-colors">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Comments</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[250px]">
                                            {selectedBlogForComments?.title}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowCommentsModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        <XCircle size={24} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {loadingComments ? (
                                        <div className="flex justify-center py-8">
                                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <CommentItem
                                                key={comment._id}
                                                comment={comment}
                                                depth={0}
                                                expandedComments={expandedComments}
                                                toggleReplies={toggleReplies}
                                                replyingTo={replyingTo}
                                                setReplyingTo={setReplyingTo}
                                                replyContent={replyContent}
                                                setReplyContent={setReplyContent}
                                                handleReply={handleReply}
                                                editingComment={editingComment}
                                                setEditingComment={setEditingComment}
                                                editContent={editContent}
                                                setEditContent={setEditContent}
                                                handleEditComment={handleEditComment}
                                                handleDeleteComment={handleDeleteComment}
                                                getImageUrl={getImageUrl}
                                                currentUser={currentUser}
                                                hasPermission={hasPermission}
                                            />
                                        ))

                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No comments yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <Trash2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Delete Blog?</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 text-center text-sm">
                                    Are you sure you want to delete this blog? This action cannot be undone and will remove the post permanently.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium text-sm"
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
                    {/* Delete Confirmation Modal for Comments */}
                    {showDeleteCommentModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all scale-100 opacity-100 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-red-50 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500 dark:text-red-400 ring-4 ring-red-50 dark:ring-red-500/10">
                                        <Trash2 size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Comment?</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                        Are you sure you want to delete this comment? This action cannot be undone.
                                    </p>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => {
                                                setShowDeleteCommentModal(false);
                                                setCommentToDelete(null);
                                            }}
                                            className="flex-1 px-4 py-2.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl font-semibold text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDeleteComment}
                                            className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-sm transition-colors shadow-sm"
                                        >
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

export default ManageBlogs;
