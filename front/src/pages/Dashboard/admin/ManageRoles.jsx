import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    Edit3,
    X,
    Check,
    Loader2,
    Lock,
    ShieldAlert
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import {
    getRoles,
    deleteRole
} from '../../../api/roleService.js';
import { toast } from 'react-toastify';
import PremiumLoader from '../../../components/ui/PremiumLoader';

const ManageRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const token = user?.token;
    const navigate = useNavigate();
    const { canAccess } = usePermissions();

    // Modal states
    const [selectedRole, setSelectedRole] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            {!canAccess('roles', 'view') && !loading ? (
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
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Roles Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Create and manage system roles used for user permissions.</p>
                        </div>
                        <button
                            onClick={() => canAccess('roles', 'create') && navigate('/admin/roles/create')}
                            disabled={!canAccess('roles', 'create')}
                            title={!canAccess('roles', 'create') ? "Ma haysatid oggolaanshaha inaad abuurto door" : ""}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl active:scale-95 ${!canAccess('roles', 'create') ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-60' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'}`}
                        >
                            {!canAccess('roles', 'create') ? <Lock size={20} /> : <Plus size={20} />}
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
                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <PremiumLoader text="Soo aqrinaya xogta..." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredRoles.length > 0 ? (
                                filteredRoles.map((roleItem) => (
                                    <div key={roleItem._id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 dark:hover:shadow-black/30 transition-all duration-500 group relative overflow-hidden flex flex-col h-full border-b-4 border-b-transparent hover:border-b-emerald-500">
                                        <div className="relative flex items-start justify-between mb-8">
                                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:rotate-6 transition-transform duration-500">
                                                <ShieldCheck size={32} />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => canAccess('roles', 'edit') && navigate(`/admin/roles/edit/${roleItem._id}`)}
                                                    disabled={!canAccess('roles', 'edit')}
                                                    className={`p-3 rounded-2xl transition-all ${!canAccess('roles', 'edit') ? 'text-gray-300 bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed opacity-60' : 'text-gray-400 hover:text-emerald-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                    title={!canAccess('roles', 'edit') ? "Ma haysatid oggolaanshaha wax beddelista" : "Edit"}
                                                >
                                                    {!canAccess('roles', 'edit') ? <Lock size={18} /> : <Edit3 size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => { if (canAccess('roles', 'delete')) { setSelectedRole(roleItem); setShowDeleteModal(true); } }}
                                                    disabled={!canAccess('roles', 'delete')}
                                                    className={`p-3 rounded-2xl transition-all ${!canAccess('roles', 'delete') ? 'text-gray-300 bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed opacity-60' : 'text-gray-400 hover:text-rose-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-rose-50 dark:hover:bg-rose-500/10'}`}
                                                    title={!canAccess('roles', 'delete') ? "Ma haysatid oggolaanshaha tirtirista" : "Delete"}
                                                >
                                                    {!canAccess('roles', 'delete') ? <Lock size={18} /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                                                {roleItem.name}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed line-clamp-3">
                                                {roleItem.description || 'No description provided.'}
                                            </p>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between mt-auto">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Access</span>
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm shadow-emerald-50 dark:shadow-none">
                                                    <ShieldCheck size={12} strokeWidth={3} />
                                                    <span className="text-[10px] font-black uppercase tracking-tight">{roleItem.permissions?.length || 0} Permissions</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Created</span>
                                                <p className="text-[10px] text-gray-400 font-bold italic opacity-60">
                                                    {new Date(roleItem.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm text-center flex flex-col items-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-500">
                                        <ShieldCheck size={40} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">No roles found</p>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">Try adding a new system role.</p>
                                    </div>
                                </div>
                            )}
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
                                    You are about to delete <span className="font-bold text-gray-900 dark:text-white">{selectedRole?.name}</span>. This may affect users assigned to this role.
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
                                        className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
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

export default ManageRoles;
