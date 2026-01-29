import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../../config';
import {
    Plus,
    Trash2,
    Edit2,
    CreditCard,
    Save,
    X,
    AlertTriangle,
    Eye
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';

const ManagePayments = () => {
    const { hasPermission } = usePermissions();
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
        <div className="space-y-8 animate-in fade-in duration-500 w-full">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payment Methods</h1>
                    <p className="text-gray-500 font-medium mt-1">Maaree qababka lacag bixinta iyo tilmaamahooda.</p>
                </div>
                {hasPermission('payments.create') && (
                    <button
                        onClick={() => {
                            setEditingMethod(null);
                            setFormData({ name: '', instruction: '', isActive: true, type: 'local', icon: 'CreditCard' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Method Cusub
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {methods.map((method) => (
                        <div key={method._id} className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-white shadow-md">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-black text-gray-900">{method.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${method.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                                                }`}>
                                                <div className={`w-1 h-1 rounded-full ${method.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                {method.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${method.type === 'online' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {method.type || 'local'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {hasPermission('payments.edit') && (
                                        <button
                                            onClick={() => handleEdit(method)}
                                            className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                    {hasPermission('payments.delete') && (
                                        <button
                                            onClick={() => handleDeleteClick(method)}
                                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-100 flex-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Instructions</span>
                                <p className="text-sm font-medium text-gray-600 leading-relaxed italic line-clamp-4">
                                    "{method.instruction}"
                                </p>
                            </div>
                        </div>
                    ))}
                    {methods.length === 0 && (
                        <div className="col-span-full bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 py-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-gray-900 font-bold">Ma jiraan methods lacag bixin</h3>
                            <p className="text-gray-400 text-sm mt-1">Ku dar method-kaaga ugu horeeya adigoo riixaya badhanka kore.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upsert Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg  rounded-[2.55rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
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
                                    <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
                                        Method Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="E.g. EVC Plus, Sahal, Premier Wallet"
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                                        required
                                    />
                                </div>

                                {/* Payment Instructions */}
                                <div className="w-full md:w-1/2 space-y-1.5">
                                    <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
                                        Payment Instructions
                                    </label>
                                    <textarea
                                        value={formData.instruction}
                                        onChange={(e) =>
                                            setFormData({ ...formData, instruction: e.target.value })
                                        }
                                        placeholder="Tilmaam sida ardaygu u soo dirayo lacagta"
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3 text-sm font-bold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 resize-none"
                                        required
                                    />
                                </div>
                            </div>


                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Payment Method Category</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'local' })}
                                        className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.type === 'local'
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm'
                                            : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        Local Payment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'online' })}
                                        className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.type === 'online'
                                            ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                                            : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        Online Payment
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-gray-700">Status-ka Method-ka</span>
                                    <span className="text-[10px] text-gray-400 font-bold">Active ama Inactive ka dhig</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-emerald-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
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
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                                <AlertTriangle size={32} className="text-red-500 animate-pulse" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-2">Ma hubtaa boss?</h3>
                            <p className="text-[13px] text-gray-500 font-medium">
                                Method-kan "{methodToDelete?.name}" mar haddii la tirtiro lama soo celin karo.
                            </p>
                        </div>
                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3.5 bg-white hover:bg-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-200"
                                disabled={isDeleting}
                            >
                                Jooji
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Trash2 size={14} />}
                                <span>Tirtir</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePayments;
