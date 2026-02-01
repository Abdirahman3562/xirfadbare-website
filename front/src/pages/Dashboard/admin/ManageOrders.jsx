import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../../config';
import { getImageUrl } from '../../../utils/format';
import {
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Search,
    Filter,
    Check,
    X,
    User,
    Trash2,
    Calendar,
    Phone,
    Mail,
    CreditCard,
    AlertTriangle,
    DollarSign,
    Package
} from 'lucide-react';
import PremiumLoader from '../../../components/ui/PremiumLoader';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('loggedInUser'));
            const res = await fetch(`${API_BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setOrders(data);
            } else {
                toast.error(data.message || 'Error fetching orders');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Server error while fetching orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        const action = status === 'active' ? 'approve' : 'reject';
        const actionText = status === 'active' ? 'lagu daray!' : 'laga saaray!';

        try {
            const user = JSON.parse(localStorage.getItem('loggedInUser'));
            const res = await fetch(`${API_BASE_URL}/orders/${id}/${action}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                toast.success(`Dalabka waa ${actionText}`);
                fetchOrders(); // Refresh list
                window.dispatchEvent(new Event('refreshNotifications'));
            } else {
                const data = await res.json();
                toast.error(data.message || 'Action failed');
            }
        } catch (error) {
            toast.error('Server error');
        }
    };

    const handleDelete = (id) => {
        setOrderToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!orderToDelete) return;

        try {
            setIsDeleting(true);
            const user = JSON.parse(localStorage.getItem('loggedInUser'));
            const res = await fetch(`${API_BASE_URL}/orders/${orderToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                toast.success('Dalabka waa la tirtiray!');
                setShowDeleteModal(false);
                setOrderToDelete(null);
                fetchOrders();
                window.dispatchEvent(new Event('refreshNotifications'));
            } else {
                const data = await res.json();
                toast.error(data.message || 'Delete failed');
            }
        } catch (error) {
            toast.error('Server error');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredOrders = orders
        .filter(order => order.paymentType !== 'Bundle Access')
        .filter(order => {
            const matchesSearch =
                order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.userDetails?.firstName + ' ' + order.userDetails?.lastName).toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterStatus === 'All' || order.status.toLowerCase() === filterStatus.toLowerCase();

            return matchesSearch && matchesFilter;
        });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden max-w-full">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-[Inter]">Order Invoices</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track and manage all student enrolment payments.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center transition-colors duration-300">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student name or Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-700/50 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:flex-none relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-9 pr-8 py-3 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-100 dark:border-gray-600 outline-none hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors text-sm appearance-none cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <PremiumLoader text="Dalabka waa la soo akhrinayaa..." />
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-gray-300 dark:text-gray-500" size={32} />
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-bold">Wax dalab ah lama helin</h3>
                    <p className="text-gray-400 text-sm mt-1">Isku day inaad wax kale raadiso ama bedesho filter-ka.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col">
                            {/* Card Header: Student & Status */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-shrink-0">
                                        {(order.userDetails?.image || order.user?.image) ? (
                                            <img
                                                src={getImageUrl(order.userDetails?.image || order.user?.image)}
                                                alt=""
                                                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black border-2 border-white shadow-md">
                                                {order.userDetails?.firstName?.[0] || order.user?.firstName?.[0]}{order.userDetails?.lastName?.[0] || order.user?.lastName?.[0]}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${order.status === 'active' ? 'bg-emerald-500' :
                                            order.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}>
                                            {order.status === 'active' ? <CheckCircle2 size={10} className="text-white" /> :
                                                order.status === 'pending' ? <Clock size={10} className="text-white" /> :
                                                    <XCircle size={10} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[15px] font-black text-gray-900 dark:text-white truncate tracking-tight">
                                            {order.userDetails?.firstName} {order.userDetails?.lastName}
                                        </h4>
                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">{order.userDetails?.email}</p>
                                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{order.phoneNumber}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${order.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm' :
                                    order.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 shadow-sm' :
                                        'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 shadow-sm'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'active' ? 'bg-emerald-500' :
                                        order.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                        }`} />
                                    {order.status === 'active' ? 'Approved' : order.status}
                                </div>
                            </div>

                            {/* Card Body: Course Info */}
                            <div className="bg-gray-50/80 dark:bg-slate-700/30 rounded-3xl p-4 border border-gray-100 dark:border-gray-700 mb-6 flex-1">
                                <div className="flex gap-4 items-center mb-4">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-white flex-shrink-0 bg-emerald-100 flex items-center justify-center">
                                        {order.isBundle ? (
                                            <Package size={24} className="text-emerald-600" />
                                        ) : (
                                            <img
                                                src={getImageUrl(order.courseDetails?.thumbnail)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-0.5">
                                            {order.isBundle ? 'Enrolled Bundle' : 'Enrolled Course'}
                                        </span>
                                        <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-1" title={order.courseTitle || (order.isBundle ? 'Package Bundle' : 'Course')}>
                                            {order.courseTitle || (order.isBundle ? 'Package Bundle' : 'Unknown')}
                                        </h5>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/50 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Payment via</span>
                                        <p className="text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">{order.paymentMethod}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Purchase Date</span>
                                        <p className="text-[11px] font-black text-gray-700 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer: Price & Actions */}
                            <div className="flex items-center justify-between gap-4 pt-2">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Total Amount</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">${order.finalPrice?.toFixed(2)}</span>
                                        {order.discountApplied > 0 && (
                                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">-${order.discountApplied}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 bg-gray-50/80 dark:bg-slate-700/50 p-1.5 rounded-2xl border border-gray-100/80 dark:border-gray-600/50 shadow-sm backdrop-blur-sm">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-600 rounded-xl transition-all active:scale-90"
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(order._id, 'active')}
                                        disabled={order.status === 'active'}
                                        className={`p-2.5 rounded-xl transition-all active:scale-90 ${order.status === 'active'
                                            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 cursor-default'
                                            : 'text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-600'
                                            }`}
                                        title="Approve"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(order._id, 'rejected')}
                                        disabled={order.status === 'rejected'}
                                        className={`p-2.5 rounded-xl transition-all active:scale-90 ${order.status === 'rejected'
                                            ? 'text-red-500 bg-red-50 dark:bg-red-500/10 cursor-default'
                                            : 'text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-600'
                                            }`}
                                        title="Reject"
                                    >
                                        <X size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order._id)}
                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-600 rounded-xl transition-all active:scale-90"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
                        {/* Modal Header */}
                        <div className="relative h-32 bg-emerald-600 p-6 flex items-end justify-between overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
                            <div className="relative z-10">
                                <span className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Transaction Details</span>
                                <h2 className="text-3xl font-black text-white">Order Receipt</h2>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="relative z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/20 active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Student & Course Quick View */}
                            <div className="flex gap-6 items-start">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                                        <img
                                            src={getImageUrl(selectedOrder.courseDetails?.thumbnail)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-800 overflow-hidden shadow-lg bg-white dark:bg-slate-800">
                                        {(selectedOrder.userDetails?.image || selectedOrder.user?.image) ? (
                                            <img src={getImageUrl(selectedOrder.userDetails?.image || selectedOrder.user?.image)} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                                                {selectedOrder.userDetails?.firstName?.[0] || selectedOrder.user?.firstName?.[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white line-clamp-1">{selectedOrder.courseDetails?.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Student: <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedOrder.userDetails?.firstName} {selectedOrder.userDetails?.lastName}</span></p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedOrder.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' :
                                            selectedOrder.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20' :
                                                'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20'
                                            }`}>
                                            {selectedOrder.status}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold border-l pl-3 border-gray-100 dark:border-gray-700 flex items-center gap-1">
                                            <Calendar size={12} /> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Student Info Card */}
                                <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={12} /> Student Contact
                                    </h4>
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                                <Mail size={14} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] text-gray-400 font-bold">Email Address</p>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{selectedOrder.userDetails?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                                <Phone size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold">Phone Number</p>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{selectedOrder.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Info Card */}
                                <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard size={12} /> Payment Meta
                                    </h4>
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                                <DollarSign size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold">Total Amount</p>
                                                <p className="text-xs font-black text-gray-800 dark:text-gray-200">${selectedOrder.finalPrice?.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                                <CreditCard size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold">Method</p>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 capitalize">{selectedOrder.paymentMethod}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Included Courses for Bundle */}
                            {selectedOrder.isBundle && selectedOrder.bundleCourses && selectedOrder.bundleCourses.length > 0 && (
                                <div className="p-5 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 space-y-4">
                                    <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                        <Package size={12} /> Included Courses in Bundle
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedOrder.bundleCourses.map((c, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10 transition-transform hover:scale-[1.02]">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-emerald-100 dark:border-slate-700 shadow-sm">
                                                    <img src={getImageUrl(c.thumbnail)} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">{c.title}</p>
                                                    <p className="text-[9px] text-emerald-500/70 font-black uppercase tracking-widest">{c.level}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bottom Row: Payment Proof & Order Summary Side-by-Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {/* Payment Proof Section */}
                                <div className={`p-5 rounded-3xl border-2 border-dashed flex flex-col justify-center min-h-[160px] ${selectedOrder.paymentProof ? 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-500/30' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-gray-700'}`}>
                                    <h4 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-3 ${selectedOrder.paymentProof ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                                        <Eye size={12} /> Payment Proof
                                    </h4>
                                    {selectedOrder.paymentProof ? (
                                        <div className="relative group rounded-2xl overflow-hidden shadow-sm aspect-video bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700">
                                            <img
                                                src={`${API_BASE_URL.replace('/api', '')}${selectedOrder.paymentProof}`}
                                                alt="Proof of Payment"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <a
                                                href={`${API_BASE_URL.replace('/api', '')}${selectedOrder.paymentProof}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                            >
                                                <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Eye size={12} /> View Full
                                                </span>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2">
                                            <CreditCard size={24} strokeWidth={1} />
                                            <p className="text-[9px] font-bold uppercase tracking-widest">No Proof Uploaded</p>
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary Overlay (Purchase Reference) */}
                                <div className="p-6 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100/50 dark:border-emerald-500/10 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Refrence</span>
                                            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase">#{selectedOrder._id.slice(-8)}</span>
                                        </div>
                                        <div className="pt-4 border-t border-emerald-100 dark:border-emerald-500/20">
                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Enrollment</span>
                                            <p className="text-xs font-black text-gray-900 dark:text-white mt-1">
                                                {selectedOrder.status === 'active' ? 'Access Granted' :
                                                    selectedOrder.status === 'pending' ? 'Awaiting Confirmation' : 'Access Revoked'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-4 mt-auto">
                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Transaction Time</span>
                                        <p className="text-xs font-black text-gray-900 dark:text-white mt-0.5">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-gray-200 dark:border-slate-600 active:scale-95"
                            >
                                Close View
                            </button>
                            {(selectedOrder.status === 'pending' || selectedOrder.status === 'rejected') && (
                                <button
                                    onClick={() => {
                                        handleStatusUpdate(selectedOrder._id, 'active');
                                        setSelectedOrder(null);
                                    }}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95"
                                >
                                    Confirm Enrollment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-500/20 shadow-inner">
                                <AlertTriangle size={40} className="text-red-500 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 font-[Inter]">Ma hubtaa boss?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Dalabkan mar haddii la tirtiro dib looma soo celin karo. Ma huba inaad tirtirto dalabkan?
                            </p>
                        </div>
                        <div className="p-8 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setOrderToDelete(null);
                                }}
                                className="flex-1 py-4 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-200 dark:border-slate-600 active:scale-95"
                                disabled={isDeleting}
                            >
                                Iska daa
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 dark:shadow-none active:scale-95 flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Waa la tirtirayaa...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        <span>Hubaal tirtir</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
