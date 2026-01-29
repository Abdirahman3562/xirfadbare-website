import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, ChevronLeft, Phone, User } from "lucide-react";
import axios from "axios";
import { getImageUrl } from "../utils/format";

export default function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState("home"); // 'home' | 'chat'
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Dynamic Data State
    const [settings, setSettings] = useState(null);
    const [user, setUser] = useState(null);

    // Initial Load: Settings & User & Chat History
    useEffect(() => {
        // 1. Get Logged In User
        const storedUser = localStorage.getItem("loggedInUser");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // 2. Fetch Settings
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get("http://localhost:5000/api/settings");
                setSettings(data);
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, []);

    // Fetch Chat History when view changes to 'chat' AND user is logged in
    useEffect(() => {
        let interval;
        if (view === 'chat' && user?.token) {
            const fetchHistory = async () => {
                try {
                    const { data } = await axios.get("http://localhost:5000/api/chat", {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    const formattedMessages = data.map(msg => ({
                        id: msg._id,
                        text: msg.message,
                        isBot: msg.sender === 'bot',
                        isAdmin: msg.sender === 'admin',
                        admin: msg.admin, // Populated from backend
                        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }));
                    setMessages(formattedMessages);
                } catch (error) {
                    console.error("Error fetching chat history:", error);
                }
            };
            fetchHistory();
            interval = setInterval(fetchHistory, 5000); // Poll every 5s for Admin replies
        } else if (view === 'chat' && !user) {
            if (messages.length === 0) {
                setMessages([{ id: 1, text: "Hello! 👋 Please log in to save your chat history.", isBot: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            }
        }
        return () => clearInterval(interval);
    }, [view, user]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll ONLY when view changes or user sends/receives first messages
    useEffect(() => {
        if (view === 'chat' && messages.length > 0) {
            // Only scroll automatically on first load of the chat view
            scrollToBottom();
        }
    }, [view]);

    const toggleWidget = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setView("home");
            // Retry fetching if empty (e.g. initial load failed)
            if (botResponses.length === 0) fetchBotResponses();
        }
    };

    const [botResponses, setBotResponses] = useState([]);

    const fetchBotResponses = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/api/bot-responses");
            setBotResponses(data);
        } catch (error) {
            console.error("Failed to load bot responses", error);
        }
    };

    // Fetch Bot Responses on Load
    useEffect(() => {
        fetchBotResponses();
    }, []);

    const findBotResponse = (input) => {
        const lowerInput = input.toLowerCase();

        // Find best match (prioritize exact match if strictly needed, but here we scan list)
        // We filter for active responses
        const activeResponses = botResponses.filter(r => r.isActive !== false);

        const match = activeResponses.find(r => {
            if (r.matchType === 'exact') {
                return r.trigger?.toLowerCase() === lowerInput;
            } else {
                return lowerInput.includes(r.trigger?.toLowerCase());
            }
        });

        if (match) return match.response;

        // Fallbacks (Only if DB match fails)
        if ((lowerInput.includes("hello") || lowerInput.includes("hi")) && !activeResponses.some(r => r.trigger === 'hello')) {
            return `Hello ${user?.firstName || "there"}! Welcome to Xirfadbare Assistant. How can I assist you?`;
        }

        return "I'm not sure about that. Our support team will get back to you shortly, or you can check our FAQs.";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const text = inputValue;
        const tempId = Date.now();
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Optimistic UI Update
        const newUserMsg = {
            id: tempId,
            text: text,
            isBot: false,
            time: currentTime
        };
        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            // Send to Backend if User Logged In
            if (user?.token) {
                await axios.post("http://localhost:5000/api/chat", {
                    message: text,
                    sender: 'user'
                }, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                scrollToBottom();
            }
        } catch (error) {
            console.error("Failed to save message", error);
        }

        // Simulate Bot Logic
        setTimeout(async () => {
            // Check if admin has taken over
            if (user?.token) {
                try {
                    const { data: userData } = await axios.get("http://localhost:5000/api/users/profile", {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    if (userData.isChatPausedByAdmin) {
                        setIsTyping(false);
                        return; // Bot is silenced
                    }
                } catch (err) { console.error("Status check failed", err); }
            }

            const botText = findBotResponse(text);

            // Optimistic Bot Msg
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, text: botText, isBot: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ]);
            setIsTyping(false);
            setTimeout(scrollToBottom, 100);

            // Save Bot Message to Backend
            if (user?.token) {
                try {
                    await axios.post("http://localhost:5000/api/chat/bot", {
                        message: botText
                    }, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                } catch (err) { console.error("Failed to save bot msg", err); }
            }

        }, 1500);
    };

    // Use System Settings for Phone/Logo
    // Priority: Explicit WhatsApp Link > Phone Number > Default
    const phoneNum = settings?.phoneNumber || "+252612345678";
    const waGreeting = "Assalamu Alaikum! 👋 Waxaan xiiseynayaa barnaamijka.";

    // If user provided a full WhatsApp link in settings, use that. Otherwise generate one from the phone number.
    let waLink = settings?.whatsappLink
        ? settings.whatsappLink
        : `https://wa.me/${phoneNum.replace(/\D/g, "")}?text=${encodeURIComponent(waGreeting)}`;

    const logoUrl = settings?.logo ? getImageUrl(settings.logo) : null;

    return (
        <div className="fixed right-5 bottom-5 z-[9999] flex flex-col items-end font-[Inter]">

            {/* Widget Container */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[450px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in slide-in-from-bottom-5 duration-300 origin-bottom-right">

                    {/* Header */}
                    <div className="bg-emerald-600 p-4 flex items-center justify-between shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                        <div className="flex items-center gap-3 relative z-10">
                            {(view === "chat" || view === "login_required") && (
                                <button
                                    onClick={() => setView("home")}
                                    className="mr-1 text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}

                            <div className="relative">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg shadow-sm overflow-hidden border-2 border-emerald-500">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        "X"
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-600 rounded-full"></div>
                            </div>

                            <div>
                                <h3 className="font-bold text-white text-sm">Xirfadbare Assistant</h3>
                                <p className="text-emerald-100 text-[10px] font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    {user ? "Online & Ready" : "Typically replies instantly"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={toggleWidget}
                            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors relative z-10"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-gray-50 relative overflow-hidden flex flex-col">

                        {view === "home" ? (
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2 overflow-hidden border border-gray-100">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <MessageSquare size={32} className="text-emerald-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Hello {user?.firstName || 'there'}! 👋</h4>
                                        <p className="text-gray-500 text-sm mt-1 max-w-[200px] mx-auto">How can we help you today? Choose an option below.</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-auto">
                                    <button
                                        onClick={() => setView(user ? "chat" : "login_required")}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare size={18} />
                                        Start Live Chat
                                    </button>

                                    <a
                                        href={waLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-3.5 px-4 rounded-xl border border-gray-200 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                    >
                                        <Phone size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
                                        Chat on WhatsApp
                                    </a>
                                </div>
                            </div>
                        ) : view === "login_required" ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-right-10 duration-300">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                    <User size={32} className="text-emerald-500" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-xl mb-2">Login Required</h4>
                                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                    Please sign in to your account to start a live chat with our support team.
                                </p>
                                <a
                                    href="/auth/login"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 block"
                                >
                                    Login Now
                                </a>
                                <button
                                    onClick={() => setView("home")}
                                    className="mt-4 text-gray-400 hover:text-gray-600 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            // Chat View
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-[#f0f9f6]" style={{ backgroundImage: 'radial-gradient(#d1fae5 1px, transparent 1px)', backgroundSize: '20px 20px' }}>

                                    <div className="text-center py-2">
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                                            Today
                                        </span>
                                    </div>

                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-4 flex ${msg.isBot || msg.isAdmin ? "justify-start" : "justify-end"} items-end gap-2 group animate-in slide-in-from-bottom-2 duration-300`}>

                                            {/* Avatar for Assistant (Bot or Admin) */}
                                            {(msg.isBot || msg.isAdmin) && (
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm mb-1">
                                                    {msg.isBot ? (
                                                        <div className="w-full h-full bg-white flex items-center justify-center">
                                                            <img src={getImageUrl(settings.logo)} alt="Bot" className="w-full h-full object-contain" />
                                                        </div>
                                                    ) : (
                                                        msg.admin?.image ? (
                                                            <img src={getImageUrl(msg.admin.image)} alt="Admin" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                                                                {msg.admin?.firstName ? msg.admin.firstName[0] : "A"}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                            <div className={`flex flex-col max-w-[75%] ${msg.isBot || msg.isAdmin ? "items-start" : "items-end"}`}>
                                                {/* Sender Name */}
                                                <span className={`text-[10px] text-gray-400 mb-1 px-1 ${msg.isBot || msg.isAdmin ? "text-left" : "text-right"}`}>
                                                    {msg.isBot ? "Assistant" : msg.isAdmin ? (msg.admin?.firstName || "Administrator") : (user?.firstName || "You")}
                                                </span>

                                                <div
                                                    className={`px-4 py-3 shadow-sm text-sm leading-relaxed relative group ${msg.isBot
                                                        ? "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100"
                                                        : msg.isAdmin
                                                            ? "bg-emerald-50 text-emerald-900 rounded-2xl rounded-tl-sm border border-emerald-100"
                                                            : "bg-emerald-600 text-white rounded-2xl rounded-tr-sm"
                                                        }`}
                                                >
                                                    {msg.text}
                                                </div>

                                                <div className={`flex items-center gap-1.5 mt-1.5 px-1 text-[9px] font-bold uppercase tracking-wider text-gray-400`}>
                                                    <span>{msg.time}</span>
                                                </div>
                                            </div>

                                            {/* Avatar for User */}
                                            {!(msg.isBot || msg.isAdmin) && (
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center overflow-hidden shadow-sm mb-1">
                                                        {user?.image ? (
                                                            <img src={getImageUrl(user.image)} alt="User" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={14} className="text-emerald-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex justify-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center p-1 shadow-sm mt-1">
                                                {logoUrl ? <img src={logoUrl} alt="Bot" className="w-full h-full object-contain" /> : <span className="font-bold text-emerald-600 text-xs">AI</span>}
                                            </div>
                                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1.5 h-[42px]">
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 shrink-0">
                                    {user ? (
                                        <>
                                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all shadow-inner">
                                                <input
                                                    type="text"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    placeholder="Type a message..."
                                                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!inputValue.trim()}
                                                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-emerald-200"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                            <div className="text-center mt-2 flex items-center justify-center gap-1">
                                                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                                <p className="text-[9px] text-gray-400">Powered by Xirfadbare AI</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-2">
                                            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                Please <a href="/auth/login" className="font-bold text-emerald-600 hover:underline">Login</a> to start chatting.
                                            </p>
                                        </div>
                                    )}
                                </form>
                            </>
                        )}

                    </div>
                </div>
            )}

            {/* Trigger Button */}
            <button
                onClick={toggleWidget}
                className="group relative flex items-center justify-center p-2"
            >
                <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping group-hover:opacity-100 transition-opacity duration-1000 w-14 h-14 translate-x-1 translate-y-1"></div>
                <div className="relative w-16 h-16 bg-emerald-600 rounded-full shadow-xl shadow-emerald-500/40 flex items-center justify-center text-white hover:bg-emerald-500 transition-transform group-hover:-translate-y-1 active:scale-95 border-4 border-white">
                    {isOpen ? (
                        <X size={28} className="animate-in rotate-90 duration-300" />
                    ) : (
                        <MessageSquare size={28} className="animate-in zoom-in duration-300" />
                    )}

                    {/* Notification Badge */}
                    {!isOpen && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-sm">
                            1
                        </span>
                    )}
                </div>
            </button>

        </div>
    );
}
