import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    Mail,
    ShieldCheck,
    Trash2,
    MoreVertical,
    Shield,
    User,
    GraduationCap,
    PenTool,
    X,
    Loader2,
    Upload,
    AlertTriangle,
    Lock,
    ShieldAlert
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import PremiumLoader from '../../../components/ui/PremiumLoader';
import { getUsers, adminCreateUser, deleteUser, updateUserRole, toggleUserStatus, adminUpdateUser } from '../../../api/userService';
import { toast } from 'react-toastify';

const ManageAdmins = () => {
    const { canAccess } = usePermissions();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'admin',
        image: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const token = loggedInUser.token;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers(token);
            setUsers(data);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            setIsDeleting(true);
            await deleteUser(userToDelete._id, token);
            toast.success('User removed successfully');
            setUsers(users.filter(u => u._id !== userToDelete._id));
            setDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            toast.error(error.message || 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const updated = await toggleUserStatus(userId, token);
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: updated.isActive } : u));
            toast.success(`User ${updated.isActive ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const [uploading, setUploading] = useState(false);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const user = JSON.parse(localStorage.getItem('loggedInUser'));
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                const data = await res.text();
                setFormData(prev => ({ ...prev, image: data })); // Use callback to ensure latest state
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

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const newUser = await adminCreateUser(formData, token);
            toast.success(`${newUser.role} created successfully`);
            setIsModalOpen(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phone: '',
                role: 'admin',
                image: ''
            });
            fetchUsers();
        } catch (error) {
            toast.error(error.message || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield size={16} className="text-emerald-600" />;
            case 'teacher': return <GraduationCap size={16} className="text-blue-600" />;
            case 'author': return <PenTool size={16} className="text-purple-600" />;
            default: return <User size={16} className="text-gray-600" />;
        }
    };

    const [editingUserId, setEditingUserId] = useState(null);

    const handleEdit = (user) => {
        setEditingUserId(user._id);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: '', // Password optional for update
            phone: user.phone || '',
            role: user.role,
            image: user.image || ''
        });
        setIsModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const { password, ...updateData } = formData;
            // Only include password if provided
            if (password) updateData.password = password;

            const updatedUser = await adminUpdateUser(editingUserId, updateData, token);
            toast.success(`User updated successfully`);
            setIsModalOpen(false);
            setEditingUserId(null);
            fetchUsers();
        } catch (error) {
            toast.error(error.message || 'Failed to update user');
        } finally {
            setSubmitting(false);
        }
    };

    const getImageUrl = (image) => {
        if (!image) return null;
        return image.startsWith('/') ? `http://localhost:5000${image}` : image;
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {!canAccess('users', 'view') && !loading ? (
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
                        onClick={() => window.location.href = '/admin/dashboard'}
                        className="mt-10 px-12 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                    >
                        Ku laabo Dashboard
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 font-[Inter]">User Management</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage Admins, Teachers, Authors, and Students.</p>
                        </div>
                        <button
                            onClick={() => canAccess('users', 'create') && setIsModalOpen(true)}
                            disabled={!canAccess('users', 'create')}
                            title={!canAccess('users', 'create') ? "Ma haysatid oggolaanshaha inaad ku darto xubin cusub" : ""}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium text-sm shadow-sm ${!canAccess('users', 'create') ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-200'}`}
                        >
                            {!canAccess('users', 'create') ? <Lock size={18} /> : <UserPlus size={18} />}
                            <span>Add New Member</span>
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-500">Role:</label>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="teacher">Teacher</option>
                                <option value="author">Author</option>
                                <option value="student">Student</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <PremiumLoader />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user) => (
                                <div key={user._id} className={`bg-white p-6 rounded-2xl border ${user.isActive ? 'border-gray-100' : 'border-red-100 bg-red-50/10'} shadow-sm hover:shadow-md transition-all group relative`}>
                                    <div className="flex items-center justify-between mb-4">
                                        {user.image ? (
                                            <div className="relative group/avatar">
                                                <img
                                                    src={getImageUrl(user.image)}
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover/avatar:scale-105 transition-transform duration-300"
                                                    onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + user.firstName + '+' + user.lastName}
                                                />
                                                <div className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-white rounded-lg shadow-sm border border-gray-50 flex items-center justify-center">
                                                    {getRoleIcon(user.role)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold border relative group/avatar ${user.role === 'admin' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                user.role === 'teacher' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    user.role === 'author' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        'bg-gray-50 text-gray-600 border-gray-100'
                                                }`}>
                                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                <div className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-white rounded-lg shadow-sm border border-gray-50 flex items-center justify-center">
                                                    {getRoleIcon(user.role)}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => canAccess('users', 'status') && handleToggleStatus(user._id)}
                                                disabled={!canAccess('users', 'status')}
                                                title={!canAccess('users', 'status') ? "Ma haysatid oggolaanshaha xaaladda" : (user.isActive ? "Deactivate User" : "Activate User")}
                                                className={`p-2 rounded-lg transition-colors ${!canAccess('users', 'status') ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' : user.isActive
                                                    ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                                    : 'text-red-600 bg-red-50 hover:bg-red-100'
                                                    }`}
                                            >
                                                {!canAccess('users', 'status') ? <Lock size={18} /> : <ShieldCheck size={18} />}
                                            </button>

                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 font-[Inter]">{user.firstName} {user.lastName}</h3>
                                    <div className="flex items-center gap-1.5 text-gray-500 mt-1 mb-4">
                                        <Mail size={14} />
                                        <span className="text-xs">{user.email}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex flex-col gap-2">
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase w-fit ${user.role === 'admin' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                user.role === 'teacher' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    user.role === 'author' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                        'bg-gray-50 text-gray-600 border border-gray-100'
                                                }`}>
                                                {user.role}
                                            </div>
                                            <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {user.isActive ? '● Active' : '● Deactivated'}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => canAccess('users', 'edit') && handleEdit(user)}
                                                disabled={!canAccess('users', 'edit')}
                                                className={`p-2 rounded-lg transition-colors ${!canAccess('users', 'edit') ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-emerald-600 bg-gray-50'}`}
                                                title={!canAccess('users', 'edit') ? "Ma haysatid oggolaanshaha wax beddelista" : "Edit User"}
                                            >
                                                {!canAccess('users', 'edit') ? <Lock size={16} /> : <PenTool size={16} />}
                                            </button>
                                            <button
                                                onClick={() => canAccess('users', 'delete') && handleDelete(user)}
                                                disabled={!canAccess('users', 'delete')}
                                                className={`p-2 rounded-lg transition-colors ${!canAccess('users', 'delete') ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 bg-gray-50'}`}
                                                title={!canAccess('users', 'delete') ? "Ma haysatid oggolaanshaha tirtirista" : "Delete User"}
                                            >
                                                {!canAccess('users', 'delete') ? <Lock size={16} /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create User Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <h2 className="text-xl font-bold text-gray-900">{editingUserId ? 'Edit Member' : 'Add New Member'}</h2>
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingUserId(null); // Reset edit state
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={editingUserId ? handleUpdate : handleCreate} className="p-6 space-y-4">
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="relative group/upload cursor-pointer">
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-50 bg-gray-50 flex items-center justify-center relative shadow-sm group-hover/upload:border-emerald-100 transition-colors">
                                                {formData.image ? (
                                                    <img
                                                        src={getImageUrl(formData.image)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={32} className="text-gray-300 group-hover/upload:text-emerald-400 transition-colors" />
                                                )}
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                                        <Loader2 size={24} className="text-white animate-spin" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover/upload:bg-black/20 transition-colors flex items-center justify-center">
                                                    <div className="opacity-0 group-hover/upload:opacity-100 transition-opacity bg-black/50 p-2 rounded-full text-white">
                                                        <Upload size={16} />
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
                                                    className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-20"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">First Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Last Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password {editingUserId && <span className="text-[10px] lowercase normal-case text-gray-400">(Leave blank to keep current)</span>}</label>
                                        <input
                                            required={!editingUserId}
                                            type="password"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Assign Role</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-sm appearance-none cursor-pointer"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="admin">Administrator</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="author">Author</option>
                                            <option value="student">Student</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-200 mt-4 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingUserId ? <PenTool size={20} /> : <UserPlus size={20} />)}
                                        <span>{submitting ? (editingUserId ? 'Updating...' : 'Creating...') : (editingUserId ? 'Update Member' : 'Create Member')}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Custom Delete Confirmation Modal */}
                    {deleteModalOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                                <div className="p-6 text-center">
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Are you sure you want to delete <span className="font-bold text-gray-900">{userToDelete?.firstName} {userToDelete?.lastName}</span>?
                                        This action cannot be undone.
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setDeleteModalOpen(false);
                                                setUserToDelete(null);
                                            }}
                                            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
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

export default ManageAdmins;
