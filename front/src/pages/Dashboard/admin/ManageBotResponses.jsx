import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Search, Edit2, Trash2, Save, X, MessageSquare, Bot, Lock, ShieldAlert } from "lucide-react";
import { usePermissions } from "../../../hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import PremiumLoader from "../../../components/ui/PremiumLoader";

export default function ManageBotResponses() {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { canAccess } = usePermissions();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Form State
    const [currentItem, setCurrentItem] = useState({
        id: "",
        trigger: "",
        response: "",
        matchType: "contains"
    });

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const token = loggedInUser.token;

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/api/bot-responses");
            setResponses(data);
        } catch (error) {
            console.error("Failed to fetch bot responses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Unauthorized");

        try {
            if (isEditing) {
                // Update
                const { data } = await axios.put(
                    `http://localhost:5000/api/bot-responses/${currentItem.id}`,
                    {
                        trigger: currentItem.trigger,
                        response: currentItem.response,
                        matchType: currentItem.matchType
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setResponses(responses.map(item => (item._id === data._id ? data : item)));
                toast.success("Response updated successfully");
            } else {
                // Create
                const { data } = await axios.post(
                    "http://localhost:5000/api/bot-responses",
                    {
                        trigger: currentItem.trigger,
                        response: currentItem.response,
                        matchType: currentItem.matchType
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setResponses([data, ...responses]);
                toast.success("Response added successfully");
            }
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`http://localhost:5000/api/bot-responses/${itemToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setResponses(responses.filter((item) => item._id !== itemToDelete));
            toast.success("Response deleted");
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            toast.error("Failed to delete response");
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setIsEditing(true);
            setCurrentItem({
                id: item._id,
                trigger: item.trigger,
                response: item.response,
                matchType: item.matchType
            });
        } else {
            setIsEditing(false);
            setCurrentItem({ id: "", trigger: "", response: "", matchType: "contains" });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
    };

    const filteredResponses = responses.filter(
        (item) =>
            item?.trigger?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.response?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <PremiumLoader text="Loading Bot Responses..." />;
    }

    return (
        <div className="p-8 animate-in fade-in duration-500 font-[Inter] mb-20">
            {!canAccess('bot', 'view') && !loading ? (
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
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                <Bot size={32} className="text-emerald-600 dark:text-emerald-400" />
                                Bot Answer Management
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Teach the assistant how to answer user questions automatically.</p>
                        </div>
                        <button
                            onClick={() => canAccess('bot', 'create') && openModal()}
                            disabled={!canAccess('bot', 'create')}
                            title={!canAccess('bot', 'create') ? "Ma haysatid oggolaanshaha" : ""}
                            className={`flex items-center gap-2 dark:shadow-none cursor-pointer px-6 py-3 rounded-xl transition font-bold text-sm active:scale-95 ${!canAccess('bot', 'create') ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed opacity-60' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'}`}
                        >
                            {!canAccess('bot', 'create') ? <Lock size={18} /> : <Plus size={18} />} Add New Answer
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search triggers or responses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>

                    {/* List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full text-center py-20 text-gray-400 dark:text-gray-500">Loading responses...</div>
                        ) : filteredResponses.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <Bot size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <p>No responses found. Add one to get started!</p>
                            </div>
                        ) : (
                            filteredResponses.map((item) => (
                                <div key={item._id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-bl-2xl">
                                        <button
                                            onClick={() => canAccess('bot', 'edit') && openModal(item)}
                                            disabled={!canAccess('bot', 'edit')}
                                            title={!canAccess('bot', 'edit') ? "Ma haysatid oggolaanshaha" : "Edit"}
                                            className={`p-2 rounded-lg ${!canAccess('bot', 'edit') ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
                                        >
                                            {!canAccess('bot', 'edit') ? <Lock size={16} /> : <Edit2 size={16} />}
                                        </button>
                                        <button
                                            onClick={() => canAccess('bot', 'delete') && handleDelete(item._id)}
                                            disabled={!canAccess('bot', 'delete')}
                                            title={!canAccess('bot', 'delete') ? "Ma haysatid oggolaanshaha" : "Delete"}
                                            className={`p-2 rounded-lg ${!canAccess('bot', 'delete') ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'}`}
                                        >
                                            {!canAccess('bot', 'delete') ? <Lock size={16} /> : <Trash2 size={16} />}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                        <MessageSquare size={12} />
                                        Trigger ({item.matchType})
                                    </div>

                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3">"{item.trigger}"</h3>

                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl text-sm text-gray-600 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-700/50">
                                        {item.response}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                                <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><X size={24} /></button>

                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                                    {isEditing ? "Edit Response" : "New Auto-Response"}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Define what users say and how the bot replies.</p>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">If user says...</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentItem.trigger}
                                            onChange={(e) => setCurrentItem({ ...currentItem, trigger: e.target.value })}
                                            placeholder="e.g. 'price', 'hello', 'contact'"
                                            className="w-full p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Match Type</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="matchType"
                                                    value="contains"
                                                    checked={currentItem.matchType === "contains"}
                                                    onChange={(e) => setCurrentItem({ ...currentItem, matchType: e.target.value })}
                                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contains Keyword</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="matchType"
                                                    value="exact"
                                                    checked={currentItem.matchType === "exact"}
                                                    onChange={(e) => setCurrentItem({ ...currentItem, matchType: e.target.value })}
                                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exact Match</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Bot replies with...</label>
                                        <textarea
                                            required
                                            rows="4"
                                            value={currentItem.response}
                                            onChange={(e) => setCurrentItem({ ...currentItem, response: e.target.value })}
                                            placeholder="The answer the bot will give..."
                                            className="w-full p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full dark:shadow-none cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} />
                                        Save Response
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {isDeleteModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-center border border-gray-100 dark:border-gray-700">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-500/30">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Response?</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    Are you sure you want to delete this response trigger? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 py-3 px-4 cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-3 dark:shadow-none cursor-pointer px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95"
                                    >
                                        Yes, Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
