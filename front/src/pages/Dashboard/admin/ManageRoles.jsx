import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    Edit3,
    X,
    Check,
    Loader2,
    Lock
} from 'lucide-react';
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole
} from '../../../api/roleService.js';
import { toast } from 'react-toastify';

const ManageRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const token = user?.token;

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedRole, setSelectedRole] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getRoles(token);
            setRoles(data);
        } catch (error) {
            toast.error("Wuu fashilmay soo aqrinta doorka");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        } else {
            toast.error("Fadlan soo gal marka hore");
            setLoading(false);
        }
    }, [token]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            permissions: []
        });
        setSelectedRole(null);
    };

    const handleOpenModal = (mode, roleData = null) => {
        setModalMode(mode);
        if (mode === 'edit' && roleData) {
            setSelectedRole(roleData);
            setFormData({
                name: roleData.name || '',
                description: roleData.description || '',
                permissions: roleData.permissions || []
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
                const res = await createRole(formData, token);
                if (res) {
                    toast.success("Door cusub ayaa lagu daray!");
                    fetchData();
                    setShowModal(false);
                }
            } else {
                const res = await updateRole(selectedRole._id, formData, token);
                if (res) {
                    toast.success("Xogta doorka waa la cusbooneysiiyay!");
                    fetchData();
                    setShowModal(false);
                }
            }
        } catch (error) {
            toast.error(error.message || "Khalad ayaa dhacay. Fadlan isku day markale.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const success = await deleteRole(selectedRole._id, token);
            if (success) {
                toast.success("Doorka waa la tirtiray!");
                fetchData();
                setShowDeleteModal(false);
            }
        } catch (error) {
            toast.error("Wuu fashilmay tirtirista doorka.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRoles = roles.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-[Inter]">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Roles Management</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Create and manage system roles used for user permissions.</p>
                </div>
                <button
                    onClick={() => handleOpenModal('create')}
                    className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl shadow-emerald-200 active:scale-95"
                >
                    <Plus size={20} />
                    <span className="uppercase tracking-widest">Add New Role</span>
                </button>
            </div>

            {/* toolbar Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search roles by name or description..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium italic">Soo aqrinaya xogta...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRoles.length > 0 ? (
                        filteredRoles.map((roleItem) => (
                            <div key={roleItem._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 group relative overflow-hidden flex flex-col h-full border-b-4 border-b-transparent hover:border-b-emerald-500">
                                <div className="relative flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:rotate-6 transition-transform duration-500">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal('edit', roleItem)}
                                            className="p-3 text-gray-400 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-2xl transition-all"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedRole(roleItem); setShowDeleteModal(true); }}
                                            className="p-3 text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                                        {roleItem.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-3">
                                        {roleItem.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Created</span>
                                    <p className="text-[10px] text-gray-400 font-bold italic opacity-60">
                                        {new Date(roleItem.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm text-center flex flex-col items-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                <ShieldCheck size={40} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">No roles found</p>
                                <p className="text-gray-500 font-medium">Try adding a new system role.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                {modalMode === 'create' ? 'Add New Role' : 'Edit Role'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-3 text-gray-400 hover:text-gray-900 hover:bg-white rounded-2xl transition-all shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Name</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                            placeholder="e.g. Moderator"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        rows="4"
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700 resize-none"
                                        placeholder="Describe what this role can do..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
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
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                    <span>{modalMode === 'create' ? 'Create Role' : 'Save Changes'}</span>
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
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Are you sure?</h3>
                        <p className="text-gray-500 font-medium mb-10">
                            You are about to delete <span className="font-bold text-gray-900">{selectedRole?.name}</span>. This may affect users assigned to this role.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
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
        </div>
    );
};

export default ManageRoles;
