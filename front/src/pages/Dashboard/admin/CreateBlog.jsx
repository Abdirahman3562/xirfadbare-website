import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    UploadCloud,
    Save,
    Loader2,
    Image as ImageIcon,
    X,
    User
} from "lucide-react";
import { toast } from "react-toastify";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const CreateBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "",
        status: "pending",
        thumbnail: ""
    });

    const [previewUrl, setPreviewUrl] = useState("");

    const quillRef = React.useRef(null);

    const imageHandler = React.useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const formData = new FormData();
                formData.append('image', file);

                try {
                    const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
                    const result = await fetch("http://localhost:5000/api/upload", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData
                    });

                    const data = await result.json();

                    if (result.ok && data.url) {
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection(true);
                        const imageUrl = `http://localhost:5000${data.url}`;
                        quill.insertEmbed(range.index, 'image', imageUrl);
                    } else {
                        toast.error('Image upload failed');
                    }
                } catch (error) {
                    toast.error('Error uploading image');
                    console.error(error);
                }
            }
        };
    }, []);

    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [imageHandler]);

    useEffect(() => {
        if (isEditing) {
            fetchBlog();
        }
    }, [id]);

    const fetchBlog = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/blogs/${id}`);
            const data = await response.json();
            if (response.ok) {
                setFormData({
                    title: data.title,
                    content: data.content,
                    category: data.category || "",
                    status: data.status || "pending",
                    thumbnail: data.thumbnail || ""
                });
                if (data.thumbnail) {
                    setPreviewUrl(`http://localhost:5000${data.thumbnail}`);
                }
            } else {
                toast.error("Failed to fetch blog details");
                navigate("/admin/blogs");
            }
            setFetching(false);
        } catch (error) {
            console.error("Error fetching blog:", error);
            toast.error("Error loading blog");
            navigate("/admin/blogs");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate Status
        if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
            toast.error("Please upload a valid image (JPEG, PNG, WEBP)");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size should be less than 5MB");
            return;
        }

        const uploadData = new FormData();
        uploadData.append("image", file);

        setUploading(true);
        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const response = await fetch("http://localhost:5000/api/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: uploadData
            });

            const data = await response.json();

            if (response.ok) {
                // data.url likely comes back as '/uploads/filename.ext'
                // We want to store the relative path in the DB
                setFormData(prev => ({ ...prev, thumbnail: data.url }));
                setPreviewUrl(`http://localhost:5000${data.url}`);
                toast.success("Image uploaded successfully");
            } else {
                toast.error(data.message || "Failed to upload image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            toast.error("Title and Content are required");
            return;
        }

        setLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const url = isEditing
                ? `http://localhost:5000/api/blogs/${id}`
                : "http://localhost:5000/api/blogs";

            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Blog ${isEditing ? "updated" : "created"} successfully`);
                navigate("/admin/blogs");
            } else {
                toast.error(data.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Error submitting form");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }



    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/admin/blogs")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? "Edit Blog" : "Create New Blog"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isEditing ? "Update blog details and status" : "Write a new blog post"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Blog Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., The Future of Web Development"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>

                        {/* Author (Disabled) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Author (You)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={JSON.parse(localStorage.getItem('loggedInUser'))?.firstName + ' ' + JSON.parse(localStorage.getItem('loggedInUser'))?.lastName || "Admin"}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-medium cursor-not-allowed outline-none"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Content
                            </label>
                            <div className="prose-editor">
                                <ReactQuill
                                    ref={quillRef}
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                                    placeholder="Write your blog content here..."
                                    className="h-[400px] mb-12"
                                    modules={modules}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="space-y-6">
                        {/* Publish Status */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Publish Status</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="e.g. Technology"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                        {isEditing ? "Update Blog" : "Create Blog"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail Upload */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Featured Image</h3>

                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                    {previewUrl ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewUrl("");
                                                    setFormData(prev => ({ ...prev, thumbnail: "" }));
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                            />
                                            <div className="py-8">
                                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={24} />}
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {uploading ? "Uploading..." : "Click to upload image"}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateBlog;
