import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ShieldCheck,
    ArrowLeft,
    Check,
    Loader2,
    Save,
    LayoutDashboard,
    Users,
    GraduationCap,
    FileText,
    ShoppingCart,
    BookOpen,
    Newspaper,
    Mail,
    MessageSquare,
    Bot,
    Folder,
    MessageSquareQuote,
    MessageCircleQuestion,
    Settings,
    Shield,
    CreditCard
} from 'lucide-react';
import {
    getRoleById,
    createRole,
    updateRole
} from '../../../api/roleService.js';
import { toast } from 'react-toastify';

const RolePermissionEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const mode = id ? 'edit' : 'create';
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const token = user?.token;

    const [loading, setLoading] = useState(mode === 'edit');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });

    const MODULES = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, actions: ['view'] },
        { id: 'users', label: 'Manage Users', icon: <Users size={20} />, actions: ['view', 'create', 'edit', 'delete', 'status'] },
        { id: 'instructors', label: 'Instructors', icon: <GraduationCap size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'authors', label: 'Authors', icon: <FileText size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} />, actions: ['view', 'edit', 'delete', 'approve'] },
        { id: 'roles', label: 'Roles & Permissions', icon: <Shield size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'courses', label: 'Manage Courses', icon: <BookOpen size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'blogs', label: 'Manage Blogs', icon: <Newspaper size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'contacts', label: 'Manage Contacts', icon: <Mail size={20} />, actions: ['view', 'reply', 'delete'] },
        { id: 'chat', label: 'Live Chat', icon: <MessageSquare size={20} />, actions: ['view', 'manage'] },
        { id: 'bot', label: 'Bot Answers', icon: <Bot size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'categories', label: 'Categories', icon: <Folder size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'faqs', label: 'FAQs', icon: <MessageCircleQuestion size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'payments', label: 'Payment Methods', icon: <CreditCard size={20} />, actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'settings', label: 'System Settings', icon: <Settings size={20} />, actions: ['view', 'edit'] },
    ];

    useEffect(() => {
        if (mode === 'edit' && token) {
            const fetchRole = async () => {
                try {
                    const role = await getRoleById(id, token);
                    if (role) {
                        setFormData({
                            name: role.name || '',
                            description: role.description || '',
                            permissions: role.permissions || []
                        });
                    }
                } catch (error) {
                    toast.error("Wuu fashilmay soo aqrinta doorka");
                    navigate('/admin/roles');
                } finally {
                    setLoading(false);
                }
            };
            fetchRole();
        }
    }, [id, mode, token, navigate]);

    const handleTogglePermission = (permissionKey) => {
        setFormData(prev => {
            const permissions = prev.permissions.includes(permissionKey)
                ? prev.permissions.filter(p => p !== permissionKey)
                : [...prev.permissions, permissionKey];
            return { ...prev, permissions };
        });
    };

    const handleToggleModule = (moduleId, actions, checked) => {
        setFormData(prev => {
            let newPermissions = [...prev.permissions];
            actions.forEach(action => {
                const key = `${moduleId}.${action}`;
                if (checked && !newPermissions.includes(key)) {
                    newPermissions.push(key);
                } else if (!checked) {
                    newPermissions = newPermissions.filter(p => p !== key);
                }
            });
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Fadlan magac u bixi doorka");
            return;
        }

        setSubmitting(true);
        try {
            if (mode === 'create') {
                await createRole(formData, token);
                toast.success("Door cusub ayaa si guul leh loo abuuray!");
            } else {
                await updateRole(id, formData, token);
                toast.success("Xogta doorka waa la cusbooneysiiyay!");
            }
            navigate('/admin/roles');
        } catch (error) {
            toast.error(error.message || "Khalad ayaa dhacay");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium italic animate-pulse">Soo aqrinaya xogta doorka...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 font-[Inter]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link to="/admin/roles" className="p-4 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all group">
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {mode === 'create' ? 'Create New Role' : 'Edit Role permissions'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium italic">Configure granular access for this role.</p>
                    </div>
                </div>
                <button
                    form="role-form"
                    disabled={submitting}
                    className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span className="uppercase tracking-widest">{mode === 'create' ? 'Create Role' : 'Save Changes'}</span>
                </button>
            </div>

            <form id="role-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Card */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">General Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Content Manager"
                                className="w-full px-8 py-5 bg-gray-50 border border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700 shadow-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                            <input
                                type="text"
                                placeholder="Short summary of what this role does..."
                                className="w-full px-8 py-5 bg-gray-50 border border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700 shadow-sm"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Permissions Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Module Permissions</h2>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    const allPerms = [];
                                    MODULES.forEach(m => m.actions.forEach(a => allPerms.push(`${m.id}.${a}`)));
                                    setFormData(prev => ({ ...prev, permissions: allPerms }));
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Select All
                            </button>
                            <span className="text-gray-200">|</span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, permissions: [] }))}
                                className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MODULES.map((module) => {
                            const isModuleActive = module.actions.every(action =>
                                formData.permissions.includes(`${module.id}.${action}`)
                            );
                            const activeCount = module.actions.filter(action =>
                                formData.permissions.includes(`${module.id}.${action}`)
                            ).length;

                            return (
                                <div key={module.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 border-b-4 border-b-transparent hover:border-b-emerald-500">
                                    {/* Module Header */}
                                    <div className="p-6 bg-gray-50/50 flex items-center justify-between border-b border-gray-50 group-hover:bg-white transition-colors duration-500">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-500 group-hover:text-emerald-600 transition-colors">
                                                {module.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-tight">{module.label}</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                    {activeCount} / {module.actions.length} Active
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="peer h-6 w-6 appearance-none rounded-lg border-2 border-gray-200 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                                                checked={isModuleActive}
                                                onChange={(e) => handleToggleModule(module.id, module.actions, e.target.checked)}
                                            />
                                            <Check className="absolute left-1 top-1 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={16} strokeWidth={4} />
                                        </div>
                                    </div>

                                    {/* Action Chips */}
                                    <div className="p-6 flex flex-wrap gap-2">
                                        {module.actions.map(action => (
                                            <button
                                                key={action}
                                                type="button"
                                                onClick={() => handleTogglePermission(`${module.id}.${action}`)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.permissions.includes(`${module.id}.${action}`)
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50/50'
                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200 hover:text-emerald-500'
                                                    }`}
                                            >
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RolePermissionEditor;
