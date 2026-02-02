import React, { useState, useEffect } from "react";
import { Save, Globe, Mail, Phone, MapPin, MessageCircle, Image as ImageIcon, Lock, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usePermissions } from "../../../hooks/usePermissions";
import PremiumLoader from "../../../components/ui/PremiumLoader";

export default function SystemSettings() {
    const { canAccess } = usePermissions();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [settings, setSettings] = useState({
        websiteTitle: "",
        websiteDescription: "",
        contactEmail: "",
        whatsappLink: "",
        phoneNumber: "",
        location: "",
        logo: "",
        facebookLink: "",
        twitterLink: "",
        linkedinLink: "",
        instagramLink: "",
        tiktokLink: "",
        youtubeLink: ""
    });

    // Fetch current settings
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch("https://xirfadbare-backend.onrender.com/api/settings");
            const data = await response.json();
            setSettings(data);
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const response = await fetch("https://xirfadbare-backend.onrender.com/api/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Add backend URL to the path
                const fullUrl = `https://xirfadbare-backend.onrender.com${data.url}`;
                setSettings(prev => ({
                    ...prev,
                    logo: fullUrl
                }));
                toast.success("Logo uploaded successfully!");
            } else {
                toast.error(data.message || "Failed to upload logo");
            }
        } catch (error) {
            console.error("Error uploading logo:", error);
            toast.error("Failed to upload logo");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const response = await fetch("https://xirfadbare-backend.onrender.com/api/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Settings updated successfully!");
                // Update document title
                document.title = settings.websiteTitle;
            } else {
                toast.error(data.message || "Failed to update settings");
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PremiumLoader text="Loading System Settings..." />;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto font-[Inter]">
            {!canAccess('settings', 'view') && !loading ? (
                <div className="max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-rose-100 dark:border-rose-900/30">
                    <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-12 h-12 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Access Denied</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-lg leading-relaxed italic">
                        Sorry, you don't have permission to view this page.
                        Please contact the administrator for access.
                    </p>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="mt-10 px-12 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                    >
                        Back to Dashboard
                    </button>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">System Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your website information and contact details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Website Title */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Website Title</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Appears in browser tab and search results</p>
                                </div>
                            </div>
                            <input
                                type="text"
                                name="websiteTitle"
                                value={settings.websiteTitle}
                                onChange={handleChange}
                                disabled={!canAccess('settings', 'edit')}
                                placeholder="e.g., Xirfadbare Academy | Learn & Grow"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Website Description */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Website Description</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Brief description of your website</p>
                                </div>
                            </div>
                            <textarea
                                name="websiteDescription"
                                value={settings.websiteDescription}
                                onChange={handleChange}
                                disabled={!canAccess('settings', 'edit')}
                                rows="4"
                                placeholder="Describe your website..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>

                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={settings.contactEmail}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="info@example.com"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={settings.phoneNumber}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="+252 XX XXX XXXX"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* WhatsApp */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        WhatsApp Link
                                    </label>
                                    <input
                                        type="text"
                                        name="whatsappLink"
                                        value={settings.whatsappLink}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="https://wa.me/252XXXXXXXXX"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={settings.location}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="Mogadishu, Somalia"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Social Media Links</h3>

                            <div className="space-y-4">
                                {/* Facebook */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Facebook
                                    </label>
                                    <input
                                        type="text"
                                        name="facebookLink"
                                        value={settings.facebookLink}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="https://facebook.com/yourpage"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Twitter */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                        </svg>
                                        Twitter
                                    </label>
                                    <input
                                        type="text"
                                        name="twitterLink"
                                        value={settings.twitterLink}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="https://twitter.com/yourhandle"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* LinkedIn */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        LinkedIn
                                    </label>
                                    <input
                                        type="text"
                                        name="linkedinLink"
                                        value={settings.linkedinLink}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Instagram */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5m0 2a3 3 0 1 0 3 3 3 3 0 0 0-3-3" />
                                        </svg>
                                        Instagram
                                    </label>
                                    <input
                                        type="text"
                                        name="instagramLink"
                                        value={settings.instagramLink}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="https://instagram.com/yourprofile"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* TikTok */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                        </svg>
                                        TikTok
                                    </label>
                                    <input
                                        type="text"
                                        name="tiktokLink"
                                        value={settings.tiktokLink}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="https://tiktok.com/@yourhandle"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* YouTube */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                        YouTube
                                    </label>
                                    <input
                                        type="text"
                                        name="youtubeLink"
                                        value={settings.youtubeLink}
                                        onChange={handleChange}
                                        disabled={!canAccess('settings', 'edit')}
                                        placeholder="https://youtube.com/@yourchannel"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Website Logo</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Upload your website logo (PNG, JPG, max 5MB)</p>
                                </div>
                            </div>

                            {/* Current Logo Preview */}
                            {settings.logo && (
                                <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">Current Logo:</p>
                                    <img
                                        src={settings.logo}
                                        alt="Current logo"
                                        className="h-20 object-contain rounded-lg"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    <p className="text-xs text-red-500 mt-2 hidden">Failed to load image</p>
                                </div>
                            )}

                            {/* File Upload Input */}
                            <div className="relative">
                                <input
                                    type="file"
                                    id="logo-upload"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all bg-gray-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                >
                                    <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        {uploading ? "Uploading..." : "Click to upload logo"}
                                    </span>
                                </label>
                            </div>

                            {uploading && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                                    <div className="w-4 h-4 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                                    Uploading logo...
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            {!canAccess('settings', 'edit') ? (
                                <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-500/20 font-bold text-xs">
                                    <Lock size={14} />
                                    READ-ONLY MODE (RESTRICTED ACCESS)
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center cursor-pointer gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 dark:shadow-none hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? "Saving..." : "Save Settings"}
                                </button>
                            )}
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
