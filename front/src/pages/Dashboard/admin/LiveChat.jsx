import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Send, User, MessageSquare, ShieldAlert, ShieldCheck, Loader, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '../../../utils/format';
import { toast } from 'react-toastify';

export default function LiveChat() {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [settings, setSettings] = useState(null);
    const [showMobileMessages, setShowMobileMessages] = useState(false);
    const [userPermissions, setUserPermissions] = useState([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // Auth
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const token = loggedInUser.token;

    const messagesEndRef = useRef(null);

    // Initial Load: Settings & Conversations
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get("http://localhost:5000/api/settings");
                setSettings(data);
            } catch (error) { console.error("Settings fetch failed"); }
        };
        fetchSettings();
        fetchUserProfile();
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchUserProfile = async () => {
        if (!token) return;
        try {
            const response = await fetch("http://localhost:5000/api/users/profile", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUserPermissions(data.permissions || []);
            setIsSuperAdmin(data.isSuperAdmin || data.role === 'admin');
        } catch (error) {
            console.error("Error fetching profile:", error);
            setIsSuperAdmin(loggedInUser.role === 'admin');
        }
    };

    const hasPermission = (perm) => isSuperAdmin || userPermissions.includes(perm);

    // Fetch Messages Loop (if user selected)
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
            const interval = setInterval(() => fetchMessages(selectedUser._id, true), 5000); // Poll chat every 5s
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll to bottom ONLY on initial load or user change
    useEffect(() => {
        if (!msgLoading && selectedUser && messages.length > 0) {
            scrollToBottom();
        }
    }, [selectedUser?._id, msgLoading]);

    const fetchConversations = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/api/chat/conversations", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load conversations");
        }
    };

    const fetchMessages = async (userId, silent = false) => {
        if (!silent) setMsgLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/chat/admin/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(data);
            // Update read count locally by re-fetching convos
            if (!silent) {
                fetchConversations();
            }
        } catch (error) {
            console.error("Failed to load messages");
        } finally {
            if (!silent) setMsgLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setShowMobileMessages(true);
        // Optimistically clear unread count for this user in the sidebar
        setConversations(prev => prev.map(c =>
            c.user._id === user._id ? { ...c, unreadCount: 0 } : c
        ));
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedUser) return;

        if (!hasPermission('chat.manage')) {
            toast.error("You don't have permission to send messages.");
            return;
        }

        const text = input;
        setInput("");

        try {
            await axios.post("http://localhost:5000/api/chat/admin", {
                userId: selectedUser._id,
                message: text
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchMessages(selectedUser._id, true);
            scrollToBottom();
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleTakeOver = async () => {
        if (!selectedUser) return;

        if (!hasPermission('chat.manage')) {
            toast.error("You don't have permission to manage chat status.");
            return;
        }

        const newStatus = !selectedUser.isChatPausedByAdmin;

        try {
            await axios.put(`http://localhost:5000/api/chat/take-over/${selectedUser._id}`, {
                pause: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSelectedUser({ ...selectedUser, isChatPausedByAdmin: newStatus });
            toast.success(newStatus ? "You have taken over. Bot is paused." : "Bot has resumed.");
            fetchMessages(selectedUser._id, true);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    // Filter conversations
    const [searchTerm, setSearchTerm] = useState("");
    const filteredConvos = conversations.filter(c =>
        (c.user.firstName + " " + c.user.lastName).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-144px)] lg:h-[calc(100vh-160px)] w-full max-w-full bg-white lg:rounded-3xl overflow-hidden shadow-2xl border border-gray-100 font-[Inter] animate-in fade-in zoom-in duration-500">

            {/* Sidebar */}
            <div className={`${showMobileMessages ? "hidden" : "flex"} lg:flex w-full lg:w-1/3 border-r border-gray-100 flex-col bg-slate-50 min-w-0 h-full`}>
                <div className="p-6 border-b border-gray-100 bg-white shrink-0">
                    <h2 className="font-black text-2xl text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <MessageSquare className="text-emerald-600" size={24} />
                        </div>
                        Live Support
                    </h2>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search active chats..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-emerald-500/30 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-3 space-y-2">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader className="animate-spin text-emerald-500 mx-auto mb-2" size={32} />
                            <p className="text-gray-400 text-sm font-medium">Loading conversations...</p>
                        </div>
                    ) : filteredConvos.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm">No active chats found.</p>
                        </div>
                    ) : (
                        filteredConvos.map(c => (
                            <button
                                key={c._id}
                                onClick={() => handleSelectUser(c.user)}
                                className={`w-full p-4 flex items-center gap-4 group transition-all rounded-2xl border border-transparent ${selectedUser?._id === c.user._id ? "bg-white shadow-md border-emerald-100 -translate-x-1" : "hover:bg-gray-100 active:scale-95"}`}
                            >
                                <div className="relative shrink-0">
                                    <div className={`w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-sm border-2 ${selectedUser?._id === c.user._id ? "border-emerald-500" : "border-white"}`}>
                                        {c.user.image ? (
                                            <img src={getImageUrl(c.user.image)} alt={c.user.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-emerald-500 bg-emerald-50 font-bold text-xl uppercase">{c.user.firstName[0]}</div>
                                        )}
                                    </div>
                                    {c.unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                                            {c.unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-gray-900 truncate pr-2 text-sm">
                                            {c.user.firstName} {c.user.lastName}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">
                                            {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate leading-relaxed ${c.unreadCount > 0 ? "font-black text-gray-900" : "text-gray-400"}`}>
                                        {c.sender === 'admin' ? "You: " : c.sender === 'bot' ? "Bot: " : ""}{c.lastMessage}
                                    </p>
                                </div>
                                {c.user.isChatPausedByAdmin && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`${!showMobileMessages ? "hidden" : "flex"} lg:flex lg:w-2/3 flex-col bg-white relative h-full overflow-hidden min-w-0`}>
                {selectedUser ? (
                    <div className="flex flex-col h-full w-full">
                        {/* Header */}
                        <div className="p-4 lg:p-5 border-b border-gray-100 flex items-center justify-between shadow-sm z-20 bg-white/80 backdrop-blur-md shrink-0">
                            <div className="flex items-center gap-3 lg:gap-4">
                                {/* Back Button for Mobile */}
                                <button
                                    onClick={() => setShowMobileMessages(false)}
                                    className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                                >
                                    <ArrowLeft size={24} />
                                </button>

                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative shrink-0">
                                    {selectedUser.image ? (
                                        <img src={getImageUrl(selectedUser.image)} alt={selectedUser.firstName} className="w-full h-full object-cover" />
                                    ) : <div className="w-full h-full flex items-center justify-center text-emerald-600 bg-emerald-50 font-bold text-lg uppercase">{selectedUser.firstName[0]}</div>}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-gray-900 tracking-tight text-sm lg:text-base truncate">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                    <p className="text-[10px] lg:text-[11px] text-emerald-600 font-bold flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0"></span> {selectedUser.isChatPausedByAdmin ? "HANDLED BY YOU" : "MONITORED BY BOT"}
                                    </p>
                                </div>
                            </div>

                            {hasPermission('chat.manage') && (
                                <button
                                    onClick={handleTakeOver}
                                    className={`flex items-center gap-2 px-3 lg:px-5 py-2 lg:py-2.5 rounded-2xl font-bold text-[10px] lg:text-xs transition-all active:scale-95 shadow-lg shrink-0 ${selectedUser.isChatPausedByAdmin
                                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-gray-200/50"
                                        : "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200"
                                        }`}
                                >
                                    {selectedUser.isChatPausedByAdmin ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                    <span className="hidden sm:inline">{selectedUser.isChatPausedByAdmin ? "Resume Bot" : "Take Over Chat"}</span>
                                    <span className="sm:hidden">{selectedUser.isChatPausedByAdmin ? "Resume" : "Take Over"}</span>
                                </button>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50/50 overscroll-contain min-h-0" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                            {msgLoading ? (
                                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                                    <Loader className="animate-spin text-emerald-500 mb-4" size={32} lg:size={40} />
                                    <p className="font-bold text-xs lg:text-sm">Securely fetching messages...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 bg-white/50 rounded-3xl border border-dashed border-gray-200 my-10">
                                    <MessageSquare size={32} className="text-gray-200 mb-2" />
                                    <p className="text-center text-gray-400 text-sm font-medium">Start the conversation by saying hi!</p>
                                </div>
                            ) : (
                                messages.map((m, i) => {
                                    const isAdmin = m.sender === 'admin';
                                    const isBot = m.sender === 'bot';
                                    const isUser = m.sender === 'user';

                                    // Align User to Left, Bot & Admin to Right
                                    const alignRight = isAdmin || isBot;

                                    return (
                                        <div key={m._id || i} className={`flex w-full group animate-in slide-in-from-bottom-2 duration-300 ${alignRight ? "justify-end" : "justify-start"}`}>
                                            <div className={`flex max-w-[80%] gap-3 ${alignRight ? "flex-row-reverse" : "flex-row"}`}>

                                                {/* Avatar */}
                                                <div className="shrink-0 mt-auto pb-6">
                                                    <div className={`w-8 h-8 rounded-xl overflow-hidden bg-white shadow-sm border ${alignRight ? "border-emerald-100" : "border-gray-100"} flex items-center justify-center`}>
                                                        {isAdmin ? (
                                                            m.admin?.image ? (
                                                                <img src={getImageUrl(m.admin.image)} alt="Admin" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold uppercase">
                                                                    {m.admin?.firstName ? m.admin.firstName[0] : "A"}
                                                                </div>
                                                            )
                                                        ) : isBot ? (
                                                            settings?.logo ? (
                                                                <img src={getImageUrl(settings.logo)} alt="Bot" className="w-full h-full object-contain p-1" />
                                                            ) : <div className="text-emerald-600 font-black text-[10px]">AI</div>
                                                        ) : selectedUser.image ? (
                                                            <img src={getImageUrl(selectedUser.image)} alt="User" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-gray-400 uppercase text-[10px] font-bold">{selectedUser.firstName[0]}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`flex flex-col min-w-0 ${alignRight ? "items-end" : "items-start"}`}>
                                                    <div className={`relative px-5 py-3.5 rounded-3xl shadow-sm text-sm leading-relaxed break-all whitespace-pre-wrap ${isAdmin
                                                        ? "bg-emerald-600 text-white rounded-br-none"
                                                        : isBot
                                                            ? "bg-slate-800 text-slate-100 rounded-br-none"
                                                            : "bg-white text-gray-900 border border-gray-100 rounded-bl-none"
                                                        }`}>
                                                        {m.message}
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 mt-2 px-1 text-[10px] font-bold uppercase tracking-wider ${alignRight ? "text-emerald-600" : "text-gray-400"}`}>
                                                        <span>
                                                            {isAdmin ? (m.admin?.firstName || "Administrator") : isBot ? "Assistant" : selectedUser.firstName}
                                                        </span>
                                                        <span className="opacity-30">•</span>
                                                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input area */}
                        <div className="p-4 lg:p-6 border-t border-gray-100 bg-white shrink-0">
                            <form onSubmit={handleSend} className="relative flex items-center gap-2 lg:gap-3">
                                <div className="flex-1 relative group">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        disabled={!hasPermission('chat.manage')}
                                        placeholder={!hasPermission('chat.manage') ? "View only mode" : selectedUser.isChatPausedByAdmin ? "Type your reply..." : "Bot is active..."}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white rounded-2xl lg:rounded-[1.5rem] px-4 lg:px-6 py-3 lg:py-4 outline-none transition-all text-xs lg:text-sm placeholder:text-gray-400 pr-12 lg:pr-14 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                        {!selectedUser.isChatPausedByAdmin && (
                                            <div className="p-2 text-amber-500 bg-amber-50 rounded-full" title="Bot is Active">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white p-3 lg:p-4 rounded-xl lg:rounded-[1.25rem] transition-all shadow-xl shadow-emerald-200 active:scale-95 shrink-0"
                                >
                                    <Send size={20} lg:size={24} />
                                </button>
                            </form>
                            <p className="text-[10px] text-gray-400 mt-4 text-center font-bold uppercase tracking-widest opacity-50">
                                End-to-end Encrypted Support Channel
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl opacity-50 scale-150 animate-pulse"></div>
                            <div className="relative w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center border border-gray-50">
                                <MessageSquare size={64} className="text-emerald-500" />
                            </div>
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-2xl font-black text-gray-900 mb-2 mt-4 uppercase tracking-tighter italic">Select a Chat</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                Pick a student from the sidebar to view history or provide manual assistance.
                            </p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
