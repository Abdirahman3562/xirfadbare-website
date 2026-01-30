import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Layout, CheckCircle, XCircle, Search, MoreVertical, AlertTriangle, ShieldAlert, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { usePermissions } from '../../../hooks/usePermissions';

const ManageCertificates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();
    const { canAccess } = usePermissions();

    const canCreate = canAccess('certificates', 'create');
    const canEdit = canAccess('certificates', 'edit');
    const canDelete = canAccess('certificates', 'delete');
    const canStatus = canAccess('certificates', 'status');

    const getFullImageUrl = (path) => {
        if (!path) return 'https://placehold.co/842x595/png?text=No+Background';
        return path.startsWith('http') ? path : `http://localhost:5000${path}`;
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const res = await fetch('http://localhost:5000/api/certificates/templates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setTemplates(data);
            } else {
                setTemplates([]);
                toast.error(data.message || 'Failed to load templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            setTemplates([]);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!templateToDelete) return;
        setIsDeleting(true);

        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const res = await fetch(`http://localhost:5000/api/certificates/template/${templateToDelete._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Shahaadada si guul leh ayaa loo tirtiray');
                fetchTemplates();
                setIsDeleteModalOpen(false);
            } else {
                toast.error('Wuu fashilmay tirtirista shahaadada');
            }
        } catch (error) {
            toast.error('Khalad ayaa dhacay xilligii tirtirista');
        } finally {
            setIsDeleting(false);
            setTemplateToDelete(null);
        }
    };

    const handleDeleteClick = (template) => {
        setTemplateToDelete(template);
        setIsDeleteModalOpen(true);
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const res = await fetch(`http://localhost:5000/api/certificates/template/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                toast.success('Status updated');
                fetchTemplates();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredTemplates = Array.isArray(templates) ? templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50/50 dark:bg-slate-900 transition-colors duration-300 font-[Inter]">
            {!canAccess('certificates', 'view') && !loading ? (
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
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <Layout className="w-8 h-8 text-emerald-500" />
                                Certificate Templates
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                Manage and customize your official certificates
                            </p>
                        </div>
                        <button
                            onClick={() => canCreate && navigate('/admin/certificates/builder')}
                            disabled={!canCreate}
                            title={!canCreate ? "Ma haysatid oggolaanshaha inaad abuurto template" : ""}
                            className={`group flex items-center justify-center gap-3 px-8 py-4 text-white rounded-2xl font-black text-sm transition-all active:scale-95 overflow-hidden relative ${!canCreate ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed grayscale' : 'bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40'}`}
                        >
                            {!canCreate ? <Lock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            <span>Create Template</span>
                        </button>
                    </div>

                    {/* Filters / Search */}
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Raadi Shahaadooyinka..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white font-black text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Grid View */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-bold animate-pulse">Soo rarayaa...</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <Layout className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Wax template ah lama helin</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium px-4">
                                Ma jirto wax template ah oo la helay. Fadlan abuuro mid cusub si aad u bilowdo.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template._id}
                                    className="group bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500"
                                >
                                    {/* Preview Thumbnail */}
                                    <div className={`aspect-[1.414/1] bg-slate-100 dark:bg-slate-800 relative group-hover:scale-[1.02] transition-transform duration-700 overflow-hidden ${!canEdit ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                        onClick={() => canEdit && navigate(`/admin/certificates/builder?id=${template._id}`)}
                                        title={!canEdit ? "Ma haysatid oggolaanshaha inaad wax beddesho" : ""}>
                                        <div
                                            className="w-full h-full bg-cover bg-center transition-all duration-700"
                                            style={{ backgroundImage: `url(${getFullImageUrl(template.backgroundUrl)})` }}
                                        />
                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-all duration-500">
                                                {!canEdit ? <Lock className="w-6 h-6 text-slate-400" /> : <Edit2 className="w-6 h-6 text-emerald-600" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">{template.name}</h3>
                                                <p className="text-xs text-slate-500 mt-1 font-bold">
                                                    Created {new Date(template.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => canStatus && toggleStatus(template._id, template.isActive)}
                                                    disabled={!canStatus}
                                                    className={`p-3 rounded-xl transition-all ${!canStatus ? 'opacity-30 cursor-not-allowed' : template.isActive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-400 bg-slate-50 dark:bg-slate-800'}`}
                                                    title={!canStatus ? "Ma haysatid oggolaanshaha status-ka" : (template.isActive ? 'Deactivate' : 'Activate')}
                                                >
                                                    {!canStatus ? <Lock className="w-5 h-5" /> : (template.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />)}
                                                </button>
                                                <button
                                                    onClick={() => canDelete && handleDeleteClick(template)}
                                                    disabled={!canDelete}
                                                    className={`p-3 rounded-xl transition-all shadow-sm group/del ${!canDelete ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed opacity-50' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'}`}
                                                    title={!canDelete ? "Ma haysatid oggolaanshaha tirtirista" : "Delete"}
                                                >
                                                    {!canDelete ? <Lock className="w-5 h-5" /> : <Trash2 className="w-5 h-5 group-hover/del:animate-bounce" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black uppercase">
                                                            {i}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                    {template.layout?.length || 0} Elements
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => canEdit && navigate(`/admin/certificates/builder?id=${template._id}`)}
                                                disabled={!canEdit}
                                                className={`text-xs font-black flex items-center gap-2 group/btn ${!canEdit ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-600 hover:text-emerald-500'}`}
                                                title={!canEdit ? "Ma haysatid oggolaanshaha inaad wax beddesho" : ""}
                                            >
                                                Full Edit
                                                {!canEdit ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Premium Delete Confirmation Modal */}
                    {isDeleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
                                <div className="p-8 pb-0 text-center">
                                    <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                        <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ma hubtaa?</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium px-4">
                                        Ma hubtaa inaad rabto inaad tirtirto shahaadada <span className="text-rose-500 font-black italic">"{templateToDelete?.name}"</span>? Action-kaan dib looma soo celin karo.
                                    </p>
                                </div>

                                <div className="p-8 flex gap-4">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        disabled={isDeleting}
                                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-sm rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Maya, Jooji
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1 py-4 bg-rose-500 text-white font-black text-sm rounded-2xl hover:bg-rose-600 shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                Haa, Tirtir
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageCertificates;
