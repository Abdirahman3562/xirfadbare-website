import { useState, useEffect } from "react";
import {
    Search,
    Trash2,
    Mail,
    Send,
    X,
    Filter,
    CheckCircle,
    Clock,
    User,
    Phone,
    Calendar,
    MessageSquare,
    AlertTriangle,
    Eye
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getImageUrl } from "../../../utils/format";

// Helper to format date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const ManageContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // all, unread, replied

    // Reply Modal State
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [replySubject, setReplySubject] = useState("");
    const [replyMessage, setReplyMessage] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("loggedInUser"));
            const token = user?.token;

            const { data } = await axios.get("http://localhost:5000/api/contacts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContacts(data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
            // toast.error("Failed to load contacts.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (contact) => {
        setContactToDelete(contact);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!contactToDelete) return;

        try {
            setIsDeleting(true);
            const user = JSON.parse(localStorage.getItem("loggedInUser"));
            const token = user?.token;

            await axios.delete(`http://localhost:5000/api/contacts/${contactToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Message deleted.");
            setContacts(contacts.filter(c => c._id !== contactToDelete._id));
            setShowDeleteModal(false);
            setContactToDelete(null);
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error(error.response?.data?.message || "Failed to delete message.");
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleMarkAsRead = async (contact) => {
        // Toggle status: if 'unread' -> 'read', if 'read' -> 'unread'.
        // If 'replied', don't change or maybe allow mark as unread? 
        // Let's assume we toggle read/unread only if it is not replied, or allow moving replied to read?
        // User asked to "read status kaor si u statuska isku abdalo u read unqodo boss". 
        // Simple toggle: unread <-> read. Ignore replied for now or handle appropriately.

        const newStatus = contact.status === 'unread' ? 'read' : 'unread';
        // If it's already replied, maybe we shouldn't change it back to unread easily, 
        // but for flexibility let's allow setting it to 'read' if desired, although 'replied' is a superior status.
        // Let's just switch 'unread' to 'read'. If it is 'read', switch to 'unread'. 
        // If 'replied', keep 'replied'? Or switch to 'read'?

        if (contact.status === 'replied') return; // Don't change replied status via this button

        try {
            const user = JSON.parse(localStorage.getItem("loggedInUser"));
            const token = user?.token;

            // Use the generic update endpoint if it exists or we might need to create one.
            // Based on previous tool usage, contactRoutes has .put(protect, updateContact) which takes req.body

            await axios.put(`http://localhost:5000/api/contacts/${contact._id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setContacts(contacts.map(c =>
                c._id === contact._id ? { ...c, status: newStatus } : c
            ));

            // toast.success(`Marked as ${newStatus}`);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const openReplyModal = (contact) => {
        setSelectedContact(contact);
        setReplySubject(`Re: ${contact.about || "Your inquiry"}`);
        setReplyMessage("");
        setShowReplyModal(true);

        // Optionally mark as read when opening reply modal
        if (contact.status === 'unread') {
            handleMarkAsRead(contact);
            // Note: handleMarkAsRead toggles, so if it's unread it becomes read.
            // But we can't call async properly inside this sync function without care, but it's fire-and-forget.
        }
    };

    const closeReplyModal = () => {
        setShowReplyModal(false);
        setSelectedContact(null);
        setSendingReply(false);
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim()) {
            toast.warn("Please enter a reply message.");
            return;
        }

        try {
            setSendingReply(true);
            const user = JSON.parse(localStorage.getItem("loggedInUser"));
            const token = user?.token;

            await axios.post(`http://localhost:5000/api/contacts/${selectedContact._id}/reply`,
                {
                    subject: replySubject,
                    replyMessage: replyMessage
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                });

            toast.success("Reply sent successfully!");

            // Update local status to replied
            setContacts(contacts.map(c =>
                c._id === selectedContact._id ? { ...c, status: 'replied' } : c
            ));

            closeReplyModal();
        } catch (error) {
            console.error("Error sending reply:", error);
            toast.error("Failed to send reply.");
        } finally {
            setSendingReply(false);
        }
    };

    // Filter Logic
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch =
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.about?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden max-w-full">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-[Inter]">Contact Messages</h1>
                <p className="text-gray-500 text-sm mt-1">Manage and reply to inquiries from the contact form.</p>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search name, email, or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:flex-none relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-9 pr-8 py-3 bg-white text-gray-600 rounded-2xl border border-gray-100 outline-none hover:border-emerald-200 transition-colors text-sm appearance-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Loading messages...</p>
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-gray-900 font-bold">No messages found</h3>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {filteredContacts.map((contact) => (
                        <div key={contact._id} className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col">
                            {/* Card Header: User & Status */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-shrink-0">
                                        {/* Avatar Logic */}
                                        {contact.userDetails?.image ? (
                                            <img
                                                src={getImageUrl(contact.userDetails.image)}
                                                alt={contact.name}
                                                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-gray-100"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black border-2 border-white shadow-md uppercase">
                                                {contact.name.charAt(0)}
                                            </div>
                                        )}

                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${contact.status === 'replied' ? 'bg-emerald-500' :
                                            contact.status === 'read' ? 'bg-blue-500' : 'bg-amber-500'
                                            }`}>
                                            {contact.status === 'replied' ? <CheckCircle size={10} className="text-white" /> :
                                                contact.status === 'read' ? <Eye size={10} className="text-white" /> :
                                                    <Clock size={10} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[15px] font-black text-gray-900 truncate tracking-tight">
                                            {contact.name}
                                        </h4>
                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                            <p className="text-[11px] text-gray-500 font-medium truncate flex items-center gap-1">
                                                <Mail size={10} /> {contact.email}
                                            </p>
                                            {contact.phone && (
                                                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                                    <Phone size={10} /> {contact.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${contact.status === 'replied' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' :
                                    contact.status === 'read' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' :
                                        'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${contact.status === 'replied' ? 'bg-emerald-500' :
                                        contact.status === 'read' ? 'bg-blue-500' : 'bg-amber-500'
                                        }`} />
                                    {contact.status}
                                </div>
                            </div>

                            {/* Card Body: Message Content */}
                            <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-100 mb-6 flex-1">
                                <div className="mb-3">
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Subject</span>
                                    <h5 className="text-sm font-bold text-gray-800 line-clamp-1">
                                        {contact.about || "No Subject"}
                                    </h5>
                                </div>
                                <div className="pt-3 border-t border-gray-200/50">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Message</span>
                                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                                        {contact.message}
                                    </p>
                                </div>
                            </div>

                            {/* Card Footer: Date & Actions */}
                            <div className="flex items-center justify-between gap-4 pt-2 mt-auto">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Received</span>
                                    <div className="flex items-center gap-1 text-gray-900 text-xs font-bold">
                                        <Calendar size={12} className="text-gray-400" />
                                        {formatDate(contact.createdAt)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100/80 shadow-sm backdrop-blur-sm">
                                    {contact.status !== 'replied' && (
                                        <button
                                            onClick={() => handleMarkAsRead(contact)}
                                            className={`p-2.5 rounded-xl transition-all active:scale-90 ${contact.status === 'read'
                                                ? 'text-blue-500 bg-blue-50'
                                                : 'text-gray-400 hover:text-blue-500 hover:bg-white'
                                                }`}
                                            title={contact.status === 'read' ? "Mark as Unread" : "Mark as Read"}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openReplyModal(contact)}
                                        className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all active:scale-90"
                                        title="View & Reply"
                                    >
                                        <Mail size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(contact)}
                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all active:scale-90"
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

            {/* Reply Modal */}
            {showReplyModal && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    <div className="bg-white h-[550px] rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-y-auto  border border-gray-100">
                        {/* Modal Header */}
                        <div className="bg-emerald-600 p-6 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
                            <div className="relative z-10 text-white">
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <Mail size={20} />
                                    Reply to {selectedContact.name}
                                </h3>
                                <p className="text-emerald-100 text-xs mt-1 font-medium">Sending email via support channel</p>
                            </div>
                            <button
                                onClick={closeReplyModal}
                                className="relative z-10 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Original Message Context */}
                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Original Inquiry</p>
                                <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-sm text-gray-700 italic leading-relaxed whitespace-pre-wrap break-words break-all">"{selectedContact.message}"</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Subject Line</label>
                                    <input
                                        type="text"
                                        value={replySubject}
                                        onChange={(e) => setReplySubject(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Your Reply</label>
                                    <textarea
                                        rows="6"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your structured response here..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={closeReplyModal}
                                className="px-6 py-3 text-gray-600 hover:bg-gray-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={sendingReply}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
                            >
                                {sendingReply ? (
                                    <>Sending...</>
                                ) : (
                                    <>Send Reply <Send size={16} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
                                <AlertTriangle size={40} className="text-red-500 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2 font-[Inter]">Are you sure?</h3>
                            <p className="text-sm text-gray-500 font-medium">
                                Once deleted, this message cannot be recovered. Do you want to proceed?
                            </p>
                        </div>
                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setContactToDelete(null);
                                }}
                                className="flex-1 py-4 bg-white hover:bg-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-200 active:scale-95"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 active:scale-95 flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        <span>Yes, Delete</span>
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

export default ManageContacts;
