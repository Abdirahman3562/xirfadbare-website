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
    Globe,
    FileText,
    Camera,
    Loader2,
    Github,
    Linkedin,
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    MapPin,
    ExternalLink
} from 'lucide-react';
import { getAllAuthors, createAuthor, updateAuthor, deleteAuthor } from '../../../api/authorService';
import { uploadImage } from '../../../api/userService';
import { getImageUrl } from '../../../utils/format';
import { toast } from 'react-toastify';

const ManageAuthors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        bio: '',
        avatar: '',
        verified: false,
        location: '',
        website: '',
        status: 'active',
        social: {
            github: '',
            linkedin: '',
            twitter: '',
            youtube: '',
            facebook: '',
            instagram: ''
        }
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAllAuthors();
            setAuthors(data);
        } catch (error) {
            toast.error("Wuu fashilmay soo aqrinta qorayaasha");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setFormData({
            username: '',
            name: '',
            email: '',
            bio: '',
            avatar: '',
            verified: false,
            location: '',
            website: '',
            status: 'active',
            social: {
                github: '',
                linkedin: '',
                twitter: '',
                youtube: '',
                facebook: '',
                instagram: ''
            }
        });
        setSelectedAuthor(null);
    };

    const handleOpenModal = (mode, author = null) => {
        setModalMode(mode);
        if (mode === 'edit' && author) {
            setSelectedAuthor(author);
            setFormData({
                username: author.username || '',
                name: author.name || '',
                email: author.email || '',
                bio: author.bio || '',
                avatar: author.avatar || '',
                verified: author.verified === true,
                location: author.location || '',
                website: author.website || '',
                status: author.status || 'active',
                social: {
                    github: author.social?.github || '',
                    linkedin: author.social?.linkedin || '',
                    twitter: author.social?.twitter || '',
                    youtube: author.social?.youtube || '',
                    facebook: author.social?.facebook || '',
                    instagram: author.social?.instagram || ''
                }
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
                const res = await createAuthor(formData);
                if (res) {
                    toast.success("Qoraa cusub ayaa lagu daray!");
                    fetchData();
                    setShowModal(false);
                }
            } else {
                const res = await updateAuthor(selectedAuthor._id, formData);
                if (res) {
                    toast.success("Xogta qoraaga waa la cusbooneysiiyay!");
                    fetchData();
                    setShowModal(false);
                }
            }
        } catch (error) {
            toast.error("Khalad ayaa dhacay. Fadlan isku day markale.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const success = await deleteAuthor(selectedAuthor._id);
            if (success) {
                toast.success("Qoraaga waa la tirtiray!");
                fetchData();
                setShowDeleteModal(false);
            }
        } catch (error) {
            toast.error("Wuu fashilmay tirtirista qoraaga.");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (author) => {
        try {
            const newStatus = author.status === 'active' ? 'inactive' : 'active';
            const res = await updateAuthor(author._id, { status: newStatus });
            if (res) {
                setAuthors(authors.map(a =>
                    a._id === author._id ? { ...a, status: newStatus } : a
                ));
                toast.success(newStatus === 'active' ? "Qoraaga waa la hawlgeliyay!" : "Qoraaga waa la damiyay!");
            }
        } catch (error) {
            toast.error("Wuu fashilmay bedelidda heerka qoraaga.");
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
            setFormData(prev => ({ ...prev, avatar: imagePath }));
            toast.success("Avatar-ka waa la upload gareeyay!");
        } catch (error) {
            console.error(error);
            toast.error("Wuu fashilmay upload-ka sawirka");
        } finally {
            setUploading(false);
        }
    };

    const filteredAuthors = authors.filter(a =>
        (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-[Inter]">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Authors Management</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Control blog authors, verification status and social profiles.</p>
                </div>
                <button
                    onClick={() => handleOpenModal('create')}
                    className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl shadow-emerald-200 active:scale-95"
                >
                    <UserPlus size={20} />
                    <span className="uppercase tracking-widest">Register New Author</span>
                </button>
            </div>

            {/* toolbar Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search authors by name, username or email..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium italic">Soo aqrinaya xogta qorayaasha...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAuthors.length > 0 ? (
                        filteredAuthors.map((author) => (
                            <div key={author._id} className={`bg-white p-8 rounded-[2.5rem] border ${author.status === 'inactive' ? 'border-amber-100' : 'border-gray-100'} shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 group relative overflow-hidden flex flex-col h-full border-b-4 border-b-transparent hover:border-b-emerald-500`}>
                                {/* Status Badge Overlay */}
                                {author.status === 'inactive' && (
                                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] z-20">
                                        Inactive
                                    </div>
                                )}

                                {/* Verified Badge Overlay */}
                                {author.verified && (
                                    <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-[0.2em] z-20 flex items-center gap-1">
                                        <ShieldCheck size={10} /> Verified
                                    </div>
                                )}

                                {/* Background Decoration */}
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50/50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>

                                <div className="relative flex items-start justify-between mb-8">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl p-1 border-2 border-white shadow-lg overflow-hidden group-hover:rotate-3 transition-transform duration-500">
                                        <img
                                            src={getImageUrl(author.avatar)}
                                            alt={author.name}
                                            className="w-full h-full object-cover rounded-2xl"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://ui-avatars.com/api/?name=" + (author.name || 'A') + "&background=ecfdf5&color=059669";
                                            }}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal('edit', author)}
                                            className="p-3 text-gray-400 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-2xl transition-all"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedAuthor(author); setShowDeleteModal(true); }}
                                            className="p-3 text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{author.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">@{author.username || 'username'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-5 mb-8">
                                    <div className="flex items-center gap-3 text-gray-400 bg-gray-50/50 py-2.5 px-4 rounded-2xl border border-gray-100 overflow-hidden">
                                        <Mail size={14} className="text-emerald-500 flex-shrink-0" />
                                        <span className="text-xs font-bold truncate">{author.email || 'No email provided'}</span>
                                    </div>
                                    {author.location && (
                                        <div className="flex items-center gap-3 text-gray-400 bg-gray-50/50 py-2.5 px-4 rounded-2xl border border-gray-100 overflow-hidden">
                                            <MapPin size={14} className="text-emerald-500 flex-shrink-0" />
                                            <span className="text-xs font-bold truncate">{author.location}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => toggleStatus(author)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border-2 transition-all duration-300 ${author.status === 'active'
                                            ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600 shadow-sm shadow-emerald-50'
                                            : 'bg-amber-50 border-amber-500/20 text-amber-600'
                                            }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${author.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></div>
                                            {author.status === 'active' ? 'Active Status' : 'Inactive Status'}
                                        </span>
                                        <div className={`w-11 h-6 rounded-full p-1 relative transition-colors duration-300 ${author.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm transform ${author.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </div>
                                    </button>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8 mt-auto italic text-xs text-gray-500 line-clamp-3">
                                    "{author.bio || 'No bio provided for this author.'}"
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="flex gap-2">
                                        {author.social?.github && <a href={author.social.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-600 transition-colors"><Github size={14} /></a>}
                                        {author.social?.linkedin && <a href={author.social.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-600 transition-colors"><Linkedin size={14} /></a>}
                                        {author.website && <a href={author.website} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-600 transition-colors"><Globe size={14} /></a>}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold italic opacity-60">
                                        Created {author.createdAt && !isNaN(new Date(author.createdAt))
                                            ? new Date(author.createdAt).toLocaleDateString()
                                            : new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm text-center flex flex-col items-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                <UsersIcon size={40} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">No authors found</p>
                                <p className="text-gray-500 font-medium">Register a new author to get started.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                {modalMode === 'create' ? 'Register New Author' : 'Edit Author Details'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-3 text-gray-400 hover:text-gray-900 hover:bg-white rounded-2xl transition-all shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Basic Info Title */}
                                <div className="col-span-full border-b border-gray-100 pb-2 mb-2">
                                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <UsersIcon size={14} /> Basic Information
                                    </h3>
                                </div>

                                {/* Username */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-6 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                        placeholder="samafale"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>

                                {/* Full Name */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-6 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                        placeholder="Samafale Mohamed"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-6 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                        placeholder="email@samafale.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                {/* Location */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                        placeholder="Mogadishu, Somalia"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                {/* Website & Verification */}
                                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 items-end mt-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Personal Website</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                            <input
                                                type="url"
                                                className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                                placeholder="https://..."
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, verified: !formData.verified })}
                                        className={`flex items-center justify-between px-6 py-3.5 rounded-2xl border-2 transition-all ${formData.verified
                                            ? 'bg-emerald-50 border-emerald-500/20 text-emerald-700'
                                            : 'bg-gray-50 border-gray-100 text-gray-400'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={18} className={formData.verified ? 'text-emerald-500' : 'text-gray-300'} />
                                            <span className="text-xs font-black uppercase tracking-widest">Verified Author</span>
                                        </div>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.verified ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${formData.verified ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </button>
                                </div>

                                {/* Image Upload */}
                                <div className="col-span-full space-y-4 pt-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Author Avatar</label>
                                    <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 hover:border-emerald-500/30 transition-all">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-lg overflow-hidden border-4 border-white relative group">
                                                {formData.avatar ? (
                                                    <img
                                                        src={getImageUrl(formData.avatar)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Auth&background=ecfdf5&color=059669"; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                                                        <UsersIcon size={32} />
                                                    </div>
                                                )}
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-emerald-700 transition-all">
                                                <Camera size={16} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-xs font-black text-gray-900 uppercase">Profile Photo</p>
                                            <p className="text-[10px] text-gray-400 font-medium">Used for public profile and blog posts.</p>
                                            {formData.avatar && <button type="button" onClick={() => setFormData({ ...formData, avatar: '' })} className="text-[10px] text-rose-500 font-bold uppercase mt-2">Remove</button>}
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="col-span-full space-y-1 pt-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biography</label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700 resize-none"
                                        placeholder="Full Stack Developer with passion for..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    ></textarea>
                                </div>

                                {/* Social Links Title */}
                                <div className="col-span-full border-b border-gray-100 pb-2 mt-4 mb-2">
                                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <ExternalLink size={14} /> Social Channels
                                    </h3>
                                </div>

                                {/* Social Links Grid */}
                                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-xs font-bold text-gray-600"
                                            placeholder="GitHub Profile URL"
                                            value={formData.social.github}
                                            onChange={(e) => setFormData({ ...formData, social: { ...formData.social, github: e.target.value } })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-xs font-bold text-gray-600"
                                            placeholder="LinkedIn Profile URL"
                                            value={formData.social.linkedin}
                                            onChange={(e) => setFormData({ ...formData, social: { ...formData.social, linkedin: e.target.value } })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-xs font-bold text-gray-600"
                                            placeholder="Twitter Profile URL"
                                            value={formData.social.twitter}
                                            onChange={(e) => setFormData({ ...formData, social: { ...formData.social, twitter: e.target.value } })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-xs font-bold text-gray-600"
                                            placeholder="Facebook Profile URL"
                                            value={formData.social.facebook}
                                            onChange={(e) => setFormData({ ...formData, social: { ...formData.social, facebook: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={submitting}
                                    type="submit"
                                    className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : (modalMode === 'create' ? <UserPlus size={20} /> : <Check size={20} />)}
                                    <span>{modalMode === 'create' ? 'Register Author' : 'Update Profile'}</span>
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
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Delete Author?</h3>
                        <p className="text-gray-500 font-medium mb-10 text-sm">
                            Author <span className="font-bold text-gray-900">{selectedAuthor?.name}</span> will be removed along with their status. This cannot be reversed.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest"
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Footer */}
            <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Verification System</h4>
                        <p className="text-gray-400 text-[10px] font-medium mt-1">Verified authors display a shield badge on their public profile and blog posts.</p>
                    </div>
                </div>
                <div className="flex -space-x-4">
                    {authors.slice(0, 5).map((a, i) => (
                        <div key={i} className="w-10 h-10 bg-white rounded-full border-2 border-white overflow-hidden shadow-sm ring-2 ring-emerald-50">
                            <img src={getImageUrl(a.avatar)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=A&background=ecfdf5&color=059669"; }} />
                        </div>
                    ))}
                    {authors.length > 5 && (
                        <div className="w-10 h-10 bg-emerald-600 text-white rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black z-10">
                            +{authors.length - 5}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageAuthors;
