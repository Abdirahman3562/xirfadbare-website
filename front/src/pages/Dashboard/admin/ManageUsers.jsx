import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    Mail,
    ShieldCheck,
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
    Unlock,
    UserCircle,
    ShieldAlert
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import PremiumLoader from '../../../components/ui/PremiumLoader';
import {
    getUsers,
    adminCreateUser,
    adminUpdateUser,
    deleteUser,
    toggleUserStatus,
    updateUserRole,
    uploadImage
} from '../../../api/userService';
import { getRoles } from '../../../api/roleService';
import { getImageUrl } from '../../../utils/format';
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const { canAccess } = usePermissions();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const token = user?.token;
    const [selectedRole, setSelectedRole] = useState('all');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'student',
        bio: '',
        image: '',
        isActive: true,
        password: '' // Only for create
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getUsers(token);
            setUsers(data);

            // Try to fetch roles from API, fallback to defaults if it fails
            try {
                const rolesData = await getRoles(token);
                console.log('Fetched Roles:', rolesData);
                if (Array.isArray(rolesData) && rolesData.length > 0) {
                    setRoles(rolesData);
                } else {
                    // Use default roles if API returns empty
                    setRoles([
                        { _id: '1', name: 'Student' },
                        { _id: '2', name: 'Instructor' },
                        { _id: '3', name: 'Admin' },
                        { _id: '4', name: 'Teacher' }
                    ]);
                }
            } catch (roleError) {
                console.error('Failed to fetch roles, using defaults:', roleError);
                // Use default roles if API fails
                setRoles([
                    { _id: '1', name: 'Student' },
                    { _id: '2', name: 'Instructor' },
                    { _id: '3', name: 'Admin' },
                    { _id: '4', name: 'Teacher' }
                ]);
            }
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        } else {
            toast.error("Please login first");
            setLoading(false);
        }
    }, [token]);

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            role: 'student',
            bio: '',
            image: '',
            isActive: true,
            password: ''
        });
        setSelectedUser(null);
    };

    const handleOpenModal = (mode, userData = null) => {
        setModalMode(mode);
        if (mode === 'edit' && userData) {
            setSelectedUser(userData);
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                role: userData.role || 'student',
                bio: userData.bio || '',
                image: userData.image || '',
                isActive: userData.isActive !== false,
                password: '' // Don't show password on edit
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
                const res = await adminCreateUser(formData, token);
                if (res) {
                    toast.success("New user added successfully!");
                    fetchData();
                    setShowModal(false);
                }
            } else {
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password; // Don't send empty password if not changing
                const res = await adminUpdateUser(selectedUser._id, dataToSend, token);
                if (res) {
                    toast.success("User data updated successfully!");
                    fetchData();
                    setShowModal(false);
                }
            }
        } catch (error) {
            toast.error(error.message || "An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const success = await deleteUser(selectedUser._id, token);
            if (success) {
                toast.success("User deleted successfully!");
                fetchData();
                setShowDeleteModal(false);
            }
        } catch (error) {
            toast.error("Failed to delete user.");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (userToUpdate) => {
        try {
            const res = await toggleUserStatus(userToUpdate._id, token);
            if (res) {
                setUsers(users.map(u =>
                    u._id === userToUpdate._id ? { ...u, isActive: !u.isActive } : u
                ));
                toast.success(!userToUpdate.isActive ? "User activated!" : "User deactivated!");
            }
        } catch (error) {
            toast.error("Failed to change user status.");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await updateUserRole(userId, newRole, token);
            if (res) {
                setUsers(users.map(u =>
                    u._id === userId ? { ...u, role: newRole } : u
                ));
                toast.success(`User role changed to ${newRole}`);
            }
        } catch (error) {
            toast.error("Failed to change role.");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        setUploading(true);

        try {
            const imageUrl = await uploadImage(uploadFormData, token);
            setFormData(prev => ({ ...prev, image: imageUrl }));
            toast.success("Image uploaded successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.firstName + ' ' + u.lastName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || u.role?.toLowerCase() === selectedRole.toLowerCase();
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-[Inter] mb-20">
            {!canAccess('users', 'view') && !loading ? (
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
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">User Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Create, edit, and manage system users and their roles.</p>
                        </div>
                        <button
                            onClick={() => canAccess('users', 'create') && handleOpenModal('create')}
                            disabled={!canAccess('users', 'create')}
                            title={!canAccess('users', 'create') ? "You don't have permission" : ""}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl active:scale-95 ${!canAccess('users', 'create') ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed shadow-none opacity-60' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'}`}
                        >
                            {!canAccess('users', 'create') ? <Lock size={20} /> : <UserPlus size={20} />}
                            <span className="uppercase tracking-widest">Add New User</span>
                        </button>
                    </div>

                    {/* toolbar Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative group flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <select
                                className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-bold text-gray-600 dark:text-gray-200 appearance-none cursor-pointer shadow-sm uppercase tracking-wider"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Students</option>
                                <option value="instructor">Instructors</option>
                                <option value="admin">Admins</option>
                                {roles.length > 0 && roles.map(role => (
                                    !['student', 'instructor', 'admin'].includes(role.name.toLowerCase()) && (
                                        <option key={role._id} value={role.name.toLowerCase()}>{role.name}</option>
                                    )
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <PremiumLoader text="Loading data..." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((userItem) => (
                                    <div key={userItem._id} className={`bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border ${userItem.isActive === false ? 'border-amber-100 dark:border-amber-900/30 grayscale-[0.5]' : 'border-gray-100 dark:border-gray-700'} shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 dark:hover:shadow-none transition-all duration-500 group relative overflow-hidden flex flex-col h-full border-b-4 border-b-transparent hover:border-b-emerald-500`}>
                                        {/* Status Badge Overlay */}
                                        {userItem.isActive === false && (
                                            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] z-20">
                                                Inactive
                                            </div>
                                        )}

                                        {/* Background Decoration */}
                                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>

                                        <div className="relative flex items-start justify-between mb-8">
                                            <div className="w-20 h-20 bg-emerald-50 dark:bg-slate-700/50 rounded-3xl p-1 border-2 border-white dark:border-slate-600 shadow-lg overflow-hidden group-hover:rotate-3 transition-transform duration-500">
                                                <img
                                                    src={getImageUrl(userItem.image)}
                                                    alt={`${userItem.firstName} ${userItem.lastName}`}
                                                    className="w-full h-full object-cover rounded-2xl"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://ui-avatars.com/api/?name=" + (userItem.firstName + ' ' + userItem.lastName) + "&background=ecfdf5&color=059669";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => canAccess('users', 'edit') && handleOpenModal('edit', userItem)}
                                                    disabled={!canAccess('users', 'edit')}
                                                    title={!canAccess('users', 'edit') ? "You don't have permission" : "Edit"}
                                                    className={`p-3 rounded-2xl transition-all ${!canAccess('users', 'edit') ? 'text-gray-300 cursor-not-allowed bg-gray-100 dark:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                >
                                                    {!canAccess('users', 'edit') ? <Lock size={18} /> : <Edit3 size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => canAccess('users', 'delete') && (setSelectedUser(userItem), setShowDeleteModal(true))}
                                                    disabled={!canAccess('users', 'delete')}
                                                    title={!canAccess('users', 'delete') ? "You don't have permission" : "Delete"}
                                                    className={`p-3 rounded-2xl transition-all ${!canAccess('users', 'delete') ? 'text-gray-300 cursor-not-allowed bg-gray-100 dark:bg-slate-800' : 'text-gray-400 hover:text-rose-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-rose-50 dark:hover:bg-rose-500/10'}`}
                                                >
                                                    {!canAccess('users', 'delete') ? <Lock size={18} /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{userItem.firstName} {userItem.lastName}</h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${userItem.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    userItem.role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {userItem.role}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-5 mb-8">
                                            <div className="flex items-center gap-3 text-gray-400 bg-gray-50/50 dark:bg-slate-700/30 py-2.5 px-4 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                <Mail size={14} className="text-emerald-500 flex-shrink-0" />
                                                <span className="text-xs font-bold truncate">{userItem.email}</span>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {/* Status Toggle */}
                                                <button
                                                    onClick={() => canAccess('users', 'status') && toggleStatus(userItem)}
                                                    disabled={!canAccess('users', 'status')}
                                                    title={!canAccess('users', 'status') ? "You don't have permission" : "Toggle Status"}
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all ${!canAccess('users', 'status')
                                                        ? 'cursor-not-allowed opacity-60 bg-gray-50 border-gray-200 text-gray-400'
                                                        : userItem.isActive !== false
                                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                                            : 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100'
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        {userItem.isActive !== false ? 'Active' : 'Inactive'}
                                                        {!canAccess('users', 'status') && <Lock size={10} />}
                                                    </span>
                                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${!canAccess('users', 'status') ? 'bg-gray-300' : (userItem.isActive !== false ? 'bg-emerald-500' : 'bg-amber-400')}`}>
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${userItem.isActive !== false ? 'right-0.5' : 'left-0.5'}`}></div>
                                                    </div>
                                                </button>


                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <UserCircle size={14} />
                                                <span>Joined</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold italic opacity-60">
                                                {new Date(userItem.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
                                        <p className="text-xl font-bold text-gray-900">No users found</p>
                                        <p className="text-gray-500 font-medium">Try adjusting your search or add a new user.</p>
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
                                        {modalMode === 'create' ? 'Add New User' : 'Edit User Profile'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all shadow-sm">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* First Name */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                            <div className="relative">
                                                <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200"
                                                    placeholder="e.g. Abdirahmaan"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Last Name */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                            <div className="relative">
                                                <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200"
                                                    placeholder="e.g. Yusuf"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <input
                                                    required
                                                    type="email"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200"
                                                    placeholder="email@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Password (only for create or if changing) */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                                {modalMode === 'create' ? 'Password' : 'New Password (Optional)'}
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <input
                                                    required={modalMode === 'create'}
                                                    type="password"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200"
                                                    placeholder={modalMode === 'create' ? "••••••••" : "Leave empty to keep current"}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Role Selection */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <select
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200 appearance-none uppercase"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                >
                                                    {roles && roles.length > 0 ? (
                                                        roles.filter(role => role?.name).map(role => (
                                                            <option key={role._id} value={role.name.toLowerCase()}>{role.name}</option>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <option value="student">Student</option>
                                                            <option value="instructor">Instructor</option>
                                                            <option value="admin">Admin</option>
                                                        </>
                                                    )}
                                                </select>
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
                                                                    e.target.src = "https://ui-avatars.com/api/?name=" + ((formData.firstName || '') + ' ' + (formData.lastName || '') || 'New') + "&background=ecfdf5&color=059669&size=128";
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center relative overflow-hidden">
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
                                                    {formData.image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, image: '' })}
                                                            className="mt-4 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                                                        >
                                                            Remove Image
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bio / Description */}
                                        <div className="col-span-full space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bio / Note</label>
                                            <div className="relative">
                                                <FileText className="absolute left-4 top-6 text-emerald-500" size={18} />
                                                <textarea
                                                    rows="4"
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-200 resize-none"
                                                    placeholder="Write a brief note about this user..."
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
                                                        <p className="font-black text-sm uppercase tracking-widest">{formData.isActive ? 'Active User' : 'Inactive User'}</p>
                                                        <p className="text-[10px] font-medium opacity-70">
                                                            {formData.isActive ? 'This user can log in and access the platform.' : 'This user is suspended and cannot log in.'}
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
                                            className="flex-1 py-4  cursor-pointer rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={submitting}
                                            type="submit"
                                            className="flex-[2] py-4 rounded-2xl dark:shadow-none cursor-pointer bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={20} /> : (modalMode === 'create' ? <UserPlus size={20} /> : <Check size={20} />)}
                                            <span>{modalMode === 'create' ? 'Create User' : 'Save Changes'}</span>
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
                                    You are about to delete <span className="font-bold text-gray-900 dark:text-white">{selectedUser?.firstName} {selectedUser?.lastName}</span>. This action cannot be undone and will remove all their data.
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
                                        className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                        <span>Yes, Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageUsers;
