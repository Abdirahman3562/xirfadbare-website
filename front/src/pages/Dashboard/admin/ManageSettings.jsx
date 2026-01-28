import React, { useState, useEffect } from 'react';
import {
    Settings,
    Save,
    Layout,
    BarChart3,
    BookOpen,
    Users,
    History,
    Mail,
    Phone,
    MapPin,
    Check,
    Plus,
    Trash2,
    Loader2,
    Info,
    Trophy,
    MessageCircle
} from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '../../../api/systemService';
import { toast } from 'react-toastify';
import { useData } from '../../../contexts/DataContext';

const ManageSettings = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('hero');
    const [settings, setSettings] = useState(null);

    // 🔥 Get real data from context
    const { courses } = useData();

    useEffect(() => {
        fetchSettings();
    }, []);

    // 🔥 Auto-populate stats with REAL DATA when settings load
    useEffect(() => {
        if (settings && courses.length > 0) {
            const totalEnrolled = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
            const totalCourses = courses.length;
            const avgRating = courses.length > 0
                ? (courses.reduce((sum, c) => sum + (c.rating || 4.9), 0) / courses.length).toFixed(1)
                : "4.9";

            // Only update if fields are empty or have default values
            if (!settings.stats ||
                !settings.stats.learners ||
                settings.stats.learners === "10,000+") {
                setSettings(prev => ({
                    ...prev,
                    stats: {
                        ...prev?.stats,
                        learners: `${totalEnrolled.toLocaleString()}+`,
                        courses: `${totalCourses}+`,
                        rating: `${avgRating}★`,
                        partners: prev?.stats?.partners || "50+"
                    }
                }));
            }
        }
    }, [courses, settings?.hero]); // Only run when courses or initial settings load

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await getSystemSettings();

            // 🔥 If no settings exist, initialize with defaults
            if (!data || !data.hero) {
                setSettings({
                    hero: {
                        title: "Become a Full-Stack Engineer the smart way",
                        subtitle: "Hands-on projects, mentor feedback, and job-ready skills."
                    },
                    stats: {
                        learners: "10,000+",
                        courses: "200+",
                        rating: "4.9★",
                        partners: "50+"
                    },
                    howItWorks: [
                        { step: 1, title: "Create account", description: "Join for free and set your goals." },
                        { step: 2, title: "Pick a path", description: "Choose a track or individual courses." },
                        { step: 3, title: "Build projects", description: "Learn by doing with real tasks." },
                        { step: 4, title: "Get certified", description: "Finish, earn certificate, apply!" }
                    ],
                    studentOutcomes: [
                        { value: "87%", label: "Course completion rate" },
                        { value: "72%", label: "Landed a tech job" },
                        { value: "+28%", label: "Avg. salary uplift" }
                    ],
                    about: {
                        badge: "⭐ #1 Somali Coding Platform",
                        title: "Building Real Opportunities for Somalis Through Tech",
                        description: "Xirfadbare gives Somali youth and diaspora a clear, structured path to learn coding and AI — in their own language (Af-Soomaali).",
                        founder: {
                            name: "Abdirahman Mohamed",
                            role: "Founder & CEO",
                            bio: "Language should never be a barrier to building, every talented person deserves a chance to build, create, and succeed.",
                            image: ""
                        }
                    },
                    contact: {
                        email: "info@xirfadbare.com",
                        phone: "+252 619537487",
                        address: "Mogadishu, Somalia",
                        workingHours: "Sat - Thu: 8:00 AM - 5:00 PM"
                    }
                });
            } else {
                setSettings(data);
            }
        } catch (error) {
            toast.error("Wuu fashilmay soo aqrinta settings-ka");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await updateSystemSettings(settings);
            if (res) {
                toast.success("Settings-ka waa la keydiyay!");
            }
        } catch (error) {
            toast.error("Wuu fashilmay keydinta settings-ka");
        } finally {
            setSubmitting(false);
        }
    };

    const updateNestedField = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const addListItem = (field) => {
        const newItem = field === 'howItWorks'
            ? { step: (settings.howItWorks?.length || 0) + 1, title: '', description: '' }
            : { value: '', label: '' };

        setSettings(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), newItem]
        }));
    };

    const removeListItem = (field, index) => {
        setSettings(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const updateListItem = (field, index, key, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? { ...item, [key]: value } : item)
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-gray-500 font-medium italic">Soo aqrinaya settings-ka...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'hero', name: 'Hero & Stats', icon: <Layout size={18} /> },
        { id: 'how-it-works', name: 'How It Works', icon: <History size={18} /> },
        { id: 'outcomes', name: 'Student Outcomes', icon: <Trophy size={18} /> },
        { id: 'about', name: 'About Page', icon: <Info size={18} /> },
        { id: 'contact', name: 'Contact Info', icon: <Mail size={18} /> },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-[Inter]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Customize your website's dynamic content and appearances.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={submitting}
                    className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span className="uppercase tracking-widest">Save Settings</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <aside className="lg:w-72 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100'
                                }`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <form onSubmit={handleSave} className="p-10 space-y-10">

                        {/* 🚀 HERO & STATS */}
                        {activeTab === 'hero' && (
                            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Main Hero Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                            value={settings.hero?.title}
                                            onChange={(e) => updateNestedField('hero', 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Hero Subtitle</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                            value={settings.hero?.subtitle}
                                            onChange={(e) => updateNestedField('hero', 'subtitle', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-gray-50">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                        <BarChart3 size={18} className="text-emerald-500" /> Counter Stats
                                    </h3>

                                    {/* 🔥 REAL DATA PREVIEW - ALWAYS LIVE */}
                                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl border-2 border-emerald-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Database Stats (Auto-Updated)</h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Enrolled</p>
                                                <p className="text-2xl font-black text-emerald-600">
                                                    {courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0).toLocaleString()}+
                                                </p>
                                            </div>
                                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Courses</p>
                                                <p className="text-2xl font-black text-blue-600">
                                                    {courses.length}+
                                                </p>
                                            </div>
                                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Rating</p>
                                                <p className="text-2xl font-black text-amber-600">
                                                    {courses.length > 0
                                                        ? (courses.reduce((sum, c) => sum + (c.rating || 4.9), 0) / courses.length).toFixed(1)
                                                        : "4.9"
                                                    }★
                                                </p>
                                            </div>
                                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Partners</p>
                                                <p className="text-2xl font-black text-purple-600">50+</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-white/60 rounded-xl border border-emerald-100">
                                            <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-2">
                                                <Check size={14} className="text-emerald-600" />
                                                These stats are automatically calculated from your database and update in real-time on the homepage.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 🔄 HOW IT WORKS */}
                        {activeTab === 'how-it-works' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                                {/* 🔥 LIVE WEBSITE PREVIEW */}
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border-2 border-blue-100">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Live Website Preview</h4>
                                    </div>

                                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                        {settings.howItWorks?.map((s, i) => (
                                            <div
                                                key={i}
                                                className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm"
                                            >
                                                <div className="w-10 h-10 grid place-content-center rounded-full bg-emerald-600 text-white font-bold">
                                                    {s.step || i + 1}
                                                </div>
                                                <h3 className="mt-4 font-bold text-base text-gray-800">{s.title || "Step Title"}</h3>
                                                <p className="text-gray-600 mt-2 text-sm">{s.description || "Step description..."}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-100">
                                        <p className="text-[10px] text-blue-700 font-bold flex items-center gap-2">
                                            <Check size={14} className="text-blue-600" />
                                            This is exactly how your "How It Works" section will appear on the homepage.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Process Steps</h3>
                                    <button
                                        type="button"
                                        onClick={() => addListItem('howItWorks')}
                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {settings.howItWorks?.map((item, index) => (
                                        <div key={index} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative group">
                                            <button
                                                type="button"
                                                onClick={() => removeListItem('howItWorks', index)}
                                                className="absolute top-4 right-4 p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Step #</label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-4 py-3 bg-white border border-transparent rounded-xl outline-none focus:border-emerald-500 font-bold"
                                                        value={item.step}
                                                        onChange={(e) => updateListItem('howItWorks', index, 'step', e.target.value)}
                                                    />
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Step Title</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 bg-white border border-transparent rounded-xl outline-none focus:border-emerald-500 font-bold"
                                                        value={item.title}
                                                        onChange={(e) => updateListItem('howItWorks', index, 'title', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-white border border-transparent rounded-xl outline-none focus:border-emerald-500 font-medium text-sm h-20 resize-none"
                                                    value={item.description}
                                                    onChange={(e) => updateListItem('howItWorks', index, 'description', e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 🏆 STUDENT OUTCOMES */}
                        {activeTab === 'outcomes' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                                {/* 🔥 LIVE WEBSITE PREVIEW */}
                                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-100">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                        <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Live Website Preview</h4>
                                    </div>

                                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 text-center">
                                        {settings.studentOutcomes?.map((item, index) => (
                                            <div
                                                key={index}
                                                className="p-6 bg-white backdrop-blur-md rounded-2xl shadow-sm border border-gray-200"
                                            >
                                                <h3 className="text-4xl font-extrabold text-emerald-600 drop-shadow-sm">
                                                    {item.value || "0%"}
                                                </h3>
                                                <p className="mt-2 text-emerald-600 font-medium text-base">
                                                    {item.label || "Outcome Label"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-3 bg-white/60 rounded-xl border border-amber-100">
                                        <p className="text-[10px] text-amber-700 font-bold flex items-center gap-2">
                                            <Check size={14} className="text-amber-600" />
                                            This is exactly how your "Student Outcomes" section will appear on the homepage.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Success Metrics</h3>
                                    <button
                                        type="button"
                                        onClick={() => addListItem('studentOutcomes')}
                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {settings.studentOutcomes?.map((item, index) => (
                                        <div key={index} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative group">
                                            <button
                                                type="button"
                                                onClick={() => removeListItem('studentOutcomes', index)}
                                                className="absolute top-4 right-4 p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Percentage / Value</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 bg-white border border-transparent rounded-xl outline-none focus:border-emerald-500 font-black text-xl text-emerald-600"
                                                        value={item.value}
                                                        onChange={(e) => updateListItem('studentOutcomes', index, 'value', e.target.value)}
                                                        placeholder="e.g. 87%"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Outcome Label</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 bg-white border border-transparent rounded-xl outline-none focus:border-emerald-500 font-bold text-gray-600"
                                                        value={item.label}
                                                        onChange={(e) => updateListItem('studentOutcomes', index, 'label', e.target.value)}
                                                        placeholder="e.g. Job Placement"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ℹ️ ABOUT PAGE */}
                        {activeTab === 'about' && (
                            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">About Section Badge</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                            value={settings.about?.badge}
                                            onChange={(e) => updateNestedField('about', 'badge', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Main Headline</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                            value={settings.about?.title}
                                            onChange={(e) => updateNestedField('about', 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Description Paragraph</label>
                                        <textarea
                                            rows="4"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium text-gray-700 resize-none h-32"
                                            value={settings.about?.description}
                                            onChange={(e) => updateNestedField('about', 'description', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-gray-50 space-y-8">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={18} className="text-emerald-500" /> Founder's Message
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Founder Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-sm"
                                                value={settings.about?.founder?.name}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    about: { ...settings.about, founder: { ...settings.about.founder, name: e.target.value } }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Founder Role</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-sm"
                                                value={settings.about?.founder?.role}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    about: { ...settings.about, founder: { ...settings.about.founder, role: e.target.value } }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 📞 CONTACT INFO */}
                        {activeTab === 'contact' && (
                            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Public Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                            <input
                                                type="email"
                                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                                value={settings.contact?.email}
                                                onChange={(e) => updateNestedField('contact', 'email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Support Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                            <input
                                                type="text"
                                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                                value={settings.contact?.phone}
                                                onChange={(e) => updateNestedField('contact', 'phone', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Office Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                            <input
                                                type="text"
                                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                                value={settings.contact?.address}
                                                onChange={(e) => updateNestedField('contact', 'address', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Working Hours</label>
                                        <div className="relative">
                                            <History className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                            <input
                                                type="text"
                                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-700"
                                                value={settings.contact?.workingHours}
                                                onChange={(e) => updateNestedField('contact', 'workingHours', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-8 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-3 bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                Update All Settings
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default ManageSettings;
