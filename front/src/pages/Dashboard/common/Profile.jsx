import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Camera,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Save,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle2,
    Clock,
    LogOut,
    Lock,
    Home,
    ChevronRight
} from 'lucide-react';
import { getUserProfile, updateUserProfile, uploadImage } from '../../../api/userService';
import { toast } from 'react-toastify';
import { getImageUrl, formatDate } from '../../../utils/format';
import PremiumLoader from '../../../components/ui/PremiumLoader';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        image: '',
        is2FAEnabled: false,
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef(null);
    const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile(token);
            setProfileData({
                ...data,
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error("Failed to load profile data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle2FA = async () => {
        const newValue = !profileData.is2FAEnabled;
        try {
            setUpdating(true);
            const res = await updateUserProfile({ is2FAEnabled: newValue }, token);
            if (res) {
                setProfileData(prev => ({ ...prev, is2FAEnabled: newValue }));
                toast.success(`Two-Step Verification has been ${newValue ? 'enabled' : 'disabled'}!`);
                // Update local storage if necessary
                const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
                localStorage.setItem('loggedInUser', JSON.stringify({ ...loggedInUser, is2FAEnabled: newValue }));
                window.dispatchEvent(new Event('userLogin'));
            }
        } catch (error) {
            toast.error("Failed to update 2FA status");
        } finally {
            setUpdating(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const imagePath = await uploadImage(formData, token);

            // Update profile with new image path
            const res = await updateUserProfile({ image: imagePath }, token);
            if (res) {
                setProfileData(prev => ({ ...prev, image: imagePath }));
                toast.success("Profile image updated successfully!");
                // Update local storage
                const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
                localStorage.setItem('loggedInUser', JSON.stringify({ ...loggedInUser, image: imagePath }));
                window.dispatchEvent(new Event('userLogin'));
            }
        } catch (error) {
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (profileData.password && profileData.password !== profileData.confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        try {
            setUpdating(true);
            const dataToUpdate = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phone: profileData.phone,
            };

            if (profileData.password) {
                dataToUpdate.password = profileData.password;
            }

            const res = await updateUserProfile(dataToUpdate, token);
            if (res) {
                toast.success("Profile settings updated successfully!");
                setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));

                // Update local storage
                const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
                localStorage.setItem('loggedInUser', JSON.stringify({
                    ...loggedInUser,
                    firstName: res.firstName,
                    lastName: res.lastName,
                    email: res.email
                }));
                window.dispatchEvent(new Event('userLogin'));
            }
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const location = useLocation();
    const isAdminPath = location.pathname.startsWith('/admin');

    if (loading) {
        return <PremiumLoader text={null} />;
    }

    return (
        <div className={`space-y-8 ${isAdminPath ? '' : 'lg:mt-20 md:mt-20 mt-36'} animate-in fade-in duration-700 font-[Inter]`}>
            {/* Breadcrumb */}


            <div className="mb-2">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors">My Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 font-semibold italic mt-1 text-sm">Manage your personal information and account security settings.</p>
            </div>

            {/* Header Section */}
            <div className="bg-white/10 border border-gray-200 dark:bg-slate-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-2xl shadow-emerald-500/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden transition-all duration-500 backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 border-emerald-50 dark:border-slate-700 shadow-xl relative transition-transform duration-500 group-hover:scale-105">
                            {uploading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-emerald-600" size={24} />
                                </div>
                            )}
                            <img
                                src={getImageUrl(profileData.image)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=10b981&color=fff&size=128`;
                                }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <Camera size={24} />
                            </button>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-700 p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-600 transition-colors">
                            <div className={`w-3 h-3 rounded-full ${profileData.is2FAEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-slate-500'}`}></div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
                            {profileData.firstName} {profileData.lastName}
                        </h1>
                        <div className="flex lg:flex-row md:flex-row  flex-col items-center gap-3 mt-2">
                            <span className="px-4 py-1.5 bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-100 dark:shadow-none">
                                {profileData.role || 'User'}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center gap-1 transition-colors">
                                <Mail size={12} />
                                {profileData.email}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row  gap-4 relative z-10 w-full sm:w-auto justify-center sm:justify-end">
                    <div className="text-center flex gap-4 justify-center items-center sm:text-right">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ">Account Status</p>
                        <div className="flex items-center gap-2 justify-center sm:justify-end">
                            <span className="text-sm font-bold text-gray-900 dark:text-white transition-colors">Verified</span>
                            <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Settings */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    <form onSubmit={handleSubmit} className="bg-white/10 dark:bg-slate-800/50 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-6 sm:space-y-8 relative transition-colors duration-500">
                        <div className="flex items-center gap-4 border-b border-gray-50 dark:border-slate-800 pb-6 transition-colors">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors">
                                <User size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white transition-colors">Personal Information</h2>
                                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 transition-colors">Update your basic details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-semibold text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={profileData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-semibold text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-semibold text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-semibold text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                                    placeholder="+252 ..."
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-50 dark:border-slate-800 pt-8 space-y-6 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Lock size={18} />
                                </div>
                                <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest transition-colors">Change Password</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={profileData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-semibold text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                                            placeholder="Leave blank to keep same"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={profileData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-semibold text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-xl dark:shadow-none cursor-pointer shadow-emerald-200 disabled:opacity-50 active:scale-95"
                            >
                                {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                <span>{updating ? 'Updating...' : 'Save Profile Changes'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security & Stats */}
                <div className="space-y-8">
                    {/* 2FA Security Card */}
                    <div className="bg-white/10 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-6 overflow-hidden relative group transition-all duration-500">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${profileData.is2FAEnabled ? 'bg-emerald-500/10' : 'bg-amber-500/10'} rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-500`}></div>

                        <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-slate-800 relative z-10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profileData.is2FAEnabled ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'} transition-colors`}>
                                    {profileData.is2FAEnabled ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                </div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest transition-colors">Security</h3>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${profileData.is2FAEnabled ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'} transition-colors`}>
                                {profileData.is2FAEnabled ? 'Enhanced' : 'Basic'}
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white transition-colors">Two-Step Verification</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed transition-colors">
                                    A verification code will be sent to your email when you log in to ensure your account security.
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 transition-all hover:border-emerald-200 dark:hover:border-emerald-500/30">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${profileData.is2FAEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                    {profileData.is2FAEnabled ? 'Active' : 'Disabled'}
                                </span>
                                <button
                                    onClick={handleToggle2FA}
                                    disabled={updating}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${profileData.is2FAEnabled ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profileData.is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="bg-blue-50/50 dark:bg-blue-500/5 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 transition-colors">
                                <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold leading-relaxed flex items-start gap-2">
                                    <Shield size={14} className="shrink-0 mt-0.5" />
                                    <span>Two-step verification adds an extra layer of security to protects your account from unauthorized access.</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Account Stats */}
                    <div className="bg-gray-900 dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent opacity-50"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Clock className="text-emerald-400" size={18} />
                                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Activity Stats</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                    <span className="text-xs text-gray-400 font-medium font-[Inter]">Last Login</span>
                                    <span className="text-xs text-white font-bold">{formatDate(profileData.lastLogin, true)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                    <span className="text-xs text-gray-400 font-medium font-[Inter]">Member Since</span>
                                    <span className="text-xs text-white font-bold">{formatDate(profileData.createdAt)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                    <span className="text-xs text-gray-400 font-medium font-[Inter]">Account Role</span>
                                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{profileData.role}</span>
                                </div>
                            </div>

                            <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-white/10 group-hover:border-emerald-500/50">
                                <LogOut size={14} />
                                View Login History
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />
        </div >
    );
};

export default Profile;
