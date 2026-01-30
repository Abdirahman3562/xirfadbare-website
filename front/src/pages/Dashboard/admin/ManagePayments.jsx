import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PremiumLoader from '../../../components/ui/PremiumLoader';
import { API_BASE_URL } from '../../../config';
import {
    Plus,
    Trash2,
    Edit2,
    CreditCard,
    Save,
    X,
    AlertTriangle,
    Eye,
    Lock,
    ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../hooks/usePermissions';

const ManagePayments = () => {
    const { canAccess } = usePermissions();
    const navigate = useNavigate();
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [methodToDelete, setMethodToDelete] = useState(null);
    const [editingMethod, setEditingMethod] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        instruction: '',
        isActive: true,
        type: 'local',
        icon: 'CreditCard'
    });

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('loggedInUser'));
            const res = await fetch(`${API_BASE_URL}/payment-methods/admin`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setMethods(data);
            }
        } catch (error) {
            toast.error('Galdinta xogta waa lagu guuldareystay');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const method = editingMethod ? 'PUT' : 'POST';
        const url = editingMethod
            ? `${API_BASE_URL}/payment-methods/${editingMethod._id}`
            : `${API_BASE_URL}/payment-methods`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingMethod ? 'Waa la cusboonaysiiyay!' : 'Waa la guulaystay!');
                setIsModalOpen(false);
                setEditingMethod(null);
                setFormData({ name: '', instruction: '', isActive: true, type: 'local', icon: 'CreditCard' });
                fetchMethods();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Error occurred');
            }
        } catch (error) {
            toast.error('Server error');
        }
    };

    const handleEdit = (method) => {
        setEditingMethod(method);
        setFormData({
            name: method.name,
            instruction: method.instruction,
            isActive: method.isActive,
            type: method.type || 'local',
            icon: method.icon || 'CreditCard'
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (method) => {
        setMethodToDelete(method);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!methodToDelete) return;
        setIsDeleting(true);
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        try {
            const res = await fetch(`${API_BASE_URL}/payment-methods/${methodToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                toast.success('Waa la tirtiray!');
                setShowDeleteModal(false);
                setMethodToDelete(null);
                fetchMethods();
            } else {
                toast.error('Deletion failed');
            }
        } catch (error) {
            toast.error('Server error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full font-[Inter]">
            {!canAccess('payments', 'view') && !loading ? (
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
                        className="mt-10 px-12 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl font-[Inter]"
                    >
                        Ku laabo Dashboard
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Payment Methods</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Maaree qababka lacag bixinta iyo tilmaamahooda.</p>
                        </div>
                        <button
                            onClick={() => {
                                if (!canAccess('payments', 'create')) return;
                                setEditingMethod(null);
                                setFormData({ name: '', instruction: '', isActive: true, type: 'local', icon: 'CreditCard' });
                                setIsModalOpen(true);
                            }}
                            disabled={!canAccess('payments', 'create')}
                            title={!canAccess('payments', 'create') ? "Ma haysatid oggolaanshaha inaad darto method lacag bixin" : ""}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer ${!canAccess('payments', 'create') ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed opacity-60' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none'}`}
                        >
                            {!canAccess('payments', 'create') ? <Lock size={16} /> : <Plus size={16} />}
                            Method Cusub
                        </button>
                    </div>

                    {loading ? (
                        <PremiumLoader />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {methods.map((method) => (
                                <div key={method._id} className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl dark:hover:shadow-none dark:hover:bg-slate-700/50 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border-2 border-white dark:border-gray-600 shadow-md dark:shadow-none">
                                                <CreditCard size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-[15px] font-black text-gray-900 dark:text-white">{method.name}</h3>
                                                <div className="flex gap-2 mt-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${method.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : 'bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-600'
                                                        }`}>
                                                        <div className={`w-1 h-1 rounded-full ${method.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                        {method.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${method.type === 'online' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'
                                                        }`}>
                                                        {method.type || 'local'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => canAccess('payments', 'edit') && handleEdit(method)}
                                                disabled={!canAccess('payments', 'edit')}
                                                title={!canAccess('payments', 'edit') ? "Ma haysatid oggolaanshaha wax beddelista" : "Edit"}
                                                className={`p-2.5 rounded-xl transition-all ${!canAccess('payments', 'edit') ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                            >
                                                {!canAccess('payments', 'edit') ? <Lock size={16} /> : <Edit2 size={16} />}
                                            </button>
                                            <button
                                                onClick={() => canAccess('payments', 'delete') && handleDeleteClick(method)}
                                                disabled={!canAccess('payments', 'delete')}
                                                title={!canAccess('payments', 'delete') ? "Ma haysatid oggolaanshaha tirtirista" : "Delete"}
                                                className={`p-2.5 rounded-xl transition-all ${!canAccess('payments', 'delete') ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                            >
                                                {!canAccess('payments', 'delete') ? <Lock size={16} /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/80 dark:bg-slate-700/30 rounded-3xl p-5 border border-gray-100 dark:border-gray-600 flex-1">
                                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Instructions</span>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic line-clamp-4">
                                            "{method.instruction}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {methods.length === 0 && (
                                <div className="col-span-full bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700 py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="text-gray-300 dark:text-gray-500" size={32} />
                                    </div>
                                    <h3 className="text-gray-900 dark:text-white font-bold">Ma jiraan methods lacag bixin</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Ku dar method-kaaga ugu horeeya adigoo riixaya badhanka kore.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upsert Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white dark:bg-slate-800 w-full max-w-lg  rounded-[2.55rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-700">
                                <div className="relative h-32 bg-emerald-600 p-8 flex items-end justify-between overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-26 bg-emerald-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
                                    <div className="relative z-10">
                                        <span className="text-emerald-100 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 block">Payment Gateway</span>
                                        <h2 className="text-2xl font-black text-white">{editingMethod ? 'Edit Method' : 'Method Cusub'}</h2>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="relative z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Method Name */}
                                        <div className="w-full md:w-1/2 space-y-1.5">
                                            <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                Method Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                placeholder="E.g. EVC Plus, Sahal, Premier Wallet"
                                                className="w-full rounded-2xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 px-5 py-3.5 text-sm font-bold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                required
                                            />
                                        </div>

                                        {/* Payment Instructions */}
                                        <div className="w-full md:w-1/2 space-y-1.5">
                                            <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                Payment Instructions
                                            </label>
                                            <textarea
                                                value={formData.instruction}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, instruction: e.target.value })
                                                }
                                                placeholder="Tilmaam sida ardaygu u soo dirayo lacagta"
                                                className="w-full rounded-2xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 px-5 py-3 text-sm font-bold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                required
                                            />
                                        </div>
                                    </div>


                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Payment Method Category</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'local' })}
                                                className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer ${formData.type === 'local'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                    : 'bg-white dark:bg-slate-700 border-gray-100 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                Local Payment
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'online' })}
                                                className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer ${formData.type === 'online'
                                                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'bg-white dark:bg-slate-700 border-gray-100 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                Online Payment
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl border border-gray-100 dark:border-gray-600">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-gray-700 dark:text-gray-200">Status-ka Method-ka</span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">Active ama Inactive ka dhig</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${formData.isActive ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-500'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-4 cursor-pointer bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Save size={14} />
                                            {editingMethod ? 'Update' : 'Save Method'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-700">
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-500/30">
                                        <AlertTriangle size={32} className="text-red-500 dark:text-red-400 animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Ma hubtaa boss?</h3>
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                                        Method-kan "{methodToDelete?.name}" mar haddii la tirtiro lama soo celin karo.
                                    </p>
                                </div>
                                <div className="p-8 bg-gray-50/50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-3.5 cursor-pointer bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-gray-600"
                                        disabled={isDeleting}
                                    >
                                        Jooji
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-3.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 dark:shadow-none flex items-center justify-center gap-2"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Trash2 size={14} />}
                                        <span>Tirtir</span>
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

export default ManagePayments;
