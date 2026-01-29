import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Search, Edit2, Trash2, Save, X, MessageSquare, Bot } from "lucide-react";

export default function ManageBotResponses() {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
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

    return (
        <div className="p-8 animate-in fade-in duration-500 font-[Inter] mb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Bot size={32} className="text-emerald-600" />
                        Bot Answer Management
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">Teach the assistant how to answer user questions automatically.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 font-bold text-sm active:scale-95"
                >
                    <Plus size={18} /> Add New Answer
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
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-gray-400">Loading responses...</div>
                ) : filteredResponses.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <Bot size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No responses found. Add one to get started!</p>
                    </div>
                ) : (
                    filteredResponses.map((item) => (
                        <div key={item._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/80 backdrop-blur-sm rounded-bl-2xl">
                                <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>

                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                <MessageSquare size={12} />
                                Trigger ({item.matchType})
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg mb-3">"{item.trigger}"</h3>

                            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100">
                                {item.response}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>

                        <h2 className="text-2xl font-black text-gray-900 mb-1">
                            {isEditing ? "Edit Response" : "New Auto-Response"}
                        </h2>
                        <p className="text-sm text-gray-500 mb-8">Define what users say and how the bot replies.</p>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">If user says...</label>
                                <input
                                    type="text"
                                    required
                                    value={currentItem.trigger}
                                    onChange={(e) => setCurrentItem({ ...currentItem, trigger: e.target.value })}
                                    placeholder="e.g. 'price', 'hello', 'contact'"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Match Type</label>
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
                                        <span className="text-sm font-medium text-gray-700">Contains Keyword</span>
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
                                        <span className="text-sm font-medium text-gray-700">Exact Match</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Bot replies with...</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={currentItem.response}
                                    onChange={(e) => setCurrentItem({ ...currentItem, response: e.target.value })}
                                    placeholder="The answer the bot will give..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Delete Response?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Are you sure you want to delete this response trigger? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
