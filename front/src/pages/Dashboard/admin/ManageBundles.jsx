import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Package,
    Edit,
    Trash2,
    Eye,
    Loader2,
    BookOpen,
    ShieldAlert,
    Lock
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import PremiumLoader from '../../../components/ui/PremiumLoader';
import { getAllBundles, deleteBundle } from '../../../api/bundleService';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../../utils/format';
import AdminBundleViewModal from '../../../components/Admin/AdminBundleViewModal';

const ManageBundles = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bundleToDelete, setBundleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedBundle, setSelectedBundle] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const { canAccess } = usePermissions();

    useEffect(() => {
        fetchBundles();
    }, []);

    const fetchBundles = async () => {
        try {
            setLoading(true);
            const data = await getAllBundles();
            setBundles(data);
        } catch (error) {
            toast.error("Wuu fashilmay soo aqrinta bundles-ka");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setBundleToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!bundleToDelete) return;
        try {
            setIsDeleting(true);
            await deleteBundle(bundleToDelete);
            toast.success("Bundle-ka waa la tirtiray!");
            setShowDeleteModal(false);
            setBundleToDelete(null);
            fetchBundles();
        } catch (error) {
            toast.error("Wuu fashilmay tirtirista bundle-ka");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredBundles = bundles.filter(bundle =>
        bundle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <PremiumLoader text="Soo aqrinaya bundles..." />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-[Inter] mb-20">
            {!canAccess('bundles', 'view') && !loading ? (
                <div className="max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-rose-100 dark:border-rose-900/30">
                    <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-12 h-12 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Access Denied</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-lg leading-relaxed italic">
                        Ma haysatid oggolaanshaha aad ku aragto boggan.
                    </p>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Course Bundles</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Create packages of multiple courses for a single price.</p>
                        </div>
                        <button
                            onClick={() => canAccess('bundles', 'create') && navigate('/admin/bundles/create')}
                            disabled={!canAccess('bundles', 'create')}
                            className={`flex items-center cursor-pointer gap-3 px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl active:scale-95 ${!canAccess('bundles', 'create') ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-60' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'}`}
                        >
                            {!canAccess('bundles', 'create') ? <Lock size={20} /> : <Plus size={20} strokeWidth={3} />}
                            <span className="uppercase tracking-widest cursor-pointer">Create Bundle</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative group w-full max-w-2xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search bundles..."
                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredBundles.length > 0 ? (
                            filteredBundles.map((bundle) => (
                                <div key={bundle._id} className="group bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={getImageUrl(bundle.thumbnail)}
                                            alt={bundle.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" }}
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={() => canAccess('bundles', 'edit') && navigate(`/admin/bundles/edit/${bundle._id}`)}
                                                disabled={!canAccess('bundles', 'edit')}
                                                className={`p-3 backdrop-blur-md rounded-2xl shadow-xl transition-all ${!canAccess('bundles', 'edit') ? 'text-gray-300 bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed opacity-60' : 'bg-white/90 text-gray-700 hover:bg-emerald-600 hover:text-white'}`}
                                            >
                                                {!canAccess('bundles', 'edit') ? <Lock size={18} /> : <Edit size={18} />}
                                            </button>
                                            <button
                                                onClick={() => { setSelectedBundle(bundle); setShowViewModal(true); }}
                                                className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-gray-700 hover:bg-emerald-600 hover:text-white transition-all"
                                                title="View Courses"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => canAccess('bundles', 'delete') && handleDelete(bundle._id)}
                                                disabled={!canAccess('bundles', 'delete')}
                                                className={`p-3 backdrop-blur-md rounded-2xl shadow-xl transition-all ${!canAccess('bundles', 'delete') ? 'text-gray-300 bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed opacity-60' : 'bg-white/90 text-red-500 hover:bg-red-600 hover:text-white'}`}
                                            >
                                                {!canAccess('bundles', 'delete') ? <Lock size={18} /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{bundle.title}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mt-1">{bundle.description}</p>
                                        </div>

                                        <div className="flex items-center gap-3 py-3 border-y border-gray-50 dark:border-gray-700/50">
                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                                <BookOpen className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{bundle.courses?.length || 0} Courses</span>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Included in Package</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="text-2xl font-black text-emerald-600">
                                                <span className="text-sm align-top mr-0.5">$</span>
                                                {bundle.price}
                                            </div>
                                            {!bundle.isActive && (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full">Inactive</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 bg-white dark:bg-slate-800 rounded-[3rem] text-center border-2 border-dashed border-gray-100 px-6">
                                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No bundles found</h3>
                                <p className="text-gray-500 dark:text-gray-400">Start by creating your first course bundle.</p>
                            </div>
                        )}
                    </div>

                    {/* Delete Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
                                <div className="p-10 text-center">
                                    <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                                        <Trash2 size={40} className="text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Are you sure?</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">This bundle grouping will be deleted.</p>
                                </div>
                                <div className="p-8 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-gray-700 flex gap-4">
                                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-200" disabled={isDeleting}>Cancel</button>
                                    <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2" disabled={isDeleting}>
                                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={14} />}
                                        <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View Bundle Modal */}
                    <AdminBundleViewModal
                        isOpen={showViewModal}
                        onClose={() => setShowViewModal(false)}
                        bundle={selectedBundle}
                    />
                </>
            )}
        </div>
    );
};

export default ManageBundles;
