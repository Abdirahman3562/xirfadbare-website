import { ChevronRight, Home, User, Mail, Phone, Camera, Shield, Save, Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../../config";
import { uploadImage, updateUserProfile } from "../../../api/userService";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    image: "",
    password: "",
    confirmPassword: "",
    is2FAEnabled: false
  });

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const token = loggedInUser.token;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          image: data.image || "",
          password: "",
          confirmPassword: "",
          is2FAEnabled: data.is2FAEnabled || false
        });
      } else {
        toast.error(data.message || "Failed to load profile");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      setUploading(true);
      const imageUrl = await uploadImage(uploadFormData, token);
      setFormData({ ...formData, image: imageUrl });

      // Immediate sync for student header too if it exists
      const updatedLocalStorageUser = { ...loggedInUser, image: imageUrl };
      localStorage.setItem("loggedInUser", JSON.stringify(updatedLocalStorageUser));
      window.dispatchEvent(new Event("userLogin"));

      toast.success("Profile image uploaded!");
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggle2FA = () => {
    setFormData({ ...formData, is2FAEnabled: !formData.is2FAEnabled });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setUpdating(true);
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      delete updateData.confirmPassword;

      const updatedUser = await updateUserProfile(updateData, token);

      const newUserContext = { ...updatedUser, token: token };
      localStorage.setItem("loggedInUser", JSON.stringify(newUserContext));

      toast.success("Profile updated successfully!");
      setUser(updatedUser);
      window.dispatchEvent(new Event("userLogin"));
    } catch (error) {
      toast.error(error.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    return img.startsWith("/") ? `http://localhost:5000${img}` : img;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 pt-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-[Inter]">

      <div className="flex gap-1 items-center text-sm text-gray-500">
        <Home className="w-4 h-4" />
        <ChevronRight className="w-4 h-4" />
        <span className="font-semibold text-emerald-600">Student Profile</span>
      </div>

      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your identity, security preferences, and student status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-emerald-600/5 group-hover:bg-emerald-600/10 transition-colors"></div>

            <div className="relative z-10">
              <div className="relative inline-block mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="relative">
                  {formData.image ? (
                    <img
                      src={getImageUrl(formData.image)}
                      alt="Profile"
                      className={`w-32 h-32 rounded-[2rem] object-cover border-4 border-white shadow-xl ring-1 ring-gray-100 group-hover:scale-[1.02] transition-transform duration-500 ${uploading ? 'opacity-50' : ''}`}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 border-4 border-white shadow-xl ring-1 ring-gray-100">
                      <User size={48} />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="animate-spin text-emerald-600" size={32} />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleUploadClick}
                  type="button"
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 p-3 bg-white text-emerald-600 rounded-2xl shadow-xl border border-gray-100 hover:bg-emerald-600 hover:text-white transition-all duration-300 transform hover:rotate-12 disabled:opacity-50"
                >
                  <Camera size={20} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{formData.firstName} {formData.lastName}</h2>
              <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 bg-emerald-50 inline-block px-3 py-1 rounded-full">Student Member</p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-bold text-gray-700">Online</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Verified</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ShieldCheck size={14} className="text-blue-500" />
                  <p className="text-xs font-bold text-gray-700">Student</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2FA Status Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] shadow-xl text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Shield size={24} className="text-emerald-400" />
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${formData.is2FAEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {formData.is2FAEnabled ? 'Protected' : 'At Risk'}
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">Two-Step Verification</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">Secure your student account by requiring an email verification code upon every login attempt.</p>

            <button
              type="button"
              onClick={toggle2FA}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${formData.is2FAEnabled
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
            >
              {formData.is2FAEnabled ? (
                <><Shield size={18} /> Disable 2FA</>
              ) : (
                <><ShieldCheck size={18} /> Enable 2FA</>
              )}
            </button>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-emerald-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900">Personal Data</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={18} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={18} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={18} />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900">Security</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl hover:shadow-emerald-200 flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
              <span className="uppercase tracking-widest text-xs">Save Account Changes</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
